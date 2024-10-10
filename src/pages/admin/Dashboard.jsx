// import DiagramGangguan from "@/components/diagram/DiagramGangguan";
import Layouts from "@/pages/admin/Layouts";
// import DiagramPenyulangTrip from "@/components/diagram/DiagramPenyulangTrip";
import DiagramGangguanPenyulang from "@/components/diagram/DiagramGangguanPenyulang";
import TabelSegment from "@/components/diagram/TabelSegment";
import Top10gangguan from "@/components/diagram/Top10Gangguan";
import { TotalGangguan } from "@/pages/gangguan/dataGangguan";

const Dashboard = () => {
  return (
    <Layouts>
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
          <div className="text-2xl font-semibold pt-4">
            <span className="border-b border-main">Inspeksi Penyulang</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <TabelSegment />
          </div>
        </div>
      </div>
    </Layouts>
  );
};

export default Dashboard;
