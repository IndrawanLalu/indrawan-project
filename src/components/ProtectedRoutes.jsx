import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const userRole = useSelector((state) => state.auth.user?.role); // Ambil role dari state Redux

  if (loading) {
    return <div>Loading...</div>; // Bisa ganti dengan loading spinner
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Cek apakah role pengguna ada di allowedRoles
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />; // Redirect jika role tidak sesuai
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired, // Perbaikan PropTypes
};

export default ProtectedRoute;
