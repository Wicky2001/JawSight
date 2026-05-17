import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import FormField from "./FormField";

type TextInputFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  inputClassName?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">;

const TextInputField = ({
  label,
  required,
  error,
  helperText,
  inputClassName,
  onChange,
  ...inputProps
}: TextInputFieldProps) => {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <input {...inputProps} onChange={onChange} className={inputClassName} />
    </FormField>
  );
};

export default TextInputField;
