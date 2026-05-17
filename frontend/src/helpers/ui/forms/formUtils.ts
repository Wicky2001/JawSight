/**
 * Generic utility functions for form field handling
 * These utilities can be used across any form implementation
 */

/**
 * Generates a themed input class string based on field error state
 * Applies error or default styling using theme tokens
 * @param hasError - Whether the field has a validation error
 * @returns CSS class string with complete input styling
 */
export const getInputClass = (hasError: boolean): string =>
  `w-full px-4 py-2.5 text-sm rounded-xl transition-all outline-none themed-input input-focus text-primary placeholder:text-placeholder disabled-input disabled:opacity-60 ${
    hasError ? "input-invalid" : ""
  }`;

/**
 * Increments a numeric value with a maximum bound
 * Used for stepper controls (e.g., age, quantity)
 * @param currentValue - The current numeric value as string
 * @param max - Maximum allowed value (default: 150)
 * @returns Incremented value capped at max, as string
 */
export const incrementNumericValue = (
  currentValue: string,
  max: number = 150,
): string => {
  const current = parseInt(currentValue || "0", 10);
  const next = Math.min(max, current + 1);
  return String(next);
};

/**
 * Decrements a numeric value with a minimum bound
 * Used for stepper controls (e.g., age, quantity)
 * @param currentValue - The current numeric value as string
 * @param min - Minimum allowed value (default: 1)
 * @returns Decremented value floored at min, as string
 */
export const decrementNumericValue = (
  currentValue: string,
  min: number = 1,
): string => {
  const current = parseInt(currentValue || "0", 10);
  const next = Math.max(min, current - 1);
  return String(next);
};

/**
 * Clears a specific field's error from an errors object
 * @param errors - Current errors record
 * @param fieldName - Name of the field to clear error for
 * @returns Updated errors object without the field error
 */
export const clearFieldError = (
  errors: Record<string, string>,
  fieldName: string,
): Record<string, string> => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};
