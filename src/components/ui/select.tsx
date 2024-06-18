import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  name?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
}

const Select: React.FC<SelectProps> = ({ name, value, onChange, options }) => {
  return (
    <select name={name} value={value} onChange={onChange}>
      {options && options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;