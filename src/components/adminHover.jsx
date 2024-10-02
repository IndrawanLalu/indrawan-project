import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const AdminHover = ({ user, role }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">
          Welcome, {user} | {role}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-60">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1 flex flex-col">
            <Link
              to={"/aset/penyulang"}
              className="text-sm font-semibold hover:underline"
            >
              Data Penyulang
            </Link>
            <Link
              to={"/dataGangguanPenyulang"}
              className="text-sm font-semibold hover:underline"
            >
              Gangguan Penyulang
            </Link>
            <div className="flex items-center pt-2"></div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
// Validasi tipe props
AdminHover.propTypes = {
  user: PropTypes.string.isRequired, // Menentukan bahwa user harus bertipe string dan wajib
  role: PropTypes.string.isRequired, // Menentukan bahwa role harus bertipe string dan wajib
};

export default AdminHover;
