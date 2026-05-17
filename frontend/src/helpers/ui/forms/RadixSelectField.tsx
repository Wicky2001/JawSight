import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import FormField from "./FormField";

type SelectOption = {
  label: string;
  value: string;
};

type RadixSelectFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  options: SelectOption[];
  triggerClassName: string;
  onValueChange: (value: string) => void;
};

const RadixSelectField = ({
  label,
  required,
  error,
  helperText,
  value,
  placeholder,
  disabled,
  options,
  triggerClassName,
  onValueChange,
}: RadixSelectFieldProps) => {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          className={`${triggerClassName} text-left flex justify-between items-center data-[state=open]:ring-2 data-[state=open]:ring-brand/30`}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={16} className="text-secondary" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-[10050] w-[var(--radix-select-trigger-width)] overflow-hidden surface-card border border-primary rounded-xl card-shadow"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex items-center px-8 py-2.5 text-sm text-primary focus:bg-[var(--brand-subtle-bg)] outline-none rounded-lg cursor-pointer data-[state=checked]:bg-[var(--brand-subtle-bg)] data-[state=checked]:text-primary data-[state=checked]:font-medium transition-colors"
                >
                  <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center justify-center">
                    <Check size={14} />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </FormField>
  );
};

export default RadixSelectField;
