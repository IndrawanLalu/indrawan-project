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

function App() {
  const protectedRoute = [
    { path: "/diandra", component: <Diandra /> },
    { path: "/amg", component: <Amg /> },
    { path: "/inspeksi", component: <Temuan /> },
    { path: "/pemeliharaan", component: <Pemeliharaan /> },
    { path: "/eksekusi/:id", component: <EksekusiTemuan /> },
    { path: "/padam", component: <Padam /> },
    { path: "/menu", component: <Menu /> },
    { path: "/tambahTemuan", component: <TambahTemuan /> },
    { path: "*", component: <Navigate to="/"></Navigate> },
    
  ];
  return (
    <>
      <NavBarKu />
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/login" Component={Login} />
        {/* <Route path="/signup" Component={SignUp} /> */}
        {protectedRoute.map(({ path, component }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute>{component}</ProtectedRoute>}
          />
        ))}
      </Routes>
    </>
  );
}

export default App;
