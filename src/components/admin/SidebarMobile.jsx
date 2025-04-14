import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaBookMedical,
  FaChartLine,
  FaBars,
  FaTimes,
  FaAngleDown,
  FaAngleRight,
  FaHome,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import {
  FcCameraIdentification,
  FcBinoculars,
  FcInspection,
} from "react-icons/fc";
import { useDispatch } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import { logout } from "@/redux/authSlice";

// Data navigasi - bisa dipindahkan ke file terpisah atau diterima sebagai props
const navigasi = [
  { nama: "Beranda", href: "/", icon: FaHome },
  { nama: "Beban Gardu", href: "/amg", icon: FaChartLine },
  { nama: "Temuan Inspeksi", href: "/inspeksi", icon: FcBinoculars },
  {
    nama: "Gangguan Penyulang",
    href: "#",
    icon: FaBookMedical,
    submenu: [{ nama: "Gangguan Penyulang", href: "/admin/gangguanPenyulang" }],
  },
  { nama: "Ukur Gardu", href: "/pengukuran-form", icon: FcInspection },
  { nama: "Preventive", href: "/preventive", icon: FcCameraIdentification },
];

const SidebarMobile = ({ pengguna, ruteDisetujui = [] }) => {
  const [terbuka, setTerbuka] = useState(false);
  const [itemDiperluas, setItemDiperluas] = useState({});
  const lokasi = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Menutup sidebar ketika klik di luar area sidebar
  useEffect(() => {
    const handleKlikLuar = (event) => {
      const sidebar = document.getElementById("sidebar-mobile");
      const tombol = document.getElementById("tombol-sidebar");

      if (
        terbuka &&
        sidebar &&
        !sidebar.contains(event.target) &&
        tombol &&
        !tombol.contains(event.target)
      ) {
        setTerbuka(false);
      }
    };

    document.addEventListener("mousedown", handleKlikLuar);
    return () => {
      document.removeEventListener("mousedown", handleKlikLuar);
    };
  }, [terbuka]);

  // Menutup sidebar ketika rute berubah
  useEffect(() => {
    setTerbuka(false);
  }, [lokasi.pathname]);

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
    <>
      {/* Tombol Toggle Sidebar - Tetap di kiri atas */}
      <button
        id="tombol-sidebar"
        onClick={() => setTerbuka(!terbuka)}
        className="fixed top-4 left-4 z-40 bg-main text-white p-2 rounded-lg shadow-lg md:hidden"
        aria-label="Toggle sidebar"
      >
        <FaBars size={20} />
      </button>

      {/* Overlay - Hanya tampil ketika sidebar terbuka */}
      {terbuka && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setTerbuka(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-mobile"
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transition-transform duration-300 ease-in-out transform ${
          terbuka ? "translate-x-0" : "-translate-x-full"
        } md:hidden overflow-y-auto`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <img
              src="/petasan.webp"
              alt="Logo"
              className="w-8 h-8 rounded-full"
            />
            <h2 className="text-lg font-bold text-main">PETASAN</h2>
          </div>
          <button
            onClick={() => setTerbuka(false)}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Tutup sidebar"
          >
            <FaTimes size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Profil Pengguna */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-main/10 rounded-full">
              <FaUser size={18} className="text-main" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Halo,</p>
              <p className="font-medium">{pengguna?.email || "Inspektor"}</p>
            </div>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="p-2">
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
                        <div className="flex items-center">
                          <item.icon className="w-5 h-5 mr-3" />
                          <span>{item.nama}</span>
                        </div>
                        {itemDiperluas[index] ? (
                          <FaAngleDown size={16} />
                        ) : (
                          <FaAngleRight size={16} />
                        )}
                      </button>

                      {/* Submenu */}
                      {itemDiperluas[index] && (
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
                      }`}
                      onClick={(e) => !aksesDisetujui && e.preventDefault()}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span>{item.nama}</span>
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
            className="w-full flex items-center p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t p-4 mt-auto">
          <p className="text-sm text-gray-500 text-center">PETASAN v1.0</p>
          <p className="text-xs text-gray-400 text-center mt-1">
            PENGECEKAN TUNTAS SATU BULAN
          </p>
        </div>
      </aside>
    </>
  );
};

SidebarMobile.propTypes = {
  pengguna: PropTypes.object,
  ruteDisetujui: PropTypes.array,
};

export default SidebarMobile;
