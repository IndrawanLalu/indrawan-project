import { useState, useEffect } from "react";
import SidebarMobile from "./SidebarMobile";
import SidebarDesktop from "./SidebarDesktop";
import PropTypes from "prop-types";

const SidebarLayout = ({ children, pengguna, ruteDisetujui = [] }) => {
  // State untuk melacak status collapsed sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Muat status dari localStorage saat komponen dimount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Event handler untuk perubahan status sidebar
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  };

  return (
    <>
      {/* Sidebar Desktop - hanya tampil di layar medium ke atas */}
      <div className="hidden md:block">
        <SidebarDesktop
          pengguna={pengguna}
          ruteDisetujui={ruteDisetujui}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
        />
      </div>

      {/* Sidebar Mobile - hanya tampil di layar kecil */}
      <div className="md:hidden">
        <SidebarMobile pengguna={pengguna} ruteDisetujui={ruteDisetujui} />
      </div>

      {/* Konten utama aplikasi */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {children}
      </div>
    </>
  );
};

SidebarLayout.propTypes = {
  children: PropTypes.node.isRequired,
  pengguna: PropTypes.object,
  ruteDisetujui: PropTypes.array,
};

export default SidebarLayout;
