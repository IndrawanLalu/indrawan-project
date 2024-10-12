import { getAuth, signOut } from "firebase/auth";
import { CiLogin } from "react-icons/ci";
import { IoHome } from "react-icons/io5";
import { LuMenuSquare } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

import { logout } from "@/redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import DropdownMenuMobile from "./DropdownMenuMobile";
// import AdminHover from "./adminHover";
// const navigation = [
//   { name: "Beban Gardu", href: "/amg" },
//   { name: "Info Padam", href: "/padam" },
//   { name: "Inspeksi", href: "/inspeksi" },
//   { name: "Pemeliharaan", href: "/pemeliharaan" },
// ];
const NavBarKu = () => {
  const user = useSelector((state) => state.auth.user); // Mengambil user dari Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-white">
      <header className="">
        {/* nav dekstop */}
        <nav>
          <div className="md:hidden z-50 flex justify-between items-center border-t-4 border-main bg-slate-100 p-4 fixed bottom-0 left-0 right-0 rounded-2xl">
            <ul className="flex justify-around w-full">
              <li className="hover:text-indigo-600 hover:animate-in ">
                <div className="flex flex-col items-center">
                  <Link to={"/"}>
                    <Button size="menuMobile" className="flex flex-col">
                      <IoHome />
                      Home
                    </Button>
                  </Link>
                </div>
              </li>
              <li className="hover:text-indigo-600 hover:animate-in ">
                {user?.role !== "diandra" ? (
                  <div className="flex flex-col items-center">
                    <Link to={"menu"}>
                      <Button size="menuMobile" className="flex flex-col">
                        {" "}
                        <LuMenuSquare />
                        Menu
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link to={"/diandra"}>
                    <Button size="menuMobile" className="flex flex-col">
                      {" "}
                      <LuMenuSquare />
                      Diandra
                    </Button>
                  </Link>
                )}
              </li>
              <li className="hover:text-indigo-600 hover:animate-in ">
                <div className="flex flex-col items-center gap-2">
                  {user ? (
                    <DropdownMenuMobile
                      onclick={handleLogout}
                      email={user?.email}
                    />
                  ) : (
                    <>
                      <Link to={"/login"}>
                        <Button size="menuMobile">
                          Login
                          <CiLogin />
                        </Button>{" "}
                      </Link>
                    </>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </nav>
        {/* dialog samping */}
      </header>
    </div>
  );
};

export default NavBarKu;
