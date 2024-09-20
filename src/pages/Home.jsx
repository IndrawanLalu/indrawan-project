

import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";

const Home = () => {


const user = useSelector ((state) => state.auth.user);
  return (
    <>
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Project latihan sambil mengisi waktu.{' '}
              <a href="#" className="font-semibold text-indigo-600">
                <span aria-hidden="true" className="absolute inset-0" />
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Mudah mudahan bisa Bermanfaat
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Kedepan semoga bisa menjadi tools yang bisa membantu memudahkan pekerjaan
              dan membuat pekerjaan menjadi lebih mudah 😊
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button>
                {user ? "Welcome, "+user.email : "Login Here"}
              </Button>
            </div>
          </div>
        </div>
    </>
  )
};
export default Home