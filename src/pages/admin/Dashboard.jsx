// import DiagramGangguan from "@/components/diagram/DiagramGangguan";
import Layouts from "@/pages/admin/Layouts";
// import DiagramPenyulangTrip from "@/components/diagram/DiagramPenyulangTrip";
import DiagramGangguanPenyulang from "@/components/diagram/DiagramGangguanPenyulang";
import TabelSegment from "@/components/diagram/TabelSegment";
import Top10gangguan from "@/components/diagram/Top10Gangguan";
import { TotalGangguan } from "@/pages/gangguan/dataGangguan";
import DiagramSumberGangguan from "@/components/diagram/DiagramSumberGangguan";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1)
  ); // Default awal tahun ini
  const [endDate, setEndDate] = useState(new Date()); // Default hari ini

  return (
    <Layouts>
      <div className="">
        <div className=" border-b border-main flex justify-between py-2">
          <span className="text-2xl font-semibold">Dashboard Kinerja</span>
          <div className="flex gap-2 justify-items-center justify-end px-6">
            <label>Start Date: </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="bg-transparent border border-main rounded-md px-2 text-black"
              dateFormat={"dd/MM/yyyy"}
            />
            <label>End Date: </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="bg-transparent border border-main rounded-md px-2 text-black"
              dateFormat={"dd/MM/yyyy"}
            />
          </div>
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
              <DiagramGangguanPenyulang
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div className="">
              <Top10gangguan startDate={startDate} endDate={endDate} />
            </div>
            <div className="h-full flex flex-col items-start">
              <DiagramSumberGangguan startDate={startDate} endDate={endDate} />
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
