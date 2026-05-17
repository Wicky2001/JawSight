import { AlertCircle, Minus, Plus } from "lucide-react";
import type { ChangeEventHandler } from "react";
import FormField from "./FormField";

type NumberStepperFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  name: string;
  value: string;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onIncrement: () => void;
  onDecrement: () => void;
};

const NumberStepperField = ({
  label,
  required,
  error,
  helperText,
  name,
  value,
  placeholder,
  min,
  max,
  disabled,
  onChange,
  onIncrement,
  onDecrement,
}: NumberStepperFieldProps) => {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <div
        className={`flex items-center w-full px-1.5 py-1 text-sm rounded-xl transition-all focus-within:ring-2 focus-within:ring-brand/30 disabled:opacity-60 themed-input ${error ? "input-invalid" : ""}`}
      >
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="flex-1 bg-transparent px-2.5 py-1.5 outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-primary placeholder:text-placeholder"
          placeholder={placeholder}
          min={min}
          max={max}
        />

        {error && (
          <AlertCircle size={18} className="text-destructive mx-2 shrink-0" />
        )}

        <div className="flex items-center shrink-0 pr-1">
          <button
            type="button"
            onClick={onDecrement}
            disabled={disabled}
            className="p-1.5 text-secondary hover:text-primary hover-bg rounded transition-colors focus:outline-none disabled:opacity-50"
          >
            <Minus size={16} strokeWidth={2.5} />
          </button>
          <div className="w-px h-5 border-r border-primary/60 mx-1"></div>
          <button
            type="button"
            onClick={onIncrement}
            disabled={disabled}
            className="p-1.5 text-secondary hover:text-primary hover-bg rounded transition-colors focus:outline-none disabled:opacity-50"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </FormField>
  );
};

export default NumberStepperField;
