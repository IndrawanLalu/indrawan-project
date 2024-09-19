import {
  LogOut,
  User,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import { getAuth } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import { IoIosSettings } from "react-icons/io";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";

const DropdownMenuMobile = () => {

  const auth = getAuth();
  const user = auth.currentUser;  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
         
          <Button size="iconNav" className="flex flex-col"><IoIosSettings />Seting</Button>
          
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
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
            <span onClick={handleLogout} >Log out</span>
            <DropdownMenuShortcut></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

export default DropdownMenuMobile