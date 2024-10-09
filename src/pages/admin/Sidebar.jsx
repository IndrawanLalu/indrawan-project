import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaChartLine, FaChartPie } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: FaChartLine },
  { name: "Aset", href: "/admin/aset/penyulang", icon: FaChartPie },
  {
    name: "Gangguan Penyulang",
    href: "/admin/gangguanPenyulang",
    icon: FaChartPie,
  },
  { name: "Pemeliharaan", href: "/pemeliharaan", icon: FaChartLine },
  { name: "Seed Data", href: "/admin/seeder", icon: FaChartLine },
  { name: "Data Segment", href: "/admin/data-segment", icon: FaChartLine },
];

const Sidebar = ({ isCollapsed }) => {
  return (
    <div>
      {navigation.map((item) => (
        <ul
          key={item.name}
          className={`flex flex-col gap-4 ${isCollapsed ? "text-center" : ""}`}
        >
          <li className=" text-base text-start -ml-1">
            <Button variant="reverse" size="sidebar">
              <Link to={item.href} className="flex items-center gap-2">
                {" "}
                {item.icon && <item.icon className="w-5 h-5" />}{" "}
                {!isCollapsed ? item.name : null}
              </Link>
            </Button>
          </li>
        </ul>
      ))}
    </div>
  );
};
Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
};
export default Sidebar;
