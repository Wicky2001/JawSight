import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../helpers/ui/TableComponent";
import type { ColumnDef } from "../../helpers/ui/TableComponent";
import PageHeader from "../../helpers/ui/PageHeader";
import SideBar from "../../helpers/ui/SideBar";
import { Users } from "lucide-react";
import { toastHelper } from "../../helpers/toastHelper";
import { usePatients } from "./UsePatients";
import type { PatientsRowType } from "../../../../shared/types/Patients/Patients.types";
import type { PatientsDetailViewPatientInfoType } from "../../../../shared/types/Patients/PatientsDetailView/PatientsDetailView.types";
import PatientForm from "./PatientForm";
import { deletePatient } from "./Patients.service";

const Patients = () => {
  const navigate = useNavigate();
  const {
    loading,
    rows,
    totalRecords,
    lastSynced,
    handleSearchChange,
    handleLoadMore,
    handleSortChange,
    refreshPatients,
  } = usePatients();

  const [isSideBarVisible, setIsSideBarVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<
    PatientsRowType | undefined
  >();

  const columns: ColumnDef[] = [
    {
      headerName: "Name",
      field: "name",
      width: 200,
      sortable: true,
    },
    {
      headerName: "Age",
      field: "age",
      width: 120,
      sortable: true,
    },
    {
      headerName: "Email",
      field: "email",
      width: 250,
      sortable: false,
    },
    {
      headerName: "Gender",
      field: "gender",
      width: 120,
      sortable: true,
    },
    {
      headerName: "Created",
      field: "createdAt",
      width: 180,
      sortable: true,
    },
  ];

  const handleAddClick = useCallback(() => {
    setEditingPatient(undefined);
    setIsSideBarVisible(true);
  }, []);

  const handleEditClick = useCallback((patient: PatientsRowType) => {
    setEditingPatient(patient);
    setIsSideBarVisible(true);
  }, []);

  const handleRowClick = useCallback((patient: PatientsRowType) => {
    navigate("/patients-detail-view", {
      state: {
        patient: patient as PatientsDetailViewPatientInfoType,
      },
    });
  }, []);

  const onCloseSideBar = useCallback(() => {
    setIsSideBarVisible(false);
    setEditingPatient(undefined);
  }, []);

  const handleDeleteClick = useCallback(
    async (patientId: number) => {
      if (!window.confirm("Are you sure you want to delete this patient?")) {
        return;
      }

      try {
        await deletePatient(patientId);
        toastHelper.success("Patient deleted successfully");
        refreshPatients();
      } catch (error) {
        console.error("Failed to delete patient", error);
        toastHelper.error("Failed to delete patient. Please try again.");
      }
    },
    [refreshPatients],
  );

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col min-h-0 overflow-hidden">
      <div className="w-full flex flex-col p-4 sm:p-6 overflow-hidden h-full min-h-0">
        <div className="flex items-center justify-between mb-4">
          <PageHeader
            title="Patients"
            description="Manage patient information and records."
            Icon={Users}
          />
        </div>

        <div className="w-full overflow-hidden mt-4 h-full flex-1 min-h-0">
          <Table
            cols={columns}
            showAdd={true}
            rows={rows}
            loading={loading}
            totalRecords={totalRecords}
            lastSynced={lastSynced}
            showEdit={true}
            showDelete={true}
            onSearchChange={handleSearchChange}
            onLoadMoreRecords={handleLoadMore}
            onSortChange={handleSortChange}
            clickable={true}
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onAdd={handleAddClick}
            onDelete={(ids) => {
              if (ids.length > 0) {
                const id = ids[0];
                handleDeleteClick(typeof id === "object" ? id.id : id);
              }
            }}
          />
        </div>
      </div>

      <SideBar
        isOpen={isSideBarVisible}
        onClose={onCloseSideBar}
        title={editingPatient ? "Edit Patient" : "Add Patient"}
        description={
          editingPatient ? "Edit existing patient details" : "Add new patient"
        }
      >
        <PatientForm
          patchData={editingPatient}
          isEdit={Boolean(editingPatient)}
          isLoading={false}
          refreshTable={refreshPatients}
          closeSideBar={onCloseSideBar}
        />
      </SideBar>
    </div>
  );
};

export default Patients;
