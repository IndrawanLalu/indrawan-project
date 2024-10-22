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
  useEffect(() => {
    if (userLogin) {
      // Jika user sudah login, redirect ke halaman lain
      nav("/");
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
      const roleDoc = await getDoc(roleRef);
      // Jika role belum ada, tambahkan role
      if (!roleDoc.exists()) {
        await setDoc(doc(db, "userRoles", user.uid), {
          role: "user", // Ganti dengan role yang sesuai
          email: user.email,
        });
      }
      const role = roleDoc.data().role;
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
      if (role === "inspektor") {
        nav("/inspeksi");
      } else if (role === "admin") {
        nav("/admin/dashboard");
      } else if (role === "diandra") {
        nav("/diandra");
      } else if (role === "har") {
        nav("/pemeliharaan");
      }
    } catch (error) {
      console.error("Error during login: ", error);
      setError(error.message);
    }

    setLoading(false);
  };
  return (
    <>
      <div className="relative w-full min-h-screen">
        <div className="hidden  relative w-full min-h-screen items-center justify-center">
          {/* Gambar SVG sebagai background */}
          <img src="/login.svg" alt="login" className="h-[800px]" />

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
        <div className=" flex flex-col gap-2 content-center justify-center items-center min-h-screen">
          <Card>
            <CardHeader>
              <CardTitle>Login Form</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="grid w-full items-center gap-4 mb-6">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="input Your Email"
                    />
                  </div>
                </div>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Password</Label>
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="input Your password"
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
              <div className="grid w-full items-center  content-center justify-items-center">
                <span>Belum punya akun ?</span>
                <Button variant="ghost" size="lg" className="w-full">
                  <Link
                    to={"https://wa.me/6287761506513"}
                    target="_blank"
                    className="text-blue-600"
                  >
                    Contact Admin &rarr;{" "}
                  </Link>{" "}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;
