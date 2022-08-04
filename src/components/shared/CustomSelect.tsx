import React from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

type Props = {
  value: string;
  onChange: (a: string) => void;
  options: any[];
};

const CustomSelect = (props: Props) => {
  const handleChange = (event: any) => {
    props.onChange(event?.target?.value || "");
  };
  return (
    <Select
      value={props.value}
      onChange={handleChange}
      renderValue={(value: any) => (
        <>
          {value && (
            <img
              src={props.options.find((opt) => opt.value === value)?.icon}
              alt=""
            />
          )}
        </>
      )}
    >
      {props.options &&
        props.options.map((option) => (
          <MenuItem value={option.value} key={option.value}>
            {option.label}
          </MenuItem>
        ))}
    </Select>
  );
};

export default CustomSelect;
