
import { Button } from "@/components/ui/button"
import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate} from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { login } from "@/redux/authSlice";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";



const Login = () => {
    const dispatch = useDispatch();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const auth = getAuth();

        try {
            setError(null);
            setLoading(true);
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredentials.user;
            dispatch(login({
                uid: user.uid,
                email: user.email,
                // tambahkan data lain jika diperlukan
            }));
           // Periksa apakah role sudah ada di Firestore
            const roleRef = doc(db, "userRoles", user.uid);
            const roleDoc = await getDoc(roleRef);
            // Jika role belum ada, tambahkan role
            if (!roleDoc.exists()) {
                await setDoc(doc(db, "userRoles", user.uid), {
                role: "user", // Ganti dengan role yang sesuai
                email: user.email
                });
            }
            const role = roleDoc.data().role;
            console.log("User logged in and role checked/added role: ", role);
            console.log("Login berhasil",userCredentials);
            if (role === "inspektor") {
                nav("/inspeksi");
            } else if (role === "admin") {
                nav("/");
                
            } else if (role === "diandra") {
                nav("/diandra");
            }
            
        } catch (error) {
            console.error("Error during login: ", error);
            setError(error.message);
        }

        setLoading(false);
    };
    return (
        <>
            <div className=" flex flex-col gap-2 content-center justify-center md:items-center md:h-screen">
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
                <Button size="lg" type="submit" className="mt-6 w-full">{loading ? "Loading..." : "Login"}</Button>   
                {error && <span className="text-red-600">{error}</span>}
                </form>
                </CardContent>
                <CardFooter>
                    <div className="grid w-full items-center  content-center justify-items-center">
                        <span>Belum punya akun ?</span>
                        <Button variant="ghost" size="lg" className="w-full"><Link to={"https://wa.me/6287761506513"} target="_blank" className="text-blue-600">Contact Admin &rarr; </Link> </Button>
                    </div>
                </CardFooter>
            </Card>
            </div>
           
        </>
    )
}

export default Login