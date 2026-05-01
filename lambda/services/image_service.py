import io
import cv2
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from rembg import remove, new_session
from config import settings
from utils.helpers import logger
from services.s3_service import read_file_from_s3
from models.exceptions import UnsuitableImageError

# ==============================================================================
# MODELS
# ==============================================================================

class MandibularResidualMLP(nn.Module):
    def __init__(self, input_size=100, output_size=100):
        super(MandibularResidualMLP, self).__init__()
        self.feature_extractor = nn.Sequential(
            nn.Linear(input_size, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, output_size)
        )

    def forward(self, x):
        delta = self.feature_extractor(x)
        return x + delta

class FrontFacePredictionModel(nn.Module):
    def __init__(self, input_size=70, output_size=70):
        super(FrontFacePredictionModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 256),
            nn.LayerNorm(256),
            nn.ReLU(),
            nn.GELU(),
            nn.Dropout(0.15),
            nn.Linear(256, 512),
            nn.LayerNorm(512),
            nn.ReLU(),
            nn.GELU(),
            nn.Dropout(0.20),
            nn.Linear(512, 512),
            nn.LayerNorm(512),
            nn.ReLU(),
            nn.GELU(),
            nn.Dropout(0.20),
            nn.Linear(512, 256),
            nn.LayerNorm(256),
            nn.ReLU(),
            nn.GELU(),
            nn.Dropout(0.15),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.GELU(),
            nn.Linear(128, output_size)
        )

    def forward(self, x):
        return self.network(x)

# Global instances (Loaded on demand or at module level)
_rembg_session = None
_right_model = None
_left_model = None
_front_face_model = None

def get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        logger.info("✅ SUCCESS: Loading Rembg Session...")
        _rembg_session = new_session("u2net_human_seg")
    return _rembg_session

def load_models():
    global _right_model, _left_model, _front_face_model
    if _right_model is None:
        logger.info("✅ SUCCESS: Loading side face Models...")
        _right_model = MandibularResidualMLP()
        _left_model = MandibularResidualMLP()
        _right_model.load_state_dict(torch.load(settings.RIGHT_MODEL_PATH, map_location=torch.device('cpu')))
        _left_model.load_state_dict(torch.load(settings.LEFT_MODEL_PATH, map_location=torch.device('cpu')))
        _right_model.eval()
        _left_model.eval()

    if _front_face_model is None:
        logger.info("✅ SUCCESS: Loading front face Model...")
        _front_face_model = FrontFacePredictionModel()
        _front_face_model.load_state_dict(torch.load(settings.FRONT_MODEL_PATH, map_location=torch.device('cpu')))
        _front_face_model.eval()

    return _right_model, _left_model, _front_face_model

# ==============================================================================
# IMAGE PREPROCESSING
# ==============================================================================

