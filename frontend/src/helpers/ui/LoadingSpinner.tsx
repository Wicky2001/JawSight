import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
  label?: string;
  centered?: boolean;
  className?: string;
  spinnerClassName?: string;
  labelClassName?: string;
};

const LoadingSpinner = ({
  label,
  centered = false,
  className = "",
  spinnerClassName = "",
  labelClassName = "",
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`${centered ? "flex items-center justify-center" : "flex items-center gap-2"} ${className}`}
    >
      <Loader2
        className={`animate-spin text-teal-600 ${spinnerClassName}`.trim()}
      />
      {label ? (
        <span
          className={`text-sm font-medium text-secondary ${labelClassName}`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
};

export default LoadingSpinner;
