import Body from "@/components/body"
import { Button } from "@/components/ui/button"

const Login = () => {
    return (
        <Body>
            Login
            <form action="">
                <input type="text" placeholder="input user" />
                <input type="password" placeholder="input password" />
                <Button>Login</Button>
            </form>
        </Body>
    )
}

export default Login