def analyze_image(img):
    """Calculates brightness and contrast for threshold checking."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return np.mean(gray), np.std(gray)

def apply_medical_enhancement(img):
    """Applies exact clinical enhancement suite."""
    brightness, contrast = analyze_image(img)
    processed = img.copy()
    
    if settings.USE_CLAHE and (brightness < settings.BRIGHTNESS_THRESHOLD or contrast < settings.CONTRAST_THRESHOLD):
        lab = cv2.cvtColor(processed, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=settings.CLAHE_CLIP_LIMIT, tileGridSize=settings.CLAHE_TILE_GRID)
        processed = cv2.cvtColor(cv2.merge((clahe.apply(l), a, b)), cv2.COLOR_LAB2BGR)
    
    if settings.USE_SHARPEN:
        gaussian = cv2.GaussianBlur(processed, settings.GAUSSIAN_KERNEL, settings.GAUSSIAN_SIGMA)
        processed = cv2.addWeighted(processed, settings.SHARPEN_ALPHA, gaussian, settings.SHARPEN_BETA, settings.SHARPEN_GAMMA)
    
    return processed

def preprocess_image(raw_img_bgr):
    """Replicates the exact scaling and enhancement loop used in training."""
    h, w = raw_img_bgr.shape[:2]
    factor = 1.0 if (w > settings.MAX_IMAGE_SIZE or h > settings.MAX_IMAGE_SIZE) else settings.UPSCALE_FACTOR
    scaled_img = cv2.resize(raw_img_bgr, None, fx=factor, fy=factor, interpolation=settings.UPSCALE_INTERPOLATION)
    return apply_medical_enhancement(scaled_img)

# ==============================================================================
# DATA EXTRACTION HELPERS
# ==============================================================================

def get_silhouette_and_contour(img_bgr, session):
    if img_bgr is None: return None, None
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    rgba = remove(img_rgb, session=session)
    _, sil = cv2.threshold(rgba[:, :, 3], settings.MASK_THRESHOLD, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(sil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    return sil, max(contours, key=cv2.contourArea) if contours else None

def detect_nose_anchor(img_bgr, face_looks_left, session):
    sil, cnt = get_silhouette_and_contour(img_bgr, session)
    if cnt is None: return None, None
    pts = cnt[:, 0, :]
    x, y = pts[:, 0], pts[:, 1]
    fallback_idx = np.where(x == (x.min() if face_looks_left else x.max()))[0][0]
    fallback_nose = (int(x[fallback_idx]), int(y[fallback_idx]))
    img_h = img_bgr.shape[0]
    mid_x = int(x.min() + 0.5 * (x.max() - x.min()))
    band_top, band_bottom = int(0.35 * img_h), int(0.65 * img_h)
    valid_pts = pts[(x < mid_x if face_looks_left else x > mid_x) & (y >= band_top) & (y <= band_bottom)]
    if len(valid_pts) < 10: return fallback_nose, cnt
    curve = []
    for yy in range(band_top, band_bottom + 1):
        row = valid_pts[valid_pts[:, 1] == yy]
        if len(row) > 0:
            curve.append((yy, row[:, 0].min() if face_looks_left else row[:, 0].max()))
    if len(curve) < 5: return fallback_nose, cnt
    curve = np.array(curve, dtype=np.float32)
    x_curve = cv2.GaussianBlur(curve[:, 1].reshape(-1, 1), (1, 11), 0).flatten()
    dx = np.gradient(x_curve)
    score = (-x_curve if face_looks_left else x_curve) + 10.0 * np.abs(np.gradient(dx))
    idx = np.argmax(score)
    return (int(x_curve[idx]), int(curve[idx, 0])), cnt

def get_native_trace(cnt, nose_pt, target_w, target_h):
    pts = cnt[:, 0, :].astype(np.float32)
    idx_nose = np.argmin(np.sum((pts - nose_pt)**2, axis=1))
    window = min(21, len(pts))
    f_y = sum(pts[(idx_nose + i) % len(pts), 1] - nose_pt[1] for i in range(1, window))
    b_y = sum(pts[(idx_nose - i) % len(pts), 1] - nose_pt[1] for i in range(1, window))
    step = 1 if f_y >= b_y else -1
    selected = []
    curr_idx = idx_nose
    while True:
        pt = pts[curr_idx]
        selected.append(pt)
        if pt[1] >= target_h - settings.IMAGE_BORDER_MARGIN or pt[1] <= settings.IMAGE_BORDER_MARGIN:
            break
        curr_idx = (curr_idx + step) % len(pts)
        if curr_idx == idx_nose: break
    return np.array(selected)

def resample_points(points, num):
    if len(points) < 2: return np.zeros((num, 2))
    dist = np.sqrt((np.diff(points, axis=0)**2).sum(axis=1))
    cum_dist = np.insert(np.cumsum(dist), 0, 0)
    return np.column_stack((np.interp(np.linspace(0, cum_dist[-1], num), cum_dist, points[:, 0]),
                            np.interp(np.linspace(0, cum_dist[-1], num), cum_dist, points[:, 1])))

# ==============================================================================
# MAIN PIPELINES
# ==============================================================================

def process_single_image_left_or_right(bucket_key, side):
    logger.info("✅ SUCCESS: process_single_image_left_or_right started. side=%s, key=%s", side, bucket_key)
    
    right_model, left_model, _ = load_models()
    is_left = (side == "left")
    model = left_model if is_left else right_model
        
    image_bytes = read_file_from_s3(bucket_key)
    if not image_bytes:
        raise UnsuitableImageError("Failed to retrieve image from S3.")
                
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise UnsuitableImageError("Failed to decode image. The file might be corrupted.")
        
    img_bgr = preprocess_image(img_bgr) 
    h, w = img_bgr.shape[:2]
    
    nose_pt, cnt = detect_nose_anchor(img_bgr, is_left, get_rembg_session())
    if not nose_pt:
        raise UnsuitableImageError("Could not detect nose/silhouette.")

    raw_trace = get_native_trace(cnt, nose_pt, w, h)
    scale_master = np.sqrt(w**2 + h**2)
    norm_trace = (raw_trace - np.array(nose_pt)) / scale_master
    resampled_50 = resample_points(norm_trace, settings.NUM_RESAMPLED_POINTS)
    
    input_tensor = torch.tensor(resampled_50.flatten(), dtype=torch.float32).unsqueeze(0)
    with torch.no_grad():
        predicted_norm = model(input_tensor).squeeze(0).numpy()
    
    predicted_points = predicted_norm.reshape(50, 2)
    pred_pixel_coords = (predicted_points * scale_master) + np.array(nose_pt)
    pre_pixel_coords = (resampled_50 * scale_master) + np.array(nose_pt)
    
    output_img = img_bgr.copy()
    cv2.polylines(output_img, [pre_pixel_coords.astype(np.int32)], isClosed=False, color=settings.FRONT_FACE_COLOR_PRE_OP, thickness=settings.FRONT_FACE_THICKNESS_LINE)
    cv2.polylines(output_img, [pred_pixel_coords.astype(np.int32)], isClosed=False, color=settings.FRONT_FACE_COLOR_POST_OP, thickness=settings.FRONT_FACE_THICKNESS_LINE)
    cv2.drawMarker(output_img, nose_pt, settings.FRONT_FACE_COLOR_ANCHOR, markerType=cv2.MARKER_TILTED_CROSS, markerSize=settings.FRONT_FACE_RADIUS_ANCHOR, thickness=settings.FRONT_FACE_THICKNESS_LINE)
    
    # Legend
    scale_mult = max(1.0, w / 1000.0) 
    font = cv2.FONT_HERSHEY_SIMPLEX
    f_scale = 0.7 * scale_mult
    f_thick = int(2 * scale_mult)
    box_w, box_h, margin = int(300 * scale_mult), int(160 * scale_mult), int(30 * scale_mult)
    x_start = w - box_w - margin if is_left else margin
    y_start = margin
    
    overlay = output_img.copy()
    cv2.rectangle(overlay, (x_start, y_start), (x_start + box_w, y_start + box_h), settings.FRONT_FACE_COLOR_LEGEND_BG, -1)
    cv2.addWeighted(overlay, 0.5, output_img, 0.5, 0, output_img) 
    
    text_x = x_start + int(60 * scale_mult)
    row1_y, row2_y, row3_y = y_start + int(45 * scale_mult), y_start + int(95 * scale_mult), y_start + int(140 * scale_mult)
    
    cv2.line(output_img, (x_start + int(15 * scale_mult), row1_y - int(5 * scale_mult)), (x_start + int(45 * scale_mult), row1_y - int(5 * scale_mult)), settings.FRONT_FACE_COLOR_PRE_OP, settings.FRONT_FACE_THICKNESS_LINE)
    cv2.putText(output_img, "Pre-Surgery", (text_x, row1_y), font, f_scale, settings.FRONT_FACE_COLOR_TEXT, f_thick)
    cv2.line(output_img, (x_start + int(15 * scale_mult), row2_y - int(5 * scale_mult)), (x_start + int(45 * scale_mult), row2_y - int(5 * scale_mult)), settings.FRONT_FACE_COLOR_POST_OP, settings.FRONT_FACE_THICKNESS_LINE)
    cv2.putText(output_img, "AI Prediction", (text_x, row2_y), font, f_scale, settings.FRONT_FACE_COLOR_TEXT, f_thick)
    cv2.drawMarker(output_img, (x_start + int(30 * scale_mult), row3_y - int(5 * scale_mult)), settings.FRONT_FACE_COLOR_ANCHOR, markerType=cv2.MARKER_TILTED_CROSS, markerSize=settings.FRONT_FACE_RADIUS_ANCHOR, thickness=settings.FRONT_FACE_THICKNESS_LINE)
    cv2.putText(output_img, "Nose Anchor", (text_x, row3_y), font, f_scale, settings.FRONT_FACE_COLOR_TEXT, f_thick)

    return side, output_img

def process_front_face(image_key, csv_key):
    logger.info("✅ SUCCESS: process_front_face started. image_key=%s, csv_key=%s", image_key, csv_key)
    
    _, _, front_face_model = load_models()
    csv_bytes = read_file_from_s3(csv_key)
    if not csv_bytes: raise ValueError("ERROR MESSAGE: No csv data found")
    csv_string = csv_bytes.decode('utf-8')
    
    image_bytes = read_file_from_s3(image_key)
    if not image_bytes: raise ValueError("ERROR MESSAGE: No image data found")
        
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None: raise UnsuitableImageError("ERROR MESSAGE: Failed to decode image.")
    
    img_bgr = preprocess_image(img_bgr) 
    h, w = img_bgr.shape[:2]
    
    df = pd.read_csv(io.StringIO(csv_string))
    nose_pt = (int(df["Nose_X_Px"].iloc[0]), int(df["Nose_Y_Px"].iloc[0]))
    scale_master = np.sqrt(df["Image_W"].iloc[0]**2 + df["Image_H"].iloc[0]**2)
    
    df_filtered = df[df["Landmark_MP_ID"] != 1].sort_values(by="Landmark_MP_ID").copy()
    fin_coords = df_filtered[["Normalized_X", "Normalized_Y"]].values.astype(np.float32)
    if len(fin_coords) != 35: raise ValueError(f"Expected 35 landmarks, got {len(fin_coords)}")
    
    input_tensor = torch.tensor(fin_coords.flatten()).unsqueeze(0)
    pre_pixel_coords = df_filtered[["Refined_X_Px", "Refined_Y_Px"]].values

    with torch.no_grad():
        predicted_norm = front_face_model(input_tensor).squeeze(0).numpy()
    
    predicted_points_norm = predicted_norm.reshape(35, 2)
    pred_pixel_coords = (predicted_points_norm * scale_master) + np.array(nose_pt)
    
    output_img = img_bgr.copy()
    mp_ids = df_filtered["Landmark_MP_ID"].values
    pre_dict = {int(mp_id): pt for mp_id, pt in zip(mp_ids, pre_pixel_coords)}
    pred_dict = {int(mp_id): pt for mp_id, pt in zip(mp_ids, pred_pixel_coords)}

    pre_jaw = np.array([pre_dict[i] for i in settings.JAW_ORDER], dtype=np.int32)
    pred_jaw = np.array([pred_dict[i] for i in settings.JAW_ORDER], dtype=np.int32)
    pre_lips = np.array([pre_dict[i] for i in settings.LIP_ORDER], dtype=np.int32)
    pred_lips = np.array([pred_dict[i] for i in settings.LIP_ORDER], dtype=np.int32)
    
    cv2.polylines(output_img, [pre_jaw], False, settings.FRONT_FACE_COLOR_PRE_OP, settings.FRONT_FACE_THICKNESS_LINE)
    cv2.polylines(output_img, [pre_lips], True, settings.FRONT_FACE_COLOR_PRE_OP, settings.FRONT_FACE_THICKNESS_LINE)
    for pt in pre_pixel_coords.astype(int): cv2.circle(output_img, tuple(pt), settings.FRONT_FACE_RADIUS_POINT, settings.FRONT_FACE_COLOR_PRE_OP, -1)
        
    cv2.polylines(output_img, [pred_jaw], False, settings.FRONT_FACE_COLOR_POST_OP, settings.FRONT_FACE_THICKNESS_LINE)
    cv2.polylines(output_img, [pred_lips], True, settings.FRONT_FACE_COLOR_POST_OP, settings.FRONT_FACE_THICKNESS_LINE)
    for pt in pred_pixel_coords.astype(int): cv2.circle(output_img, tuple(pt), settings.FRONT_FACE_RADIUS_POINT, settings.FRONT_FACE_COLOR_POST_OP, -1)
        
    cv2.drawMarker(output_img, nose_pt, settings.FRONT_FACE_COLOR_ANCHOR, cv2.MARKER_TILTED_CROSS, settings.FRONT_FACE_RADIUS_ANCHOR, 3)
    
    # Legend
    scale_mult = max(1.0, w / 1000.0)
    font, f_scale, f_thick = cv2.FONT_HERSHEY_SIMPLEX, 0.7 * scale_mult, int(2 * scale_mult)
    box_w, box_h, margin = int(320 * scale_mult), int(160 * scale_mult), int(30 * scale_mult)
    x_start, y_start = w - box_w - margin, margin
    overlay = output_img.copy()
    cv2.rectangle(overlay, (x_start, y_start), (x_start + box_w, y_start + box_h), settings.FRONT_FACE_COLOR_LEGEND_BG, -1)
    cv2.addWeighted(overlay, 0.5, output_img, 0.5, 0, output_img)
    
    text_x = x_start + int(75 * scale_mult)
    row1_y, row2_y, row3_y = y_start + int(45 * scale_mult), y_start + int(95 * scale_mult), y_start + int(140 * scale_mult)
    
    line_y1 = row1_y - int(5 * scale_mult)
    cv2.line(output_img, (x_start + int(15 * scale_mult), line_y1), (x_start + int(60 * scale_mult), line_y1), settings.FRONT_FACE_COLOR_PRE_OP, settings.FRONT_FACE_THICKNESS_LINE)
    cv2.circle(output_img, (x_start + int(37 * scale_mult), line_y1), settings.FRONT_FACE_RADIUS_POINT, settings.FRONT_FACE_COLOR_PRE_OP, -1)
    cv2.putText(output_img, "Doctor's Marks", (text_x, row1_y), font, f_scale, settings.FRONT_FACE_COLOR_TEXT, f_thick)
    
    line_y2 = row2_y - int(5 * scale_mult)
    cv2.line(output_img, (x_start + int(15 * scale_mult), line_y2), (x_start + int(60 * scale_mult), line_y2), settings.FRONT_FACE_COLOR_POST_OP, settings.FRONT_FACE_THICKNESS_LINE)
    cv2.circle(output_img, (x_start + int(37 * scale_mult), line_y2), settings.FRONT_FACE_RADIUS_POINT, settings.FRONT_FACE_COLOR_POST_OP, -1)
    cv2.putText(output_img, "AI Prediction", (text_x, row2_y), font, f_scale, settings.FRONT_FACE_COLOR_TEXT, f_thick)
    
    cv2.drawMarker(output_img, (x_start + int(37 * scale_mult), row3_y - int(5 * scale_mult)), settings.FRONT_FACE_COLOR_ANCHOR, cv2.MARKER_TILTED_CROSS, settings.FRONT_FACE_RADIUS_ANCHOR , 3)
    cv2.putText(output_img, "Nose Anchor", (text_x, row3_y), font, f_scale, settings.FRONT_FACE_COLOR_TEXT, f_thick)

    return output_img

def process_images(input_images_details):
    logger.info("✅ SUCCESS: process_images started with %d inputs", len(input_images_details))
    output_data = {"left_image": None, "right_image": None, "front_image": None}
      
    for image_data in input_images_details:
        side = image_data.get("side")
        bucket_key = image_data.get("bucket_key")
        
        if side in ["left", "right"]:
            side_processed, output_img = process_single_image_left_or_right(bucket_key, side)
            output_data[f"{side_processed}_image"] = output_img
        else:
            output_data["front_image"] = process_front_face(bucket_key, csv_key=image_data.get("csv_key"))

    logger.info("✅ SUCCESS: process_images completed")
    return output_data
