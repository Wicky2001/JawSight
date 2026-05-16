import { useState, useEffect } from "react";
import {
  Info,
  CheckCircle,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "../../helpers/apiClient/apiClient";
import { dataURLtoFile } from "../../helpers/utils";
import { InfoCallout } from "../../helpers/ui/InfoCallout";
import { toastHelper } from "../../helpers/toastHelper";
import { UploadZone } from "./UploadZone";
import { LandmarkModal } from "./LandmarkModal";
import { useSocket } from "../../context/SocketContext";

const Inference = () => {
  const [images, setImages] = useState<{
    left: string | null;
    right: string | null;
    front: string | null;
  }>({ left: null, right: null, front: null });
  const [csvData, setCsvData] = useState<string | null>(null);
  const [savedPointsArray, setSavedPointsArray] = useState<any[] | null>(null);

  const [showLandmarkModal, setShowLandmarkModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { latestPrediction, clearPrediction } = useSocket();

  useEffect(() => {
    if (latestPrediction) {
      setIsSubmitting(false);

      if (latestPrediction.status === "success") {
        const { data } = latestPrediction;
        debugger;
        setImages({ left: data.left, right: data.right, front: data.front });
      }

      clearPrediction();
    }
  }, [latestPrediction]);

  const handleUpload = (id: "left" | "right" | "front", dataUrl: string) => {
    setImages((prev) => ({ ...prev, [id]: dataUrl }));
    if (id === "front") {
      setShowLandmarkModal(true);
    }
  };

  const handleRemove = (id: "left" | "right" | "front") => {
    setImages((prev) => ({ ...prev, [id]: null }));
    if (id === "front") {
      setCsvData(null);
      setSavedPointsArray(null);
    }
  };

  const handleSaveLandmarks = (csvString: string, rawPoints: any[]) => {
    setCsvData(csvString);
    setSavedPointsArray(rawPoints);
    setShowLandmarkModal(false);
    toastHelper.success("front.csv generated successfully!");
  };

  const isReadyToSubmit =
    images.left && images.right && images.front && csvData;

  const handleSubmit = async () => {
    if (!isReadyToSubmit) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("patientId", "1");
      formData.append(
        "leftImage",
        dataURLtoFile(images.left as string, "left"),
      );
      formData.append(
        "rightImage",
        dataURLtoFile(images.right as string, "right"),
      );
      formData.append(
        "frontImage",
        dataURLtoFile(images.front as string, "front"),
      );

      const csvBlob = new Blob([csvData as string], { type: "text/csv" });
      formData.append("frontCsv", csvBlob, "front.csv");

      const response = await api.post("/inference", formData);

      console.log("Server Response:", response.data);
      toastHelper.success("Inference data successfully submitted!");
    } catch (error: any) {
      console.error("Submission failed:", error);
      toastHelper.error(
        error.response?.data?.message ||
          "Failed to submit data. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showLandmarkModal && (
        <LandmarkModal
          imageSrc={images.front as string}
          onSave={handleSaveLandmarks}
          onClose={() => setShowLandmarkModal(false)}
          existingPoints={savedPointsArray}
        />
      )}

      {/* Main container remains h-full and handles the scrolling for the whole page */}
      <main className="max-w-7xl mx-auto px-6 py-8 h-full flex flex-col overflow-y-auto">
        <header className="mb-8 shrink-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            New Patient Inference
          </h1>
          <p className="text-slate-500 text-lg">
            Upload high-quality patient profiles to generate predictive
            mandibular outcomes.
          </p>
        </header>

        {/* Removed flex-1 and min-h-0 so the grid expands naturally based on its content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-7 flex flex-col">
            {/* Removed overflow-y-auto to stop inner scrolling. Added h-full to match the right card's height */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 shrink-0">
                <ImageIcon className="w-5 h-5 text-slate-400" />
                1. Side Profiles
              </h2>

              {/* Restored generous height (min-h-[320px]) since it can safely push the page down now */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 min-h-[320px]">
                <UploadZone
                  id="left"
                  title="Left Profile"
                  subtitle="90° lateral view"
                  imageDataUrl={images.left}
                  bgImage="/leftUploadPlaceHolder.png"
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                  onError={(message) => toastHelper.error(message)}
                />
                <UploadZone
                  id="right"
                  title="Right Profile"
                  subtitle="90° lateral view"
                  imageDataUrl={images.right}
                  bgImage="/rightUploadPlaceHolder.png"
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                  onError={(message) => toastHelper.error(message)}
                />
              </div>

              {/* Added mt-auto to push callouts to the bottom evenly */}
              <div className="space-y-3 shrink-0 mt-auto">
                <InfoCallout
                  icon={AlertCircle}
                  title="Required Framing"
                  type="warning"
                >
                  There must be a clear <strong>mid-side gap</strong> between
                  the tip of the chin and the edge of the image border. Do not
                  crop tightly around the jaw.
                </InfoCallout>
                <InfoCallout icon={Info} title="Optimization Tip" type="info">
                  Using a solid green background (e.g., <code>#22FF33</code>)
                  behind the patient dramatically improves silhouette edge
                  detection and model accuracy.
                </InfoCallout>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            {/* Removed overflow-y-auto. Added h-full */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 shrink-0">
                <ImageIcon className="w-5 h-5 text-slate-400" />
                2. Front Profile
              </h2>

              <div className="flex-1 mb-6 min-h-[320px]">
                <UploadZone
                  id="front"
                  title="Front Face"
                  subtitle="Directly facing camera. No tilt."
                  imageDataUrl={images.front}
                  bgImage="/frontUploadPlaceHolder.png"
                  hasCsv={!!csvData}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                  onError={(message) => toastHelper.error(message)}
                  onEditMarks={() => setShowLandmarkModal(true)}
                />
              </div>

              <div className="shrink-0 mt-auto">
                <InfoCallout
                  icon={CheckCircle}
                  title="Data Requirement"
                  type={csvData ? "success" : "warning"}
                >
                  {csvData
                    ? "Landmark data (front.csv) has been successfully generated and attached to this profile."
                    : "After uploading the front face, you must mark the required facial landmarks to generate the front.csv file."}
                </InfoCallout>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="shrink-0 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            {!isReadyToSubmit ? (
              <p className="text-slate-500 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Please upload all three images and mark front landmarks to
                proceed.
              </p>
            ) : (
              <p className="text-emerald-600 font-medium text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                All images and front.csv ready for inference.
              </p>
            )}
          </div>

          <button
            disabled={!isReadyToSubmit || isSubmitting}
            onClick={handleSubmit}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-white transition-all duration-200 shadow-sm min-w-[220px]
              ${
                !isReadyToSubmit || isSubmitting
                  ? "bg-slate-300 cursor-not-allowed opacity-70"
                  : "bg-teal-600 hover:bg-teal-700 hover:shadow-md active:scale-95 cursor-pointer"
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading Data...
              </>
            ) : (
              "Submit for Inference"
            )}
          </button>
        </div>
      </main>
    </>
  );
};

export default Inference;
