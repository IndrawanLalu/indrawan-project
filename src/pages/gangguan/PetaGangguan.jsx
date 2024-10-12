import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Layouts from "@/pages/admin/Layouts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const PetaGangguan = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1)
  ); // Default awal tahun ini
  const [endDate, setEndDate] = useState(new Date()); // Default hari ini
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "gangguanPenyulang"), // Sesuaikan nama koleksi
          where("tanggalGangguan", ">=", format(startDate, "yyyy-MM-dd")),
          where("tanggalGangguan", "<=", format(endDate, "yyyy-MM-dd"))
        );
        const querySnapshot = await getDocs(q);
        const dataGangguan = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // Mengurutkan data berdasarkan tgl inspeksi dari yang terbaru ke terlama
        const sortedData = dataGangguan.sort(
          (a, b) => new Date(b.tanggalGangguan) - new Date(a.tanggalGangguan)
        );
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, [startDate, endDate]);
  const defaultLocation = [-8.647901, 116.532735]; // Contoh lokasi Jakarta
  // Fungsi untuk memproses lokasi yang berbentuk string menjadi array [lat, lng]
  const processLocation = (lokasiString) => {
    if (lokasiString) {
      const [lat, lng] = lokasiString
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      return [lat, lng]; // Mengembalikan array [latitude, longitude]
    }
    return null;
  };

  return (
    <Layouts>
      <div className=" border-b border-main flex justify-between py-2">
        <span className="text-2xl font-semibold">Peta Lokasi Gangguan</span>
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
      <div className="pt-6">
        <MapContainer
          center={
            data.length > 0 && processLocation(data[0].lokasiGangguan)
              ? processLocation(data[0].lokasiGangguan)
              : defaultLocation
          }
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: "800px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((gangguan) => {
            const lokasi = processLocation(gangguan.lokasiGangguan);
            return lokasi ? (
              <Marker key={gangguan.id} position={lokasi}>
                <Popup>
                  Tanggal: {gangguan.tanggalGangguan} <br />
                  Penyulang: {gangguan.penyulang} <br />
                  Penyebab: {gangguan.penyebab} <br />
                </Popup>
              </Marker>
            ) : null;
          })}
        </MapContainer>
      </div>
    </Layouts>
  );
};

export default PetaGangguan;
