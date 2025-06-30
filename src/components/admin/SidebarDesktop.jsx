import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaBinoculars,
  FaBookMedical,
  FaChartPie,
  FaEnvelope,
  FaAngleDown,
  FaAngleRight,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaAddressCard,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import { logout } from "@/redux/authSlice";
import { TreeDeciduousIcon } from "lucide-react";

// CSS untuk Breathing Effect
const breathingEffectStyles = `
  @keyframes sidebarBreathe {
    0%, 100% {
      box-shadow: 
        0 4px 15px rgba(255, 255, 255, 0.1),
        0 0 20px rgba(255, 255, 255, 0.05);
      transform: translateX(0px);
    }
    50% {
      box-shadow: 
        0 8px 25px rgba(247, 139, 66, 0.5),
        0 0 30px rgba(255, 255, 255, 0.1);
      transform: translateX(1px);
    }
  }

  @keyframes sidebarGlow {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(255, 255, 255, 0.1),
        0 4px 15px rgba(255, 255, 255, 0.15);
    }
    50% {
      box-shadow: 
        0 0 40px rgba(255, 255, 255, 0.2),
        0 8px 25px rgba(255, 255, 255, 0.25);
    }
  }

  @keyframes sidebarPulse {
    0%, 100% {
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow: 
        0 8px 30px rgba(255, 255, 255, 0.25),
        0 0 25px rgba(255, 255, 255, 0.15);
    }
  }

  .sidebar-breathe {
    animation: sidebarBreathe 4s ease-in-out infinite;
    will-change: box-shadow, transform;
  }

  .sidebar-glow {
    animation: sidebarGlow 3s ease-in-out infinite;
    will-change: box-shadow;
  }

  .sidebar-pulse {
    animation: sidebarPulse 2.5s ease-in-out infinite;
    will-change: box-shadow;
  }

  /* Hover effects */
  .sidebar-breathe:hover {
    animation-duration: 2s;
    box-shadow: 
      0 12px 35px rgba(255, 255, 255, 0.3),
      0 0 40px rgba(255, 255, 255, 0.2) !important;
  }

  /* Responsive - disable animations on mobile if needed */
  @media (prefers-reduced-motion: reduce) {
    .sidebar-breathe,
    .sidebar-glow,
    .sidebar-pulse {
      animation: none;
    }
  }

  /* Performance optimization */
  .sidebar-container {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000;
  }
`;
let AppName = "SIEKAS";
let Description = "Sistem Inspeksi dan Eksekusi Asset Selaparang";
// Data navigasi - bisa dipindahkan ke file terpisah atau diterima sebagai props
const navigasi = [
  { nama: "Beranda", href: "/admin/dashboard", icon: FaHome },
  // { nama: "Beban Gardu", href: "/amg", icon: FaChartLine },
  {
    nama: "Inspeksi Mandorline",
    href: "/admin/data-segment",
    icon: FaChartPie,
  },
  {
    nama: "Peta Pohon",
    href: "/admin/petapohon",
    icon: TreeDeciduousIcon,
  },
  {
    nama: "Gangguan Penyulang",
    href: "#",
    icon: FaBookMedical,
    submenu: [
      { nama: "Ganggaun Penyulang", href: "/admin/gangguanPenyulang" },
      { nama: "Pareto Gangguan", href: "/admin/pareto-gangguan" },
      {
        nama: "Peta Gangguan",
        href: "/admin/gangguan-penyulang/peta-gangguan",
      },
      { nama: "Target Gangguan", href: "/target-gangguan" },
    ],
  },
  // { nama: "Ukur Gardu", href: "/pengukuran-form", icon: FaPeopleCarry },
  {
    nama: "Data Pemeliharaan",
    href: "/pemeliharaan",
    icon: FaBinoculars,
    submenu: [
      { nama: "Tambah Temuan", href: "/tambahTemuan", icon: FaEnvelope },
      {
        nama: "Validasi Pemeliharaan",
        href: "/admin/pemeliharaan/daftar-pemeliharaan",
      },
      { nama: "Daftar Semua Pemeliharaan", href: "/cetak-wo" },
      { nama: "Dashboard Preventive", href: "/admin/dashboard-preventive" },
    ],
  },
  {
    nama: "Data Gardu",
    href: "/data-gardu",
    icon: FaChartPie,
    submenu: [
      { nama: "Hystory Pengukuran", href: "/admin/history-pengukuran" },
      { nama: "Pengukuran Gardu", href: "/admin/pengukuran-gardu" },
      { nama: "Dashboard Pengukuran", href: "/admin/dashboard-pengukuran" },
      { nama: "Notifikasi Pengukuran", href: "/gardu/notifikasi" },
    ],
  },
  {
    nama: "Manajement Petugas",
    href: "/admin/manajemen-petugas",
    icon: FaEnvelope,
  },
  {
    nama: "Manajement Penyulang",
    href: "/admin/aset/penyulang",
    icon: FaAddressCard,
  },
  // { nama: "Tambah Temuan", href: "/tambahTemuan", icon: FaEnvelope },
];

