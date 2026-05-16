import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchPatients } from "./Patients.service";
import type {
  GetPatientsResponseType,
  PatientsRowType,
} from "../../../../shared/types/Patients/Patients.types.js";

const DEFAULT_LIMIT = 50;

export const usePatients = (initialLimit = DEFAULT_LIMIT) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PatientsRowType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastSynced, setLastSynced] = useState("");

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

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

  const loadPatients = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    cancelPendingRequest();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    try {
      const result: GetPatientsResponseType = await fetchPatients(
        requestParams,
        {
          signal: controller.signal,
        },
      );

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

      console.error("Failed to fetch patients", error);
      toast.error("Failed to load patients. Please try again.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [requestParams, cancelPendingRequest]);

  useEffect(() => {
    loadPatients();

    return () => {
      cancelPendingRequest();
    };
  }, [loadPatients, cancelPendingRequest, refreshTrigger]);

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

  const refreshPatients = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  return {
    loading,
    rows,
    totalRecords,
    lastSynced,
    searchText,
    handleSearchChange,
    handleLoadMore,
    handleSortChange,
    refreshPatients,
  };
};
