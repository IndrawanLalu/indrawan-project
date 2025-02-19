import PropTypes from "prop-types";
import { useState } from "react";
import Sidebar from "@/pages/admin/Sidebar";
import { FaBars } from "react-icons/fa"; // Menggunakan react-icons untuk tombol toggle
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { logout } from "@/redux/authSlice";

const Layouts = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // State untuk mengontrol collapsible

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed); // Toggle state collapse
  };

  const user = useSelector((state) => state.auth.user); // Mengambil user dari Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      dispatch(logout());
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <nav
        className={`hidden md:flex bg-main md:py-1 min-h-screen overflow-auto md:flex-col flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-[60px]" : "w-[210px]"
        }`}
      >
        <div className="flex flex-col gap-1">
          {/* Toggle Button */}
          <button
            className="text-white p-2 md:block hidden focus:outline-none"
            onClick={toggleSidebar}
          >
            <FaBars size={24} />
          </button>

          {/* Header */}
          <div className={`${isCollapsed ? "hidden" : "px-4"}`}>
            <p className="text-sm">{user?.email}</p>
            <span className="text-sm">{user?.role}</span>
          </div>
        </div>
        {/* Navigation List */}
        <div className={`h-full${isCollapsed ? "text-center" : ""}`}>
          <Sidebar isCollapsed={isCollapsed} />
        </div>

        {/* Log Out (Pushed to the bottom using margin-top auto) */}
        <div className={`mt-auto ml-2 ${isCollapsed ? "text-center" : ""}`}>
          <Button onClick={handleLogout} className="cursor-pointer">
            {isCollapsed ? "↩️" : "Log Out"}
          </Button>
        </div>
      </nav>

      {/* Main Content and Footer */}
      <div className="flex flex-col w-full min-h-screen">
        {/* Main Content */}
        <main className="flex-grow p-4 bg-[#2aae5c50]">{children}</main>

        {/* Footer */}
        <footer className="bg-main/50 text-white p-4 text-center">
          <p>&copy; 2024 Teknik ULP Selong</p>
        </footer>
      </div>
    </div>
  );
};

Layouts.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layouts;
