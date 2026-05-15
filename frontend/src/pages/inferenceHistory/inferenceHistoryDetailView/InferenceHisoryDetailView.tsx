import { useEffect, useCallback, useRef, useState } from "react";
import axios from "axios";
import { Toast } from "../../../helpers/ui/Toast";
import { useParams } from "react-router-dom";
import PageHeader from "../../../helpers/ui/PageHeader";
import ImageCard from "./ImageCard";
import { ClipboardClock, ShieldAlert, RefreshCw, Loader2 } from "lucide-react";
import { api } from "../../../helpers/apiClient/apiClient";

const INFERENCE_DETAIL_API_URL = "/inference/history/detail";

const InferenceHistoryDetailView = () => {
  const { patient_id, patient_name, inference_id } = useParams();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const [inferenceDetail, setInferenceDetail] = useState<any>(null);

  const cancelPendingRequest = useCallback(() => {
    debugger;
    abortControllerRef.current?.abort();
    return;
  }, []);

  const getInferenceHistoryDetail = useCallback(
    async (patient_id: number, inference_id: string) => {
      try {
        cancelPendingRequest();

        setLoading(true);
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const queryParams = {
          inference_id: inference_id,
          patient_id: patient_id,
        };

        debugger;

        const response = await api.get(INFERENCE_DETAIL_API_URL, queryParams, {
          signal: controller.signal,
        });

        setInferenceDetail(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error("Failed to fetch inference history detail", error);
        Toast({
          message: "Failed to load inference details. Please try again.",
          error: true,
          onClose: () => {},
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    debugger;
    getInferenceHistoryDetail(Number(patient_id), String(inference_id));

    return () => {
      debugger;
      cancelPendingRequest();
    };
  }, [refreshTrigger]);

  const handleRegenerateUrls = (): void => {
    setRegenerating(true);
    setRefreshTrigger((prev) => prev + 1);

    Toast({
      message:
        "Secure image URLs regenerated successfully for another 30 minutes.",
      error: false,
      onClose: () => {},
    });
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col overflow-y-auto">
      <div className="w-full flex flex-col p-4 sm:p-6 overflow-hidden h-full min-h-0 max-w-7xl mx-auto">
        <PageHeader
          title={`Inference Details for ${patient_name || "Patient"}`}
          description="View detailed predictive mandibular outcomes."
          Icon={ClipboardClock}
        />

        <div className="flex-1 mt-6 flex flex-col">
          {/* Loading State */}
          {loading && !inferenceDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-teal-600">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-slate-600 font-medium animate-pulse">
                Loading patient results...
              </p>
            </div>
          ) : inferenceDetail ? (
            <div className="flex flex-col gap-8 pb-10">
              {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ImageCard title="Left Profile" url={inferenceDetail.left} />
                <ImageCard title="Front Face" url={inferenceDetail.front} />
                <ImageCard title="Right Profile" url={inferenceDetail.right} />
              </div>

              {/* Security Warning & Regeneration Action */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between transition-all">
                <div className="flex gap-4 items-start">
                  <ShieldAlert className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-lg mb-1">
                      Temporary Secure Access
                    </h4>
                    <p className="text-amber-800 text-sm leading-relaxed max-w-3xl">
                      <strong>Note:</strong> We apply extra security steps to
                      protect patient privacy, hence these images are only
                      available for <strong>30 minutes</strong>. If the images
                      disappear or fail to load, please click the button below
                      to generate new secure access URLs for another 30 minutes.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRegenerateUrls}
                  disabled={regenerating || loading}
                  className={`shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm
                    ${
                      regenerating || loading
                        ? "bg-amber-200 text-amber-700 cursor-not-allowed"
                        : "bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-100 hover:shadow-md active:scale-95"
                    }`}
                >
                  <RefreshCw
                    className={`w-5 h-5 ${regenerating ? "animate-spin" : ""}`}
                  />
                  {regenerating
                    ? "Generating URLs..."
                    : "Regenerate Image URLs"}
                </button>
              </div>
            </div>
          ) : (
            /* Empty/Error State */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
              <ClipboardClock className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">
                No inference data found.
              </p>
              <p className="text-sm">
                The results for this patient may not be ready yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InferenceHistoryDetailView;
