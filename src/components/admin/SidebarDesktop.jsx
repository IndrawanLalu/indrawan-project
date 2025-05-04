import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaBinoculars,
  FaBookMedical,
  FaChartLine,
  FaChartPie,
  FaEnvelope,
  FaPeopleCarry,
  FaAngleDown,
  FaAngleRight,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import { logout } from "@/redux/authSlice";

// Data navigasi - bisa dipindahkan ke file terpisah atau diterima sebagai props
const navigasi = [
  { nama: "Beranda", href: "/admin/dashboard", icon: FaHome },
  { nama: "Beban Gardu", href: "/amg", icon: FaChartLine },
  { nama: "Temuan Inspeksi", href: "/inspeksi", icon: FaChartPie },
  {
    nama: "Gangguan Penyulang",
    href: "#",
    icon: FaBookMedical,
    submenu: [
      { nama: "Ganggaun Penyulang", href: "/admin/gangguanPenyulang" },
      {
        nama: "Peta Gangguan",
        href: "/admin/gangguan-penyulang/peta-gangguan",
      },
      { nama: "Target Gangguan", href: "/target-gangguan" },
    ],
  },
  { nama: "Ukur Gardu", href: "/pengukuran-form", icon: FaPeopleCarry },
  {
    nama: "Data Pemeliharaan",
    href: "/pemeliharaan",
    icon: FaBinoculars,
    submenu: [
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
  { nama: "Tambah Temuan", href: "/tambahTemuan", icon: FaEnvelope },
];

const SidebarDesktop = ({
  pengguna,
  ruteDisetujui = [],
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [itemDiperluas, setItemDiperluas] = useState({});
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

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white shadow-lg z-30 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } hidden md:block`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 bg-main text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <FaChevronRight size={10} />
        ) : (
          <FaChevronLeft size={10} />
        )}
      </button>

      {/* Header Sidebar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2 overflow-hidden">
          <img
            src="/petasan.webp"
            alt="Logo"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          {!isCollapsed && (
            <h2 className="text-lg font-bold text-main truncate">PETASAN</h2>
          )}
        </div>
      </div>

      {/* Profil Pengguna */}
      <div className="p-4 border-b">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "space-x-3"
          }`}
        >
          <div className="p-2 bg-main/10 rounded-full flex-shrink-0">
            <FaUser size={18} className="text-main" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Halo,</p>
              <p className="font-medium truncate">
                {pengguna?.email || "Inspektor"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="p-2 overflow-y-auto h-[calc(100vh-200px)]">
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
                      className={`w-full flex items-center justify-between p-2 rounded-md ${
                        aktif
                          ? "bg-main text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      } ${
                        !aksesDisetujui
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
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
                          <FaAngleDown size={16} />
                        ) : (
                          <FaAngleRight size={16} />
                        ))}
                    </button>

                    {/* Submenu - hanya tampil jika tidak diciutkan */}
                    {!isCollapsed && itemDiperluas[index] && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.submenu.map((subitem, subindex) => {
                          const subAktif = lokasi.pathname === subitem.href;
                          const subAksesDisetujui = cekAkses(subitem.href);

                          return (
                            <li key={subindex}>
                              <Link
                                to={subAksesDisetujui ? subitem.href : "#"}
                                className={`block p-2 rounded-md ${
                                  subAktif
                                    ? "bg-main/10 text-main font-medium"
                                    : "text-gray-700 hover:bg-gray-100"
                                } ${
                                  !subAksesDisetujui
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
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
                    className={`flex items-center p-2 rounded-md ${
                      aktif
                        ? "bg-main text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${
                      !aksesDisetujui ? "opacity-50 cursor-not-allowed" : ""
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

      {/* Divider */}
      <div className="px-2 my-3">
        <div className="h-px bg-gray-200"></div>
      </div>

      {/* Menu Logout */}
      <div className="p-2">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Keluar" : ""}
        >
          <FaSignOutAlt className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t p-4 mt-auto">
          <p className="text-sm text-gray-500 text-center">PETASAN v1.0</p>
          <p className="text-xs text-gray-400 text-center mt-1">
            PENGECEKAN TUNTAS SATU BULAN
          </p>
        </div>
      )}
    </aside>
  );
};

SidebarDesktop.propTypes = {
  pengguna: PropTypes.object,
  ruteDisetujui: PropTypes.array,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

export default SidebarDesktop;
