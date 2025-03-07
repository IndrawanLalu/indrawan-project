import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  where,
} from "firebase/firestore";
import Layouts from "../admin/Layouts";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import DatePicker from "react-datepicker";

const PengukuranTable = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  ); // Default awal tahun ini
  const [endDate, setEndDate] = useState(new Date()); // Default hari ini
  const [pengukuranList, setPengukuranList] = useState([]);
  const [garduData, setGarduData] = useState({});

  const [selectedGardu, setSelectedGardu] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectGardu = (gardu) => {
    setSelectedGardu(gardu);
    setIsOpen(true);
  };

  // Ambil data gardu dari Firestore
  useEffect(() => {
    const fetchGarduData = async () => {
      const querySnapshot = await getDocs(collection(db, "gardu"));
      const garduMap = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        garduMap[data.nama] = { alamat: data.alamat, kva: data.kva }; // Mapping berdasarkan nama gardu
      });
      setGarduData(garduMap);
    };

    fetchGarduData();
  }, []);

  // Ambil data pengukuran dari Firestore
  useEffect(() => {
    const q = query(
      collection(db, "Pengukuran"),
      where("tanggalUkur", ">=", format(startDate, "yyyy-MM-dd")),
      where("tanggalUkur", "<=", format(endDate, "yyyy-MM-dd"))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const pengukuran = doc.data();
        const gardu = garduData[pengukuran.nama] || {}; // Cocokkan berdasarkan nama gardu
        return {
          id: doc.id,
          ...pengukuran,
          alamat: gardu.alamat || "Tidak Diketahui",
          kva: gardu.kva || "Tidak Diketahui",
        };
      });
      setPengukuranList(data);
    });

    return () => unsubscribe();
  }, [garduData, startDate, endDate]); // Gunakan garduData sebagai dependency agar update saat berubah

  return (
    <Layouts>
      <div className="container mx-auto p-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold mb-4">Data Pengukuran</h2>
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-transparent border-main">
            <thead>
              <tr className="bg-main ">
                <th className="px-4 py-2 border">Nama Gardu</th>
                <th className="px-4 py-2 border">Alamat</th>
                <th className="px-4 py-2 border">KVA</th>
                <th className="px-4 py-2 border">R</th>
                <th className="px-4 py-2 border">S</th>
                <th className="px-4 py-2 border">T</th>
                <th className="px-4 py-2 border">N</th>
                <th className="px-4 py-2 border">Beban KVA</th>
                <th className="px-4 py-2 border">Persen KVA</th>
                <th className="px-4 py-2 border">UBL</th>
                <th className="px-4 py-2 border">Petugas</th>
                <th className="px-4 py-2 border">Jam</th>
                <th className="px-4 py-2 border">Tanggal Ukur</th>
                <th className="px-4 py-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {pengukuranList.map((item) => (
                <tr
                  key={item.id}
                  className="text-center border cursor-pointer"
                  onClick={() => handleSelectGardu(item)}
                >
                  <td className="px-4 py-2 border">{item.nama}</td>
                  <td className="px-4 py-2 border">{item.alamat}</td>
                  <td className="px-4 py-2 border">{item.kva}</td>
                  <td className="px-4 py-2 border">{item.R}</td>
                  <td className="px-4 py-2 border">{item.S}</td>
                  <td className="px-4 py-2 border">{item.T}</td>
                  <td className="px-4 py-2 border">{item.N}</td>
                  <td className="px-4 py-2 border">
                    {parseFloat(item.bebanKva).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">
                    {parseFloat(item.persenKva).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">
                    {parseFloat(item.unbalance).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">{item.petugas}</td>
                  <td className="px-4 py-2 border">{item.jamUkur}</td>
                  <td className="px-4 py-2 border">{item.tanggalUkur}</td>
                  <td className="border px-4 py-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSelectGardu(item)}
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Modal atau Detail di Bawah Tabel */}
          {/* MODAL DETAIL SHADCN */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Detail Beban Jurusan</DialogTitle>
              </DialogHeader>

              {selectedGardu && (
                <div className="space-y-2">
                  <p>
                    <strong>Gardu:</strong> {selectedGardu.nama}
                  </p>
                  <p>
                    <strong>Alamat:</strong> {selectedGardu.alamat}
                  </p>
                  <p>
                    <strong>KVA:</strong>{" "}
                    {parseFloat(selectedGardu.kva).toFixed(2)}
                  </p>

                  <h3 className="mt-2 font-bold">Beban Per Jurusan</h3>
                  <table className="min-w-full border-collapse border mt-2 text-center">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Jurusan</th>
                        <th className="border px-4 py-2">R</th>
                        <th className="border px-4 py-2">S</th>
                        <th className="border px-4 py-2">T</th>
                        <th className="border px-4 py-2">N</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["A", "B", "C", "D", "K"].map((line) => (
                        <tr key={line}>
                          <td className="border px-4 py-2 font-bold">
                            Jurusan {line}
                          </td>
                          <td className="border px-4 py-2">
                            {selectedGardu.perJurusan?.R?.[line] || 0}
                          </td>
                          <td className="border px-4 py-2">
                            {selectedGardu.perJurusan?.S?.[line] || 0}
                          </td>
                          <td className="border px-4 py-2">
                            {selectedGardu.perJurusan?.T?.[line] || 0}
                          </td>
                          <td className="border px-4 py-2">
                            {selectedGardu.perJurusan?.N?.[line] || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h3 className="mt-2 font-bold">Tegangan</h3>
                  <div className="flex flex-row gap-6">
                    <div className="">
                      <p>R-N : {selectedGardu.tegangan.R_N} Volt</p>
                      <p>S-N : {selectedGardu.tegangan.S_N} Volt</p>
                      <p>T-N : {selectedGardu.tegangan.T_N} Volt</p>
                    </div>
                    <div className="">
                      <p>R-N : {selectedGardu.tegangan.R_N} Volt</p>
                      <p>S-N : {selectedGardu.tegangan.S_N} Volt</p>
                      <p>T-N : {selectedGardu.tegangan.T_N} Volt</p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="destructive" onClick={() => setIsOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layouts>
  );
};

export default PengukuranTable;
