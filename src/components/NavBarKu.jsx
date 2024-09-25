
import { getAuth, signOut } from 'firebase/auth';
import { CiLogin } from "react-icons/ci";
import { IoHome } from "react-icons/io5";
import { LuMenuSquare } from "react-icons/lu";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';


import { logout } from '@/redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import DropdownMenuMobile from './DropdownMenuMobile';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '@/firebase/firebaseConfig';
// import TambahTemuan from '@/pages/Inspeksi/Tambah Temuan';

const navigation = [
  { name: 'Beban Gardu', href: '/amg' },
  { name: 'Info Padam', href: '/padam' },
  { name: 'Inspeksi', href: '/inspeksi' },
  { name: 'Company', href: '/#' },
]
// async function getUserRole(uid) {
//   try {
//     if (!uid) {
//       console.error("UID is not provided");
//       return null; // Mengembalikan null jika UID tidak ada
//     }
//     const docRef = doc(db, "userRoles", uid);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       return docSnap.data().role;
//     } else {
//       console.log("No such document!");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error getting user role: ", error);
//   }
// }
const NavBarKu = () => {
  const user = useSelector((state) => state.auth.user); // Mengambil user dari Redux
  // Kalo butuh role pakai disini
  // const [role, setRole] = useState(null);
  // useEffect(() => {
  //   if (user) {
  //     getUserRole(user.uid).then(setRole);
  //   }
  // }, [user]);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const auth = getAuth();
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
    <div className="bg-white">
      <header className="hidden md:grid md:fixed md:w-full md:top-0 md:z-50 bg-main/10 md:justify-items-between">
        {/* nav dekstop */}
        <nav aria-label="Global" className="flex items-center justify-between p-4 lg:px-8">
          <div className="hidden lg:flex lg:flex-1 lg:justify-start">
             <Link to={"/"}> <Button variant="neutral">{user?.email}, {user?.role}</Button> </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12 md:justify-center">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href} >
                <Button className="flex flex-col">
                {item.name}
                </Button>
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <Button variant="neutral" onClick={handleLogout}>Logoutt</Button>
          </div>
            <div className="md:hidden z-50 flex justify-between items-center border-t-4 border-main bg-slate-100 p-4 fixed bottom-0 left-0 right-0 rounded-2xl">
              <ul className="flex justify-around w-full">
                <li className='hover:text-indigo-600 hover:animate-in '>
                  <div className='flex flex-col items-center'>
                    
                    <Link to={"/"}>
                    <Button size="iconNav" className="flex flex-col">
                      <IoHome />Home
                      </Button>
                    </Link>
                  </div>
                </li>
                <li className='hover:text-indigo-600 hover:animate-in '>
                  {user?.role !== "diandra" ? (
                    <div className='flex flex-col items-center'>
                    <Link to={"menu"}>
                    <Button size="iconNav" className="flex flex-col"> <LuMenuSquare />Menu</Button>
                    </Link>
                  </div>
                  ): null}
                  
                </li>
                <li className='hover:text-indigo-600 hover:animate-in '>
                  <div className='flex flex-col items-center gap-2'>
                    {user ?
                    (
                      <DropdownMenuMobile />) : (
                    <>
                      
                      <Link to={"/login"}><Button size="iconNav">Login<CiLogin /></Button> </Link>
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
  )
}

export default NavBarKu