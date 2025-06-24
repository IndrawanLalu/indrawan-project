import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/authSlice";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { LuEye, LuEyeOff, LuMail, LuLock } from "react-icons/lu";

const Login = () => {
  const userLogin = useSelector((state) => state.auth.user);
  const nav = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Efek menangani redirect berdasarkan role jika user sudah login
  useEffect(() => {
    if (userLogin && userLogin.role) {
      const role = userLogin.role;
      switch (role) {
        case "inspektor":
          nav("/inspeksi");
          break;
        case "admin":
          nav("/admin/dashboard");
          break;
        case "diandra":
          nav("/diandra");
          break;
        case "har":
          nav("/pemeliharaan");
          break;
        case "yantek":
          nav("/pilih-petugas");
          break;
        default:
          nav("/dashboard");
          break;
      }
    }
  }, [userLogin, nav]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;

      // Periksa role di Firestore
      const roleRef = doc(db, "userRoles", user.uid);
      let roleDoc = await getDoc(roleRef);
      let role;
      let unit = null; // Inisialisasi unit

      if (!roleDoc.exists()) {
        await setDoc(doc(db, "userRoles", user.uid), {
          role: "user",
          email: user.email,
          unit: null, // Tambahkan unit dengan nilai default null
        });
        role = "user";
      } else {
        role = roleDoc.data().role;
        unit = roleDoc.data().unit || null; // Ambil unit jika ada
      }

      // Simpan data user ke Redux
      dispatch(
        login({
          uid: user.uid,
          email: user.email,
          role: role,
          unit: unit, // Tambahkan unit ke payload login
        })
      );

      localStorage.setItem("userRole", role);
      localStorage.setItem("userUnit", unit); // Simpan unit ke localStorage

      // Redirect berdasarkan role
      setTimeout(() => {
        switch (role) {
          case "inspektor":
            nav("/inspeksi");
            break;
          case "admin":
            nav("/admin/dashboard");
            break;
          case "diandra":
            nav("/diandra");
            break;
          case "har":
            nav("/pemeliharaan");
            break;
          case "yantek":
            nav("/pilih-petugas");
            break;
          default:
            nav("/dashboard");
            break;
        }
      }, 100);
    } catch (error) {
      console.error("Error during login: ", error);
      let errorMessage = "Login gagal. Silakan coba lagi.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "Email tidak ditemukan";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Password salah";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Format email tidak valid";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Terlalu banyak percobaan. Coba lagi nanti";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left-panel">
          <div className="overlay"></div>
          <img
            src="/petasan.webp"
            alt="Login Background"
            className="bg-image"
          />
          <div className="panel-content">
            <h1>Selamat Datang di PETASAN</h1>
            <p>Pengecekan Tuntas Satu Bulan</p>
          </div>
        </div>

        <div className="login-right-panel">
          <div className="glass-effect">
            <div className="login-header">
              <h2>Login</h2>
              <p>Masukkan kredensial untuk mengakses akun Anda</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-container">
                  <LuMail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-header">
                  <label htmlFor="password">Password</label>
                  <Link to="#" className="forgot-password">
                    Lupa password?
                  </Link>
                </div>
                <div className="input-container">
                  <LuLock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <LuEyeOff /> : <LuEye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="error-icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <div className="loader-container">
                    <div className="loader"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Belum punya akun?{" "}
                <Link
                  to={"https://wa.me/6287761506513"}
                  target="_blank"
                  className="contact-admin"
                >
                  Hubungi Admin
                </Link>
              </p>
            </div>
          </div>

          <div className="copyright">
            <p>© 2025 Petasan | ULP Selong. All rights reserved.</p>
          </div>
        </div>
      </div>

      <style>{`
        /* Reset dan base styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        /* Login page container */
        .login-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ef 100%);
        }
        
        /* Main container with split panels */
        .login-container {
          width: 100%;
          max-width: 1200px;
          min-height: 600px;
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          position: relative;
        }
        
        /* Left panel with background image */
        .login-left-panel {
          flex: 1;
          background-color: #1e293b;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
          color: white;
        }
        
        /* Overlay for left panel */
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(17, 24, 39, 0.8) 100%);
          z-index: 1;
        }
        
        /* Background image */
        .bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
        }
        
        /* Content in left panel */
        .panel-content {
          position: relative;
          z-index: 2;
          text-align: center;
          animation: fadeIn 1.2s ease-out;
        }
        
        .panel-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .panel-content p {
          font-size: 1.1rem;
          opacity: 0.85;
          max-width: 300px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        /* Right panel with form */
        .login-right-panel {
          flex: 1;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(243, 244, 246, 0.8) 100%);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        
        /* Pattern background for right panel */
        .login-right-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20px 20px, rgba(37, 99, 235, 0.1) 0, rgba(37, 99, 235, 0.1) 2px, transparent 0),
            linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05));
          background-size: 40px 40px, 100% 100%;
          opacity: 0.5;
        }
        
        /* Decorative circles */
        .login-right-panel::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 70%, transparent 100%);
          top: -150px;
          right: -150px;
        }
        
        /* Glass effect container */
        .glass-effect {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 10px 15px -3px rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(255, 255, 255, 0.8) inset;
          position: relative;
          z-index: 2;
          overflow: hidden;
          animation: slideUp 0.8s ease-out;
        }
        
        /* Glass effect gradient overlay */
        .glass-effect::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0.8) 0%, 
            rgba(255, 255, 255, 0.4) 100%);
          z-index: -1;
        }
        
        /* Header styles */
        .login-header {
          margin-bottom: 32px;
          text-align: center;
        }
        
        .login-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .login-header p {
          color: #64748b;
          font-size: 0.95rem;
        }
        
        /* Form styles */
        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        /* Form group */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        /* Labels */
        .form-group label {
          font-weight: 500;
          font-size: 0.9rem;
          color: #334155;
        }
        
        /* Password header with forgot link */
        .password-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .forgot-password {
          font-size: 0.8rem;
          color: #2563eb;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .forgot-password:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        
        /* Input container with icon */
        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        /* Input icon */
        .input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          font-size: 1.1rem;
          transition: color 0.2s;
        }
        
        /* Form inputs */
        .input-container input {
          width: 100%;
          padding: 12px 12px 12px 42px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background-color: rgba(255, 255, 255, 0.8);
          color: #1e293b;
          font-size: 0.95rem;
          transition: all 0.25s;
          backdrop-filter: blur(5px);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .input-container input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          outline: none;
        }
        
        .input-container input::placeholder {
          color: #94a3b8;
        }
        
        /* Input focus effect */
        .input-container:focus-within .input-icon {
          color: #3b82f6;
        }
        
        /* Password visibility toggle */
        .toggle-password {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: color 0.2s;
        }
        
        .toggle-password:hover {
          color: #64748b;
        }
        
        /* Error message */
        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #dc2626;
          font-size: 0.9rem;
          animation: fadeIn 0.3s ease-out;
        }
        
        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          animation: pulse 1.5s infinite;
        }
        
        /* Login button */
        .login-button {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }
        
        /* Button hover and active states */
        .login-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 6px 10px -1px rgba(37, 99, 235, 0.3);
          transform: translateY(-1px);
        }
        
        .login-button:active {
          transform: translateY(1px);
          box-shadow: 0 2px 4px -1px rgba(37, 99, 235, 0.2);
        }
        
        /* Button shimmer effect */
        .login-button::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
        }
        
        /* Button disabled state */
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        /* Loading spinner */
        .loader-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .loader {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        /* Footer styles */
        .login-footer {
          margin-top: 24px;
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .contact-admin {
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .contact-admin:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        
        /* Copyright text */
        .copyright {
          margin-top: 20px;
          font-size: 0.75rem;
          color: #94a3b8;
          text-align: center;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          100% { left: 100%; }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            min-height: auto;
          }
          
          .login-left-panel {
            display: none;
          }
          
          .login-right-panel {
            padding: 30px 20px;
          }
          
          .glass-effect {
            padding: 30px;
          }
          
          .login-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
