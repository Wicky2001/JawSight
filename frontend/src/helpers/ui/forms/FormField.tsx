import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
};

const FormField = ({
  label,
  required = false,
  error,
  helperText,
  children,
  className = "",
}: FormFieldProps) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-primary mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      {children}

      {error ? (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5 font-medium">
          <span className="w-1 h-1 rounded-full bg-[var(--error)]"></span>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormField;
