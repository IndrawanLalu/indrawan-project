import { getAuth, signOut } from "firebase/auth";
import { CiLogin } from "react-icons/ci";
import { IoHome } from "react-icons/io5";
import { LuMenuSquare } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

import { logout } from "@/redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import DropdownMenuMobile from "./DropdownMenuMobile";
import AdminHover from "./adminHover";
const navigation = [
  { name: "Beban Gardu", href: "/amg" },
  { name: "Info Padam", href: "/padam" },
  { name: "Inspeksi", href: "/inspeksi" },
  { name: "Pemeliharaan", href: "/pemeliharaan" },
];
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
      <header className=" md:fixed md:w-full md:top-0 md:z-50 md:bg-main md:justify-items-between">
        {/* nav dekstop */}
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-4 lg:px-8"
        >
          <div className="hidden lg:flex lg:flex-1 lg:justify-start lg:z-50">
            {user?.role === "admin" ? (
              <Link to={"/"}>
                <AdminHover user={user?.email} role={user?.role} />
              </Link>
            ) : (
              <Link to={"/"}>
                {" "}
                <Button variant="neutral">
                  {user?.email}, {user?.role}
                </Button>{" "}
              </Link>
            )}
          </div>
          <div className="hidden lg:flex lg:gap-x-12 md:justify-center">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href}>
                <Button className="flex flex-col">{item.name}</Button>
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <div className="md:hidden z-50 flex justify-between items-center border-t-4 border-main bg-slate-100 p-4 fixed bottom-0 left-0 right-0 rounded-2xl">
            <ul className="flex justify-around w-full">
              <li className="hover:text-indigo-600 hover:animate-in ">
                <div className="flex flex-col items-center">
                  <Link to={"/"}>
                    <Button size="icon" className="flex flex-col">
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
                      <Button size="icon" className="flex flex-col">
                        {" "}
                        <LuMenuSquare />
                        Menu
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </li>
              <li className="hover:text-indigo-600 hover:animate-in ">
                <div className="flex flex-col items-center gap-2">
                  {user ? (
                    <DropdownMenuMobile
                      data={handleLogout}
                      email={user?.email}
                    />
                  ) : (
                    <>
                      <Link to={"/login"}>
                        <Button size="icon">
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
