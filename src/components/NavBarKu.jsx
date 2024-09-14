
import { Button } from './ui/button'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { IoHome } from "react-icons/io5";
import { CiLogin } from "react-icons/ci";
import { LuMenuSquare } from "react-icons/lu";
import { Link, useNavigate } from 'react-router-dom'
import { IoIosSettings } from "react-icons/io";
import { getAuth } from 'firebase/auth';
import { signOut } from 'firebase/auth';


import { useState } from 'react';
import DropdownMenuMobile from './DropdownMenuMobile';

const navigation = [
  { name: 'Beban Gardu', href: '/amg' },
  { name: 'Info Padam', href: '/padam' },
  { name: 'Marketplace', href: '/#' },
  { name: 'Company', href: '/#' },
]
const NavBarKu = () => {
  
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState (false)

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        {/* nav dekstop */}
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href} className="px-2 rounded-md hover:bg-[#4F46E5] hover:text-white text-sm font-semibold leading-6 text-gray-900">
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <Button onClick={handleLogout}>Logoutt</Button>
          </div>
            <div className="md:hidden flex justify-between items-center border-t border-[#4F46E5] p-2 fixed bottom-0 left-0 right-0 rounded-3xl">
              <ul className="flex justify-around w-full">
                <li className='hover:text-indigo-600 hover:animate-in '>
                  <div className='flex flex-col items-center'>
                    <IoHome />
                    <Button variant="ghost ">Home</Button>
                  </div>
                </li>
                <li className='hover:text-indigo-600 hover:animate-in '>
                  <div className='flex flex-col items-center'>
                    <LuMenuSquare />
                    <Button variant="ghost ">Menu</Button>
                  </div>
                </li>
                <li className='hover:text-indigo-600 hover:animate-in '>
                  <div className='flex flex-col items-center'>
                    {user ?
                    (<>
                      <IoIosSettings />
                      <DropdownMenuMobile /></>) : (
                    <>
                      <CiLogin />
                      <Link to={"/login"}><Button variant="ghost ">Login</Button> </Link>
                    </>
                  )}
                    </div>
                </li>
              </ul>
            </div>
        </nav>
        {/* dialog samping */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                    <a
                      href="/login"
                      onClick={''}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      <span className='mr-2'>{user ? user.email : ''}</span>
                      {user ? <Button onClick={handleLogout}>Logoutt</Button> : 'Login Here'}
                    </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
    </div>
  )
}

export default NavBarKu