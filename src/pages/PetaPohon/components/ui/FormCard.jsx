// components/ui/FormCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import PropTypes from "prop-types";
const FormCard = ({ children, className = "" }) => {
  return (
    <Card
      className={`bg-white/10 backdrop-blur-lg border border-white/20 ${className}`}
    >
      <CardContent className="p-4 space-y-4">{children}</CardContent>
    </Card>
  );
};
FormCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export { FormCard };
