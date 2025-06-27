// components/ui/ImageUpload.jsx
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";

const ImageUpload = ({
  label,
  //   value,
  preview,
  onChange,
  onRemove,
  accept = "image/*",
  required = false,
  className = "",
}) => {
  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file && onChange) {
        onChange(file);
      }
    },
    [onChange]
  );

  return (
    <div className={`grid grid-cols-4 items-center gap-4 ${className}`}>
      <Label className="text-right flex items-center gap-2">
        <Camera className="w-4 h-4" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="col-span-3">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-main file:text-white hover:file:bg-main/80"
        />
        {preview && (
          <div className="mt-4 relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border border-white/20"
            />
            {onRemove && (
              <Button
                type="button"
                onClick={onRemove}
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ImageUpload.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  preview: PropTypes.string,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  accept: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export { ImageUpload };
