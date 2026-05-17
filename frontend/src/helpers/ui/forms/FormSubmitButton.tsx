type FormSubmitButtonProps = {
  isLoading?: boolean;
  idleLabel: string;
  loadingLabel?: string;
  className?: string;
};

const FormSubmitButton = ({
  isLoading,
  idleLabel,
  loadingLabel = "Saving...",
  className = "",
}: FormSubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full mt-8 px-4 py-3 btn-primary text-sm font-semibold rounded-xl transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : (
        idleLabel
      )}
    </button>
  );
};

export default FormSubmitButton;
