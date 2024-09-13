import Body from "@/components/body"
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
  

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate} from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";



const SignUp = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const hendleSubmit = async (e) => {
        e.preventDefault();
        const auth = getAuth();

        try {
            setError(null);
            setLoading(true);
            const credentials = await createUserWithEmailAndPassword(auth, email, password);
            console.log(credentials);
            nav("/login");
        } catch (error) {
            setError(error.message);
        }

        setLoading(false);
    };
    return (
        <Body>
            <div className="h-screen grid grid-cols-1 gap-4 content-center justify-items-center">
            <Card className=" w-[300px] bg-slate-400/50">
                <CardHeader>
                    <CardTitle>Sign Up Form</CardTitle>
                    <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={hendleSubmit}>
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
                <Button variant="secondary" size="lg" type="submit" className="mt-6 w-full">{loading ? "Loading..." : "Sign Up"}</Button>   
                {error && <span className="text-red-600">{error}</span>}
                </form>
                </CardContent>
                <CardFooter>
                 
                </CardFooter>
            </Card>
            </div>
           
        </Body>
    )
}

export default SignUp