import { useState, useEffect } from "react";
import { toastHelper } from "../../helpers/toastHelper";
import { createPatient, updatePatient } from "./Patients.service";
import {
  FormSubmitButton,
  NumberStepperField,
  RadixSelectField,
  TextInputField,
  getInputClass,
  incrementNumericValue,
  decrementNumericValue,
  clearFieldError,
} from "../../helpers/ui/forms";
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

  const incrementAge = () => {
    setFormData((prev) => {
      return { ...prev, age: incrementNumericValue(prev.age, 150) };
    });

    if (errors.age) {
      setErrors(clearFieldError(errors, "age"));
    }
  };

  const decrementAge = () => {
    setFormData((prev) => {
      return { ...prev, age: decrementNumericValue(prev.age, 1) };
    });

    if (errors.age) {
      setErrors(clearFieldError(errors, "age"));
    }
  };

  const inputClass = (field: keyof typeof formData) =>
    getInputClass(!!errors[field]);

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
      <TextInputField
        label="Name"
        required={true}
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        disabled={isLoading}
        inputClassName={inputClass("name")}
        placeholder="Enter patient name"
        error={errors.name}
      />

      <NumberStepperField
        label="Age"
        required={true}
        name="age"
        value={formData.age}
        onChange={handleChange}
        onIncrement={incrementAge}
        onDecrement={decrementAge}
        disabled={isLoading}
        placeholder="Enter age"
        min={1}
        max={150}
        error={errors.age}
        helperText="Maximum of 150"
      />

      <TextInputField
        label="Email"
        required={true}
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        disabled={isLoading}
        inputClassName={inputClass("email")}
        placeholder="Enter email address"
        error={errors.email}
      />

      <RadixSelectField
        label="Gender"
        required={true}
        value={formData.gender}
        onValueChange={(value) => {
          setFormData((prev) => ({ ...prev, gender: value }));
          if (errors.gender) {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.gender;
              return newErrors;
            });
          }
        }}
        disabled={isLoading}
        options={[
          { label: "Male", value: "MALE" },
          { label: "Female", value: "FEMALE" },
        ]}
        triggerClassName={inputClass("gender")}
        placeholder="Select gender"
        error={errors.gender}
      />

      <FormSubmitButton
        isLoading={isLoading}
        idleLabel={isEdit ? "Update Patient" : "Add Patient"}
      />
    </form>
  );
};

export default PatientForm;
