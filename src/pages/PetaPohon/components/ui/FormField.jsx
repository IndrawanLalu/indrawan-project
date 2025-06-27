// components/ui/FormField.jsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropTypes from "prop-types";

const FormField = ({
  label,
  icon: Icon,
  type = "input",
  value,
  onChange,
  onValueChange,
  placeholder,
  options = [],
  disabled = false,
  className = "",
  required = false,
  ...props
}) => {
  return (
    <div className={`grid grid-cols-4 items-center gap-4 ${className}`}>
      <Label className="text-right flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      {type === "select" ? (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.length > 0 ? (
              options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-options" disabled>
                {placeholder || "Tidak ada data tersedia"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="col-span-3 min-h-[100px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-main"
          disabled={disabled}
          {...props}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="col-span-3"
          disabled={disabled}
          {...props}
        />
      )}
    </div>
  );
};
FormField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  type: PropTypes.oneOf(["input", "select", "textarea"]),
  value: PropTypes.any,
  onChange: PropTypes.func,
  onValueChange: PropTypes.func,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  required: PropTypes.bool,
};

export { FormField };
