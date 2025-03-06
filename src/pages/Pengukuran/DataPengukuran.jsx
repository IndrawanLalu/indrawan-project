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
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import Layouts from "../admin/Layouts";
import { Button } from "@/components/ui/button";

const PengukuranTable = () => {
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
    const q = query(collection(db, "Pengukuran"), orderBy("createdAt", "desc"));

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
  }, [garduData]); // Gunakan garduData sebagai dependency agar update saat berubah

  return (
    <Layouts>
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Data Pengukuran</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
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
