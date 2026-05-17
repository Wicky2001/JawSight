import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toastHelper } from "../../helpers/toastHelper";
import { fetchInferenceHistory } from "./InferenceHistory.service";
import type {
  GetInferenceHistoryResponseType,
  InferenceHistoryRowType,
} from "../../../../shared/types/InferenceHistory/InferenceHistory.types.js";
import { useSocket } from "../../context/SocketContext";

const DEFAULT_LIMIT = 50;

export const useInferenceHistory = (initialLimit = DEFAULT_LIMIT) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<InferenceHistoryRowType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastSynced, setLastSynced] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | undefined>();

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const { inferenceNotificationCount } = useSocket();

  const requestParams = useMemo(
    () => ({
      page,
      limit: initialLimit,
      search: searchText.trim() || undefined,
      sortField,
      sortOrder,
    }),
    [page, initialLimit, searchText, sortField, sortOrder],
  );

  const cancelPendingRequest = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const loadInferenceHistory = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    cancelPendingRequest();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    try {
      const result: GetInferenceHistoryResponseType =
        await fetchInferenceHistory(requestParams, {
          signal: controller.signal,
        });

      const nextRows = result.rows.map((item) => ({
        ...item,
      }));

      const mode = requestParams.page === 1 ? "replace" : "append";

      setRows((currentRows) =>
        mode === "append" ? [...currentRows, ...nextRows] : nextRows,
      );
      setTotalRecords(result.meta.total);
      setLastSynced(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }

      console.error("Failed to fetch inference history", error);
      toastHelper.error("Failed to load inference history. Please try again.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [requestParams, cancelPendingRequest]);

  // Listen for inference notifications to trigger refresh
  useEffect(() => {
    if (inferenceNotificationCount > 0) {
      setPage(1);
      setRows([]);
      setTotalRecords(0);
      setRefreshToken((current) => current + 1);
    }
  }, [inferenceNotificationCount]);

  useEffect(() => {
    loadInferenceHistory();

    return () => {
      cancelPendingRequest();
    };
  }, [loadInferenceHistory, cancelPendingRequest, refreshToken]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loading || rows.length >= totalRecords) {
      return;
    }
    setPage((currentPage) => currentPage + 1);
  }, [loading, rows.length, totalRecords]);

  const handleSortChange = useCallback(
    (field: string, order: "asc" | "desc" | null) => {
      setSortField(order ? field : undefined);
      setSortOrder(order ? (order.toUpperCase() as "ASC" | "DESC") : undefined);
      setPage(1);
    },
    [],
  );

  return {
    loading,
    rows,
    totalRecords,
    lastSynced,
    searchText,
    handleSearchChange,
    handleLoadMore,
    handleSortChange,
  };
};
