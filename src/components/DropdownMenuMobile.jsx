import { LogOut, User } from "lucide-react";
import PropTypes from "prop-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// import { getAuth } from "firebase/auth";
// import { signOut } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
import { IoIosSettings } from "react-icons/io";
import { Button } from "./ui/button";
// import { useDispatch } from "react-redux";
// import { logout } from "@/redux/authSlice";

const DropdownMenuMobile = ({ onclick, email }) => {
  // const auth = getAuth();
  // const user = auth.currentUser;
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  // const handleLogout = async () => {
  //   try {
  //     await signOut(auth);
  //     dispatch(logout());
  //     navigate("/login");
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   }
  // };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="flex flex-col">
          <IoIosSettings />
          Seting
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span onClick={onclick}>Log out</span>
          <DropdownMenuShortcut></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
DropdownMenuMobile.props;
// Validasi tipe props
DropdownMenuMobile.propTypes = {
  email: PropTypes.string.isRequired, // Menentukan bahwa user harus bertipe string dan wajib
  onclick: PropTypes.func.isRequired, // Menentukan bahwa role harus bertipe string dan wajib
};

export default DropdownMenuMobile;
