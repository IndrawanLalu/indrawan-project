
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
    const auth = getAuth();
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>; // Bisa ganti dengan loading spinner
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
