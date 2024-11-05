import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Amg from "./pages/Amg";
import Diandra from "./pages/Diandra";
import Home from "./pages/Home";
import Padam from "./pages/Padam";
import Login from "./pages/Login/Login";
import "./firebase/firebaseConfig";
import ProtectedRoute from "./components/ProtectedRoutes";
import NavBarKu from "./components/NavBarKu";
import Temuan from "./pages/Inspeksi/Temuan";
import Pemeliharaan from "./pages/Pemeliharaan/Pemeliharaan";
import EksekusiTemuan from "./pages/Pemeliharaan/EksekusiTemuan";
import Menu from "./pages/Menu/Menu";
import TambahTemuan from "./pages/Inspeksi/Tambah Temuan";
import Penyulang from "./pages/Aset/Penyulang";
import TambahPenyulang from "./pages/Aset/TambahPenyulang";
import { Toaster } from "./components/ui/toaster";
import Unauthorrized from "./pages/Unauthorrized";
import Dashboard from "./pages/admin/Dashboard";
import GangguanPenyulang from "./pages/gangguan/GangguanPenyulang";
import TambahGangguan from "./pages/gangguan/Tambah Gangguan";
import SeedSegment from "./seeder/seedPage";
import Segment from "./pages/segment/Segment";
import PetaGangguan from "./pages/gangguan/PetaGangguan";
import DaftarPemeliharaan from "./pages/Pemeliharaan/DaftarPemeliharaan";
import UpdateDataTemuan from "./pages/Pemeliharaan/UpdateDataTemuan";
import CetakWo from "./pages/Pemeliharaan/CetakWo";
import SuratMasuk from "./pages/SuratMasuk/SuratMasuk";
import TambahSuratMasuk from "./pages/SuratMasuk/TambahSuratMasuk";
import Maps from "./pages/Aset/Maps";
import Sld from "./pages/Aset/SLD";

function App() {
  // Routes yang dapat diakses oleh admin saja
  const protectedRouteAdmin = [
    { path: "/admin/aset/penyulang", element: <Penyulang /> },
    { path: "/admin/aset/maps", element: <Maps /> },
    { path: "/admin/aset/sld", element: <Sld /> },
    { path: "/aset/tambahPenyulang", element: <TambahPenyulang /> },
    { path: "/admin/dashboard", element: <Dashboard /> },
    { path: "/admin/gangguanPenyulang", element: <GangguanPenyulang /> },
    {
      path: "/admin/gangguanPenyulang/peta-gangguan",
      element: <PetaGangguan />,
    },
    { path: "/admin/tambahGangguan", element: <TambahGangguan /> },
    { path: "/admin/seeder", element: <SeedSegment /> },
    { path: "/admin/data-segment", element: <Segment /> },
    {
      path: "/admin/pemeliharaan/daftar-pemeliharaan",
      element: <DaftarPemeliharaan />,
    },
    {
      path: "/admin/pemeliharaan/update-temuan/:id",
      element: <UpdateDataTemuan />,
    },
    {
      path: "/admin/pemeliharaan/cetak-wo",
      element: <CetakWo />,
    },

    { path: "/admin/surat-masuk", element: <SuratMasuk /> },
    { path: "/admin/tambah-surat-masuk", element: <TambahSuratMasuk /> },
  ];
  const protectedRouteDiandra = [{ path: "/diandra", element: <Diandra /> }];
  // Routes yang dapat diakses oleh admin dan inspektor
  const sharedRoutes = [
    { path: "/amg", element: <Amg /> },
    { path: "/padam", element: <Padam /> },
    { path: "/menu", element: <Menu /> },
    { path: "/inspeksi", element: <Temuan /> },
    { path: "/tambahTemuan", element: <TambahTemuan /> },
    { path: "/pemeliharaan", element: <Pemeliharaan /> },
    { path: "/eksekusi/:id", element: <EksekusiTemuan /> },
  ];

  return (
    <>
      <NavBarKu />
      <Routes>
        {/* Route Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorrized />} />

        {/* Route Admin */}
        {protectedRouteAdmin.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                {element}
              </ProtectedRoute>
            }
          />
        ))}
        {/* Route Admin */}
        {protectedRouteDiandra.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={["diandra", "admin"]}>
                {element}
              </ProtectedRoute>
            }
          />
        ))}

        {/* Route untuk Admin dan Inspektor */}
        {sharedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={["admin", "inspektor", "har"]}>
                {element}
              </ProtectedRoute>
            }
          />
        ))}

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
