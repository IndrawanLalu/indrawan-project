import { TotalGangguan } from "./gangguan/dataGangguan";
import DiagramGangguanPenyulang from "@/components/diagram/DiagramGangguanPenyulang";
import Top10gangguan from "@/components/diagram/Top10Gangguan";
import Layouts from "@/pages/admin/Layouts";
// import { useSelector } from "react-redux";

const Home = () => {
  // const user = useSelector ((state) => state.auth.user);
  return (
    <Layouts>
      <div className="p-2 md:py-6 md:w-full flex flex-col">
        <div className="">
          <div className="text-2xl font-semibold border-b border-main">
            Dashboard Kinerja
          </div>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <TotalGangguan />
              </div>
            </div>
            <div className="text-2xl font-semibold pt-4">
              <span className="border-b border-main">Gangguan Penyulang</span>
            </div>
            <div className="grid md:grid-cols-3 w-full h-full gap-4">
              <div className="">
                <DiagramGangguanPenyulang />
              </div>
              <div className="">
                <Top10gangguan />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layouts>
  );
};
export default Home;
