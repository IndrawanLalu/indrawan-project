import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaChartLine, FaChartPie } from "react-icons/fa";
// import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: FaChartLine },
  { name: "Aset", href: "/admin/aset/penyulang", icon: FaChartPie },
  {
    name: "Gangguan Penyulang",
    href: "/admin/gangguanPenyulang",
    icon: FaChartPie,
    accName: "Peta Gangguan",
    accHref: "/admin/gangguanPenyulang/peta-gangguan",
  },
  {
    name: "Pemeliharaan",
    href: "/pemeliharaan",
    icon: FaChartLine,
    accName: "Daftar Pemeliharaan",
    accHref: "/admin/pemeliharaan/daftar-pemeliharaan",
    accName2: "Cetak Wo",
    accHref2: "/admin/pemeliharaan/cetak-wo",
  },
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
            {/* <Button variant="reverse" size="sidebar">
              <Link to={item.href} className="flex items-center gap-2">
                {" "}
                {item.icon && <item.icon className="w-5 h-5" />}{" "}
                {!isCollapsed ? item.name : null}
              </Link>
            </Button> */}
            <Accordion
              className="w-full lg:w-[unset]"
              type="single"
              collapsible
            >
              <AccordionItem className="lg:w-[500px] max-w-full" value="item-1">
                <AccordionTrigger className="hover:bg-[#DAF5F0]">
                  {" "}
                  <Link to={item.href} className="flex items-center gap-2">
                    {" "}
                    {item.icon && <item.icon className="w-5 h-5 ml-2" />}{" "}
                    {!isCollapsed ? item.name : null}
                  </Link>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-2 flex flex-col gap-2">
                  <div className=" hover:bg-[#DAF5F0]">
                    <Link to={item.accHref}>{item.accName}</Link>
                  </div>

                  <div className=" hover:bg-[#DAF5F0]">
                    <Link to={item.accHref2}>{item.accName2}</Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
