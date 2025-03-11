import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/authSlice";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

const Login = () => {
  const userLogin = useSelector((state) => state.auth.user); // Mengambil user dari Redux
  const nav = useNavigate();

  // useEffect ini menangani initial redirect berdasarkan role jika user sudah login
  useEffect(() => {
    // Hanya jika userLogin ada dan memiliki role, lakukan redirect sesuai role
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
        default:
          // Default untuk role lain
          nav("/dashboard");
          break;
      }
      console.log("Redirecting based on role:", role);
    }
  }, [userLogin, nav]);

  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      setError(null);
      setLoading(true);
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;

      // Periksa apakah role sudah ada di Firestore
      const roleRef = doc(db, "userRoles", user.uid);
      let roleDoc = await getDoc(roleRef);
      let role;

      // Jika role belum ada, tambahkan role default
      if (!roleDoc.exists()) {
        await setDoc(doc(db, "userRoles", user.uid), {
          role: "user", // Role default
          email: user.email,
        });
        role = "user";
      } else {
        // Ambil role dari dokumen yang ada
        role = roleDoc.data().role;
      }

      // Simpan data user ke Redux store
      dispatch(
        login({
          uid: user.uid,
          email: user.email,
          role: role,
          // tambahkan data lain jika diperlukan
        })
      );
      console.log("User logged in and role checked/added role: ", role);
      console.log("Login berhasil", userCredentials);

      // Simpan role dalam localStorage agar tersedia setelah refresh halaman (opsional)
      localStorage.setItem("userRole", role);

      // Tunggu beberapa waktu agar Redux state terupdate dengan baik
      setTimeout(() => {
        // Redirect berdasarkan role
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
          default:
            // Default redirect untuk user biasa atau role lainnya
            nav("/dashboard"); // atau halaman default lainnya
            break;
        }
        console.log(
          "Redirecting to:",
          role === "admin" ? "/admin/dashboard" : "/" + role
        );
      }, 100); // Penundaan singkat untuk memastikan dispatch selesai
    } catch (error) {
      console.error("Error during login: ", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative w-full min-h-screen">
        <div className="hidden  relative w-full min-h-screen items-center justify-center">
          {/* Gambar SVG sebagai background */}
          <img src="/petasan.webp" alt="login" className="h-[800px]" />

          {/* Form login yang diatur agar terletak di atas gambar */}
          <form
            onSubmit={handleLogin}
            className="absolute flex flex-col gap-4 top-[52%] left-[60%] translate-x-[-50%] translate-y-[-50%]  bg-white p-4 rounded-md"
          >
            <input
              type="email"
              placeholder="Email"
              className="input-field p-2 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field p-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className=" bg-[#EC644E] text-white py-2 rounded-md hover:bg-[#9ABAE3] transition-colors hover:shadow-md "
            >
              Login
            </button>
          </form>
        </div>
        <div className="relative w-full min-h-screen bg-[url('/petasan.webp')] bg-cover bg-center">
          <div className="flex flex-col gap-2 content-center justify-center items-center min-h-screen bg-white/70 p-6 rounded-md shadow-md">
            <Card>
              <CardHeader>
                <CardTitle>Login Form</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="grid w-full items-center gap-4 mb-6">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Input Your Email"
                      />
                    </div>
                  </div>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="Input Your Password"
                      />
                    </div>
                  </div>
                  <Button size="lg" type="submit" className="mt-6 w-full">
                    {loading ? "Loading..." : "Login"}
                  </Button>
                  {error && <span className="text-red-600">{error}</span>}
                </form>
              </CardContent>
              <CardFooter>
                <div className="grid w-full items-center content-center justify-items-center">
                  <span>Belum punya akun?</span>
                  <Button variant="ghost" size="lg" className="w-full">
                    <Link
                      to={"https://wa.me/6287761506513"}
                      target="_blank"
                      className="text-blue-600"
                    >
                      Contact Admin &rarr;
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
