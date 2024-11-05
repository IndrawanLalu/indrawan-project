import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import PropTypes from "prop-types";
import { useState } from "react";

const ImagePreview = ({ src, alt, description }) => {
  const [open, setOpen] = useState(false);

  const handleImageClick = () => {
    setOpen(true);
  };

  return (
    <div>
      {/* Trigger image */}
      <img
        src={src}
        alt={alt}
        className="cursor-pointer"
        onClick={handleImageClick}
        style={{
          width: "144px",
          height: "144px",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />

      {/* Dialog for preview */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {/* Optional: Add any button or action to open the dialog manually */}
        </DialogTrigger>
        <DialogContent>
          <div className="flex flex-col items-center">
            {/* Zoomed Image */}
            <img src={src} alt={alt} className="max-w-full max-h-screen" />
            <p className="text-center text-lg">{description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
ImagePreview.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default ImagePreview;
