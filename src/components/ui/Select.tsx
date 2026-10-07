"use client";

import React from "react";
import { CustomDropdown, DropdownOption } from "./CustomDropdown";

export type Option = DropdownOption;

export interface SelectProps {
  label?: string;
  error?: string;
  options: (DropdownOption | string)[];
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      value = "",
      onChange,
      placeholder = "Select an option...",
      className = "",
      disabled = false,
      id,
      name,
    },
    ref
  ) => {
    const handleChange = (newVal: string) => {
      if (!onChange) return;
      // Synthesize event-like object for compatibility with (e) => setForm({ ...form, field: e.target.value })
      const syntheticEvent = {
        target: {
          name: name || id || "",
          value: newVal,
        },
      };
      onChange(syntheticEvent);
    };

    return (
      <div ref={ref} className={className}>
        <CustomDropdown
          label={label}
          options={options}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          id={id}
        />
        {/* Hidden input for standard form submission if needed */}
        {name && <input type="hidden" name={name} value={value} />}
      </div>
    );
  }
);

Select.displayName = "Select";

export { CustomDropdown };
