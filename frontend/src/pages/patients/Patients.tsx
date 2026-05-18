import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../helpers/ui/TableComponent";
import {
  TablePageWrapper,
  TableContentWrapper,
} from "../../helpers/ui/PageWrapper";
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
import ConfirmDialog from "../../helpers/ui/ConfirmDialog";

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
  const [deleteCandidate, setDeleteCandidate] = useState<{
    id: number;
    name?: string;
  } | null>(null);

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

  const clearPatientForm = useCallback(() => {
    setEditingPatient(undefined);
  }, []);

  const onCloseSideBar = useCallback(() => {
    setIsSideBarVisible(false);
    clearPatientForm();
  }, [clearPatientForm]);

  const handleDeleteClick = useCallback(
    async (patientId: number) => {
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

  const requestDeletePatient = useCallback(
    (patientId: number, name?: string) => {
      setDeleteCandidate({ id: patientId, name });
    },
    [],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteCandidate) {
      return;
    }

    const { id } = deleteCandidate;
    setDeleteCandidate(null);
    await handleDeleteClick(id);
  }, [deleteCandidate, handleDeleteClick]);

  return (
    <>
      <TablePageWrapper>
        <PageHeader
          title="Patients"
          description="Manage patient information and records."
          Icon={Users}
        />

        <TableContentWrapper>
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
                requestDeletePatient(
                  typeof id === "object" ? id.id : id,
                  typeof id === "object" ? id.name : undefined,
                );
              }
            }}
          />
        </TableContentWrapper>
      </TablePageWrapper>

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

      <ConfirmDialog
        open={Boolean(deleteCandidate)}
        title="Delete patient?"
        message={
          deleteCandidate?.name
            ? `Are you sure you want to delete ${deleteCandidate.name}? This action cannot be undone.`
            : "Are you sure you want to delete this patient? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </>
  );
};

export default Patients;
