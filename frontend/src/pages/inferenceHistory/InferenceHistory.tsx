import { Table } from "../../helpers/ui/TableComponent";
import type { ColumnDef } from "../../helpers/ui/TableComponent";
import PageHeader from "../../helpers/ui/PageHeader";
import { History } from "lucide-react";
import { useInferenceHistory } from "./UseInferenceHistory";
import type { InferenceHistoryRowType } from "../../../../shared/types/inferenceHistory.types";
import { useNavigate } from "react-router-dom";

const InferenceHistory = () => {
  const {
    loading,
    rows,
    totalRecords,
    lastSynced,
    handleSearchChange,
    handleLoadMore,
    handleSortChange,
  } = useInferenceHistory();

  const navigate = useNavigate();

  const columns: ColumnDef[] = [
    {
      headerName: "Patient",
      field: "patient_name",
      width: 220,
      sortable: true,
    },
    { headerName: "Iteration Code", field: "iteration_code", width: 180 },
    { headerName: "Status", field: "status", width: 180, sortable: true },
    {
      headerName: "Start Time",
      field: "createdAt",
      width: 220,
      sortable: true,
    },
    { headerName: "End Time", field: "updatedAt", width: 220, sortable: true },
  ];

  const handleRowClick = (row: InferenceHistoryRowType) => {
    if (row.patient_id && row.iteration_code && row.patient_name) {
      const pid = encodeURIComponent(String(row.patient_id));
      const pname = encodeURIComponent(String(row.patient_name));
      const itr = encodeURIComponent(String(row.iteration_code));

      navigate(`/inference-history-detail-view/${pid}/${pname}/${itr}`);
    }
    return;
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col min-h-0 overflow-hidden">
      <div className="w-full flex flex-col p-4 sm:p-6 overflow-hidden h-full min-h-0">
        <PageHeader
          title="Inference History"
          description="Monitor past inferences and generation processes."
          Icon={History}
        />

        <div className="w-full overflow-hidden mt-4 h-full flex-1 min-h-0">
          <Table
            cols={columns}
            rows={rows}
            loading={loading}
            totalRecords={totalRecords}
            lastSynced={lastSynced}
            showEdit={false}
            showDelete={false}
            onSearchChange={handleSearchChange}
            onLoadMoreRecords={handleLoadMore}
            onSortChange={handleSortChange}
            clickable={true}
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </div>
  );
};

export default InferenceHistory;
