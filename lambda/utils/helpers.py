import cv2
import numpy as np
from rembg import remove
from utils.logger import logger
from config.settings import (
    MASK_THRESHOLD, IMAGE_BORDER_MARGIN, 
    USE_CLAHE, CLAHE_CLIP_LIMIT, CLAHE_TILE_GRID,
    USE_SHARPEN, GAUSSIAN_KERNEL, GAUSSIAN_SIGMA,
    SHARPEN_ALPHA, SHARPEN_BETA, SHARPEN_GAMMA,
    MAX_IMAGE_SIZE
)

def preprocess_image(img_bgr):
    """
    Applies common preprocessing steps configured via settings.
    """
    try:
        h, w = img_bgr.shape[:2]
        
        # simple resize if larger than maximum dimension
        if max(h, w) > MAX_IMAGE_SIZE:
            scale = MAX_IMAGE_SIZE / float(max(h, w))
            img_bgr = cv2.resize(img_bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

        if USE_CLAHE:
            lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
            clahe = cv2.createCLAHE(clipLimit=CLAHE_CLIP_LIMIT, tileGridSize=CLAHE_TILE_GRID)
            lab[:,:,0] = clahe.apply(lab[:,:,0])
            img_bgr = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
            
        if USE_SHARPEN:
            blurred = cv2.GaussianBlur(img_bgr, GAUSSIAN_KERNEL, GAUSSIAN_SIGMA)
            img_bgr = cv2.addWeighted(img_bgr, SHARPEN_ALPHA, blurred, SHARPEN_BETA, SHARPEN_GAMMA)

        return img_bgr
    except Exception as e:
        logger.error("Error preprocessing image: %s", e)
        return img_bgr

def get_silhouette_and_contour(img_bgr, session):
    logger.info("🔧 INFO: get_silhouette_and_contour started")
    if img_bgr is None: return None, None
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    rgba = remove(img_rgb, session=session)
    _, sil = cv2.threshold(rgba[:, :, 3], MASK_THRESHOLD, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(sil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    return sil, max(contours, key=cv2.contourArea) if contours else None

def detect_nose_anchor(img_bgr, face_looks_left, session):
    logger.info("🔧 INFO: detect_nose_anchor started. face_looks_left=%s", face_looks_left)
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
    """Traces skin boundary until it hits the Y-axis margins."""
    logger.info("🔧 INFO: get_native_trace started")
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
        if pt[1] >= target_h - IMAGE_BORDER_MARGIN or pt[1] <= IMAGE_BORDER_MARGIN:
            break
        curr_idx = (curr_idx + step) % len(pts)
        if curr_idx == idx_nose: break # Safety failsafe
    return np.array(selected)

def resample_points(points, num):
    logger.info("🔧 INFO: resample_points started for num=%d", num)
    if len(points) < 2: return np.zeros((num, 2))
    dist = np.sqrt((np.diff(points, axis=0)**2).sum(axis=1))
    cum_dist = np.insert(np.cumsum(dist), 0, 0)
    return np.column_stack((np.interp(np.linspace(0, cum_dist[-1], num), cum_dist, points[:, 0]),
                            np.interp(np.linspace(0, cum_dist[-1], num), cum_dist, points[:, 1])))