const SidebarDesktop = ({
  pengguna,
  ruteDisetujui = [],
  isCollapsed = false,
  onToggleCollapse,
  animationType = "breathe", // breathe, glow, pulse
}) => {
  const [itemDiperluas, setItemDiperluas] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const lokasi = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    const newCollapsedState = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
  };

  // Toggle submenu
  const toggleSubmenu = (index) => {
    setItemDiperluas((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Memeriksa akses pengguna
  const cekAkses = (href) => {
    if (!pengguna || pengguna.role !== "yantek") return true;
    return ruteDisetujui.includes(href);
  };

  // Handle logout
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      // Dispatch action logout ke Redux store
      dispatch(logout());
      // Sign out dari Firebase Auth
      await signOut(auth);
      // Redirect ke halaman login
      navigate("/login");
    } catch (error) {
      console.error("Logout gagal:", error);
      // Bisa tambahkan notifikasi error di sini jika diperlukan
    }
  };

  // Determine animation class based on type and state
  const getAnimationClass = () => {
    const baseClass = `sidebar-${animationType}`;
    if (isHovered) {
      return `${baseClass} hover:scale-[1.01]`;
    }
    return baseClass;
  };

  return (
    <>
      {/* Inject CSS Styles */}
      <style dangerouslySetInnerHTML={{ __html: breathingEffectStyles }} />

      <aside
        className={`sidebar-container fixed top-0 left-0 h-full bg-backgroundFrom text-white z-30 
          transition-all duration-300 hidden md:block ${getAnimationClass()} ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Toggle button */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 bg-main text-white w-6 h-6 rounded-full flex items-center 
            justify-center shadow-md hover:scale-110 transition-transform duration-200 z-40"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <FaChevronRight size={10} />
          ) : (
            <FaChevronLeft size={10} />
          )}
        </button>

        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2 overflow-hidden">
            <img
              src="/petasan.webp"
              alt="Logo"
              className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-white/20"
            />
            {!isCollapsed && (
              <h2 className="text-lg font-bold text-main truncate">
                {AppName}
              </h2>
            )}
          </div>
        </div>

        {/* Profil Pengguna */}
        <div className="p-4 border-b border-white/10">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "space-x-3"
            }`}
          >
            <div className="p-2 bg-main/20 rounded-full flex-shrink-0 ring-2 ring-main/30">
              <FaUser size={18} className="text-main" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm text-white/70">Halo,</p>
                <p className="font-medium truncate text-white">
                  {pengguna?.email || "Inspektor"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="p-2 overflow-y-auto h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-white/20">
          <ul className="space-y-1">
            {navigasi.map((item, index) => {
              const aktif = lokasi.pathname === item.href;
              const aksesDisetujui = cekAkses(item.href);

              return (
                <li key={index}>
                  {item.submenu ? (
                    <div className="mb-1">
                      <button
                        onClick={() => toggleSubmenu(index)}
                        className={`w-full flex items-center justify-between p-2 rounded-md 
                          transition-all duration-200 ${
                            aktif
                              ? "bg-main text-white shadow-lg shadow-main/30"
                              : "text-white hover:bg-white/10 hover:text-main hover:shadow-md hover:shadow-white/20"
                          } ${
                          !aksesDisetujui
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:scale-[1.02]"
                        }`}
                        disabled={!aksesDisetujui}
                      >
                        <div
                          className={`flex items-center ${
                            isCollapsed ? "justify-center w-full" : ""
                          }`}
                        >
                          <item.icon
                            className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`}
                          />
                          {!isCollapsed && <span>{item.nama}</span>}
                        </div>
                        {!isCollapsed &&
                          (itemDiperluas[index] ? (
                            <FaAngleDown
                              size={16}
                              className="transition-transform duration-200"
                            />
                          ) : (
                            <FaAngleRight
                              size={16}
                              className="transition-transform duration-200"
                            />
                          ))}
                      </button>

                      {/* Submenu - hanya tampil jika tidak diciutkan */}
                      {!isCollapsed && itemDiperluas[index] && (
                        <ul className="ml-8 mt-1 space-y-1 animate-in slide-in-from-left-2 duration-200">
                          {item.submenu.map((subitem, subindex) => {
                            const subAktif = lokasi.pathname === subitem.href;
                            const subAksesDisetujui = cekAkses(subitem.href);

                            return (
                              <li key={subindex}>
                                <Link
                                  to={subAksesDisetujui ? subitem.href : "#"}
                                  className={`block p-2 rounded-md transition-all duration-200 ${
                                    subAktif
                                      ? "bg-main text-white font-medium shadow-md shadow-main/30"
                                      : "text-white/80 hover:bg-white/10 hover:text-main hover:shadow-sm hover:shadow-white/20"
                                  } ${
                                    !subAksesDisetujui
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:scale-[1.02] hover:translate-x-1"
                                  }`}
                                  onClick={(e) =>
                                    !subAksesDisetujui && e.preventDefault()
                                  }
                                >
                                  {subitem.nama}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={aksesDisetujui ? item.href : "#"}
                      className={`flex items-center p-2 rounded-md transition-all duration-200 ${
                        aktif
                          ? "bg-main text-white shadow-lg shadow-main/30"
                          : "text-white hover:bg-white/10 hover:text-main hover:shadow-md hover:shadow-white/20"
                      } ${
                        !aksesDisetujui
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-[1.02]"
                      } ${isCollapsed ? "justify-center" : ""}`}
                      onClick={(e) => !aksesDisetujui && e.preventDefault()}
                      title={isCollapsed ? item.nama : ""}
                    >
                      <item.icon
                        className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`}
                      />
                      {!isCollapsed && <span>{item.nama}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Section */}
        <div className="items-center flex flex-col p-4 space-y-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-2 text-red-400 hover:bg-red-500/10 
              hover:text-red-300 rounded-md transition-all duration-200 hover:scale-[1.02] 
              hover:shadow-md hover:shadow-red-500/20 ${
                isCollapsed ? "justify-center" : ""
              }`}
            title={isCollapsed ? "Keluar" : ""}
          >
            <FaSignOutAlt className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>Keluar</span>}
          </button>

          {!isCollapsed && (
            <div className="pt-4 mt-auto animate-in fade-in duration-300">
              <p className="text-sm text-white/80 text-center font-medium">
                {AppName} v2.1
              </p>
              <p className="text-xs text-white/50 text-center mt-1">
                {Description}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

SidebarDesktop.propTypes = {
  pengguna: PropTypes.object,
  ruteDisetujui: PropTypes.array,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  animationType: PropTypes.oneOf(["breathe", "glow", "pulse"]),
};

export default SidebarDesktop;
