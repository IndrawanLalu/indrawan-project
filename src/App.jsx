import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux"; // Tambahkan import Provider
import { PersistGate } from "redux-persist/integration/react"; // Tambahkan import PersistGate
import { store, persistor } from "./redux/store"; // Import store dan persistor
import Amg from "./pages/Amg";
import Diandra from "./pages/Diandra";
import Home from "./pages/Home";
import Padam from "./pages/Padam";
import Login from "./pages/Login/Login";
import "./firebase/firebaseConfig";
import ProtectedRoute from "./components/ProtectedRoutes";
// import NavBarKu from "./components/NavBarKu";
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
import BebanGardu from "./pages/Gardu/BebanGardu";
import DetailGardu from "./pages/Gardu/DetailGardu";
import RencanaPekerjaan from "./pages/Gardu/RencanaPekerjaan";
import TargetGangguan from "./pages/gangguan/TargetGangguan";
import TambahTargetGangguan from "./pages/gangguan/TanbahTargetGangguann";
import Pengukuran from "./pages/Pengukuran/Pengukuran-form";
import DataPengukuran from "./pages/Pengukuran/DataPengukuran";
import DashboardPengukuran from "./pages/Pengukuran/DashboardPengukuran";
import NotificationsPage from "./pages/NotificationsPage";
import { NotificationProvider } from "./contexts/notifications";
import GarduDetailPage from "./pages/Pengukuran/GarduDetailPage";
import PetugasSelection from "./components/PetugasSelection";
import Preventive from "./pages/Inspeksi/Preventive";
import PreventiveDashboard from "./pages/Pemeliharaan/PreventiveDashboard";
import ManajemenPetugas from "./pages/admin/ManajemenPetugas ";

function App() {
  // Routes yang dapat diakses oleh admin saja
  const protectedRouteAdmin = [
    { path: "/notifications", element: <NotificationsPage /> },
    { path: "/admin/aset/penyulang", element: <Penyulang /> },
    { path: "/admin/aset/maps", element: <Maps /> },
    { path: "/aset/tambahPenyulang", element: <TambahPenyulang /> },
    { path: "/admin/dashboard", element: <Dashboard /> },
    { path: "/admin/gangguanPenyulang", element: <GangguanPenyulang /> },
    {
      path: "/admin/gangguanPenyulang/target-gangguan",
      element: <TargetGangguan />,
    },
    {
      path: "/admin/gangguanPenyulang/tambahTargetgangguan",
      element: <TambahTargetGangguan />,
    },
    {
      path: "/admin/gangguan-penyulang/peta-gangguan",
      element: <PetaGangguan />,
    },
    { path: "/admin/tambahGangguan", element: <TambahGangguan /> },
    { path: "/admin/data-gardu", element: <BebanGardu /> },
    { path: "/admin/detail-gardu/:nama", element: <DetailGardu /> },
    {
      path: "/admin/pengukuran-gardu",
      element: <DataPengukuran />,
    },
    {
      path: "/admin/dashboard-pengukuran",
      element: <DashboardPengukuran />,
    },
    {
      path: "/admin/history-pengukuran",
      element: <GarduDetailPage />,
    },
    {
      path: "/admin/gardu/rencana-pemeliharaan",
      element: <RencanaPekerjaan />,
    },
    {
      path: "/admin/gardu/notifikasi",
      element: <NotificationsPage />,
    },

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
    {
      path: "/admin/dashboard-preventive",
      element: <PreventiveDashboard />,
    },

    { path: "/admin/surat-masuk", element: <SuratMasuk /> },
    { path: "/admin/tambah-surat-masuk", element: <TambahSuratMasuk /> },
    { path: "/admin/manajemen-petugas", element: <ManajemenPetugas /> },
  ];
  const protectedRouteDiandra = [{ path: "/diandra", element: <Diandra /> }];
  // Routes yang dapat diakses oleh admin dan inspektor
  const sharedRoutes = [
    { path: "/", element: <Home /> },
    { path: "/amg", element: <Amg /> },
    { path: "/padam", element: <Padam /> },
    { path: "/menu", element: <Menu /> },
    { path: "/inspeksi", element: <Temuan /> },
    { path: "/pengukuran-form", element: <Pengukuran /> },
    { path: "/tambahTemuan", element: <TambahTemuan /> },
    { path: "/pemeliharaan", element: <Pemeliharaan /> },
    { path: "/eksekusi/:id", element: <EksekusiTemuan /> },
    { path: "/pilih-petugas", element: <PetugasSelection /> }, // Perbaiki double slash
    { path: "/preventive", element: <Preventive /> },
  ];

  return (
    // Tambahkan Provider dan PersistGate di sini
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationProvider>
          {/* <NavBarKu /> */}
          <Routes>
            {/* Route Public */}

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
                  <ProtectedRoute
                    allowedRoles={["admin", "inspektor", "har", "yantek"]}
                  >
                    {element}
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Catch-All Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <Toaster />
        </NotificationProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
