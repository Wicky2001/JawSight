import { useState, useEffect } from "react";
import { toast } from "react-toastify";
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patchData) {
      setFormData({
        name: patchData.name,
        age: patchData.age,
        email: patchData.email,
      });
    } else {
      setFormData({ name: "", age: "", email: "" });
    }
    setErrors({});
  }, [patchData]);

  const validateForm = (): boolean => {
    const schema = isEdit ? updatePatientFormSchema : createPatientFormSchema;
    const result = schema.safeParse({
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      email: formData.email,
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
      };

      if (isEdit && patchData) {
        submitData.id = patchData.id;
        await updatePatient(patchData.id, {
          name: submitData.name,
          age: submitData.age,
          email: submitData.email,
        });
        toast.success("Patient updated successfully");
      } else {
        await createPatient({
          name: submitData.name,
          age: submitData.age,
          email: submitData.email,
        });
        toast.success("Patient created successfully");
      }

      refreshTable?.();
      closeSideBar?.();
      setFormData({ name: "", age: "", email: "" });
      setErrors({});
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save patient. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all focus:outline-none focus:ring-2 ${
            errors.name
              ? "border-red-300 bg-red-50 focus:ring-red-500/30 focus:border-red-400"
              : "border-slate-300 bg-white hover:border-slate-400 focus:ring-teal-500/30 focus:border-teal-500"
          } disabled:bg-slate-50 disabled:text-slate-500`}
          placeholder="Enter patient name"
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span>•</span> {errors.name}
          </p>
        )}
      </div>

      {/* Age Field */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Age <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all focus:outline-none focus:ring-2 ${
            errors.age
              ? "border-red-300 bg-red-50 focus:ring-red-500/30 focus:border-red-400"
              : "border-slate-300 bg-white hover:border-slate-400 focus:ring-teal-500/30 focus:border-teal-500"
          } disabled:bg-slate-50 disabled:text-slate-500`}
          placeholder="Enter age"
          min="1"
          max="150"
        />
        {errors.age && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span>•</span> {errors.age}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all focus:outline-none focus:ring-2 ${
            errors.email
              ? "border-red-300 bg-red-50 focus:ring-red-500/30 focus:border-red-400"
              : "border-slate-300 bg-white hover:border-slate-400 focus:ring-teal-500/30 focus:border-teal-500"
          } disabled:bg-slate-50 disabled:text-slate-500`}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span>•</span> {errors.email}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 px-4 py-3 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
