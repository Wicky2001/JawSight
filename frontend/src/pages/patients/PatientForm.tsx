import { useState, useEffect } from "react";
import { toastHelper } from "../../helpers/toastHelper";
import { createPatient, updatePatient } from "./Patients.service";
import {
  createPatientFormSchema,
  updatePatientFormSchema,
  type PatientsRowType,
  type CreatePatientFormType,
} from "../../../../shared/types/Patients/Patients.types";

interface PatientFormProps {
  patchData?: PatientsRowType;
  isEdit?: boolean;
  isLoading?: boolean;
  refreshTable?: () => void;
  closeSideBar?: () => void;
}

const PatientForm = ({
  patchData,
  isEdit = false,
  isLoading,
  refreshTable,
  closeSideBar,
}: PatientFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    gender: "MALE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patchData) {
      setFormData({
        name: patchData.name,
        age: patchData.age,
        email: patchData.email,
        gender: patchData.gender ?? "MALE",
      });
    } else {
      setFormData({ name: "", age: "", email: "", gender: "MALE" });
    }
    setErrors({});
  }, [patchData]);

  const validateForm = (): boolean => {
    const schema = isEdit ? updatePatientFormSchema : createPatientFormSchema;
    const result = schema.safeParse({
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      email: formData.email,
      gender: formData.gender,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreatePatientFormType & { id?: number } = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        email: formData.email.trim(),
        gender: formData.gender as "MALE" | "FEMALE",
      };

      if (isEdit && patchData) {
        submitData.id = patchData.id;
        await updatePatient(patchData.id, {
          name: submitData.name,
          age: submitData.age,
          email: submitData.email,
          gender: submitData.gender,
        });
        toastHelper.success("Patient updated successfully");
      } else {
        await createPatient({
          name: submitData.name,
          age: submitData.age,
          email: submitData.email,
          gender: submitData.gender,
        });
        toastHelper.success("Patient created successfully");
      }

      refreshTable?.();
      closeSideBar?.();
      setFormData({ name: "", age: "", email: "", gender: "MALE" });
      setErrors({});
    } catch (error) {
      console.error("Form submission error:", error);
      toastHelper.error("Failed to save patient. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2">
          Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none input-focus themed-input ${errors.name ? "input-invalid" : ""} disabled:opacity-60`}
          placeholder="Enter patient name"
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
            <span>•</span> {errors.name}
          </p>
        )}
      </div>

      {/* Age Field */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2">
          Age <span className="text-destructive">*</span>
        </label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none input-focus themed-input ${errors.age ? "input-invalid" : ""} disabled:opacity-60`}
          placeholder="Enter age"
          min="1"
          max="150"
        />
        {errors.age && (
          <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
            <span>•</span> {errors.age}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none input-focus themed-input ${errors.email ? "input-invalid" : ""} disabled:opacity-60`}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
            <span>•</span> {errors.email}
          </p>
        )}
      </div>

      {/* Gender Field */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2">
          Gender <span className="text-destructive">*</span>
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, gender: e.target.value }))
          }
          disabled={isLoading}
          className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none input-focus themed-input ${errors.gender ? "input-invalid" : ""} disabled:opacity-60`}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        {errors.gender && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span>•</span> {errors.gender}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 px-4 py-3 btn-primary text-sm font-semibold rounded-lg hover:brightness-95 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : isEdit ? (
          "Update Patient"
        ) : (
          "Add Patient"
        )}
      </button>
    </form>
  );
};

export default PatientForm;
