import DiagramGangguan from "@/components/diagram/DiagramGangguan";
import DiagramPenyulangTrip from "@/components/diagram/DiagramPenyulangTrip";
// import { useSelector } from "react-redux";

const Home = () => {


// const user = useSelector ((state) => state.auth.user);
  return (
    <div className="p-2 md:py-20 md:w-full flex flex-col">
      <div className="text-2xl font-semibold border-b border-main">
        Dashboard Kinerja
      </div>
      <div className="md:grid md:grid-cols-2 md:px-40 md:py-8 md:gap-8 border-main border-b flex flex-col">
          <div className="">
            <DiagramGangguan />
          </div>
          <div className="h-[300px] md:h-full">
            <DiagramPenyulangTrip />
          </div>
      </div>
      <div className="pb-20 pt-2 md:pb-2 text-main text-sm font-semibold flex justify-center">Teknik Selong</div>
    </div>
  )
};
export default Home