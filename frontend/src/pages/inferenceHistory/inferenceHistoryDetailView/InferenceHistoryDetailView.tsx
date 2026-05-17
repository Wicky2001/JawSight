import { useEffect, useCallback, useRef, useState } from "react";
import axios from "axios";
import { toastHelper } from "../../../helpers/toastHelper";
import { useParams } from "react-router-dom";
import {
  InnerPageBody,
  InnerPageWrapper,
} from "../../../helpers/ui/PageWrapper";
import NoDataFoundBanner from "../../../helpers/ui/NoDataFoundBanner";
import LoadingSpinner from "../../../helpers/ui/LoadingSpinner";
import PageHeader from "../../../helpers/ui/PageHeader";
import ImageCard from "./ImageCard";
import { ClipboardClock, ShieldAlert, RefreshCw } from "lucide-react";
import { api } from "../../../helpers/apiClient/apiClient";
import type {
  InferenceDetailViewResponseType,
  InferenceDetailViewRequestType,
} from ",,/../../shared/types/InferenceHistory/InferenceHistoryDetailView/InferenceDetalView.types";

const INFERENCE_DETAIL_VIEW_API_URL = "/inference-history/detail-view";

const InferenceHistoryDetailView = () => {
  const { patient_id, patient_name, inference_id } = useParams();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const requestId = useRef(0);

  const [signUrls, setSignUrls] =
    useState<InferenceDetailViewResponseType | null>(null);

  const cancelPendingRequest = useCallback(() => {
    debugger;
    abortControllerRef.current?.abort();
    return;
  }, []);

  const getInferenceHistoryDetail = useCallback(
    async ({ patient_id, inference_id }: InferenceDetailViewRequestType) => {
      const request_id = ++requestId.current;
      debugger;
      try {
        cancelPendingRequest();

        setLoading(true);
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const queryParams = {
          inference_id: inference_id,
          patient_id: patient_id,
        };

        const response = await api.get(
          INFERENCE_DETAIL_VIEW_API_URL,
          queryParams,
          {
            signal: controller.signal,
          },
        );

        debugger;
        if (request_id !== requestId.current) {
          return;
        }
        debugger;

        const signUrls = response.data as InferenceDetailViewResponseType;

        setSignUrls(signUrls);
      } catch (error) {
        if (axios.isCancel(error)) {
          debugger;
          console.log(request_id);
          return;
        }

        console.error("Failed to fetch inference history detail", error);
        toastHelper.error(
          "Failed to load inference details. Please try again.",
        );
      } finally {
        if (request_id === requestId.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    debugger;
    getInferenceHistoryDetail({
      patient_id: Number(patient_id),
      inference_id: String(inference_id),
    });

    return () => {
      debugger;
      cancelPendingRequest();
    };
  }, [refreshTrigger]);

  const handleRegenerateUrls = (): void => {
    setRegenerating(true);
    setRefreshTrigger((prev) => prev + 1);
    toastHelper.warning(
      "Secure image URLs are being regenerated for another 30 minutes.",
    );
  };

  return (
    <InnerPageWrapper>
      <PageHeader
        title={`Inference Report - ${patient_name}`}
        description="View detailed inference results and access generated images."
        Icon={ClipboardClock}
      />

      <InnerPageBody>
        {loading && !signUrls ? (
          <LoadingSpinner
            centered
            label="Loading patient results..."
            className="flex-1 py-12"
            spinnerClassName="w-10 h-10"
            labelClassName="text-slate-600"
          />
        ) : signUrls ? (
          <div className="h-full flex flex-col gap-8 pb-10">
            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ImageCard
                title="Left Profile"
                url={signUrls.left_sign_image_url}
              />
              <ImageCard
                title="Front Face"
                url={signUrls.front_sign_image_url}
              />
              <ImageCard
                title="Right Profile"
                url={signUrls.right_sign_image_url}
              />
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
                    disappear or fail to load, please click the button below to
                    generate new secure access URLs for another 30 minutes.
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
                {regenerating ? "Generating URLs..." : "Regenerate Image URLs"}
              </button>
            </div>
          </div>
        ) : (
          <NoDataFoundBanner
            icon={ClipboardClock}
            title="No inference data found"
            description="The backend did not return any inference history for this patient yet."
          />
        )}
      </InnerPageBody>
    </InnerPageWrapper>
  );
};

export default InferenceHistoryDetailView;
