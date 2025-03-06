import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  where,
  query,
} from "firebase/firestore";
import { EditIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layouts from "@/pages/admin/Layouts";
import ModalDialog from "@/lib/dialog";
import { TbMapSearch } from "react-icons/tb";
import { format } from "date-fns";
import DatePicker from "react-datepicker";

const GangguanPenyulang = () => {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null); // State untuk mengontrol item yang sedang di-edit
  const [selectedItem, setSelectedItem] = useState(null); // State untuk item yang akan dihapus
  const [error, setError] = useState(""); // State untuk menangani error
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk kontrol modal

  const { toast } = useToast();
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

  const handleEditClick = (item) => {
    setEditItem(item); // Set item yang sedang di-edit
  };
  // Fungsi untuk meng-cancel edit
  const handleCancel = () => {
    setEditItem(null); // Set editItem kembali ke null untuk menutup form edit
    setError("");
  };

  // Fungsi untuk meng-handle update data di Firestore
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (
      !editItem.keypoint ||
      !editItem.penyulang ||
      !editItem.fasilitasPadam ||
      !editItem.jamPadam ||
      !editItem.jamNyala ||
      !editItem.durasi ||
      !editItem.tanggalGangguan ||
      !editItem.indikasi ||
      !editItem.kodeGangguan ||
      !editItem.arusR ||
      !editItem.arusS ||
      !editItem.arusT ||
      !editItem.arusN ||
      !editItem.penyebab
    ) {
      setError("Semua field harus diisi."); // Set pesan error jika input kosong

      return;
    }
    try {
      const itemDocRef = doc(db, "gangguanPenyulang", editItem.id); // Mengambil referensi dokumen di Firestore
      await updateDoc(itemDocRef, {
        noGangguanAPKT: editItem.noGangguanAPKT,
        keypoint: editItem.keypoint,
        penyulang: editItem.penyulang,
        fasilitasPadam: editItem.fasilitasPadam,
        jamPadam: editItem.jamPadam,
        jamNyala: editItem.jamNyala,
        durasi: editItem.durasi,
        tanggalGangguan: editItem.tanggalGangguan,
        indikasi: editItem.indikasi,
        kodeGangguan: editItem.kodeGangguan,
        arusR: editItem.arusR,
        arusS: editItem.arusS,
        arusT: editItem.arusT,
        arusN: editItem.arusN,
        penyebab: editItem.penyebab,
        lokasiGangguan: editItem.lokasiGangguan,
      });

      // Update data di state
      setData((prevData) =>
        prevData.map((item) => (item.id === editItem.id ? editItem : item))
      );
      console.log(error);
      setEditItem(null); // Reset editItem setelah update
      setError(""); // Reset error setelah update berhasil
      // Tampilkan toast sukses
      toast({
        variant: "success",
        title: "Updated",
        description: "Data Berhasil diupdate",
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  // Fungsi untuk menghapus data di Firestore
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };
  // Fungsi untuk menghapus data di Firestore
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteDoc(doc(db, "gangguanPenyulang", selectedItem.id));
      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedItem.id)
      );

      // Tampilkan toast sukses
      toast({
        variant: "success",
        title: "Deleted",
        description: "Data berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "error",
        title: "Failed",
        description: "Gagal menghapus data",
      });
    }

    // Tutup modal setelah konfirmasi
    handleCloseModal();
  };
  return (
    <Layouts>
      <div className="w-full text-center mx-auto px-4">
        <div className="flex flex-col">
          <div className=" border-b border-main flex justify-between py-2">
            <span className="text-2xl font-semibold">Gangguan Penyulang</span>
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
          <div className="flex gap-4 items-center">
            <span className="text-2xl font-semibold">Tambah</span>
            <Link to="/admin/tambahGangguan">
              <Button type="button" size="sm">
                <PlusCircleIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div
          className={`grid transition-all duration-5000 ease-in-out ${
            editItem ? "grid-cols-3 gap-4 " : "grid-cols-1"
          }`}
        >
          <div className="col-span-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]">#</TableHead>
                  <TableHead>No. Gangguan</TableHead>
                  <TableHead>Key Point</TableHead>
                  <TableHead>Penyulang</TableHead>
                  <TableHead>Fasilitas Padam</TableHead>
                  <TableHead>Jam Padam</TableHead>
                  <TableHead>Jam Nyala</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Tgl. Gangguan</TableHead>
                  <TableHead>Indikasi</TableHead>
                  <TableHead>Kode Gangguan</TableHead>
                  <TableHead>Arus R</TableHead>
                  <TableHead>Arus S</TableHead>
                  <TableHead>Arus T</TableHead>
                  <TableHead>Arus N</TableHead>
                  <TableHead>Penyebab</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.noGangguanAPKT}</TableCell>
                    <TableCell>{item.keypoint}</TableCell>
                    <TableCell>{item.penyulang}</TableCell>
                    <TableCell>{item.fasilitasPadam}</TableCell>
                    <TableCell>{item.jamPadam}</TableCell>
                    <TableCell>{item.jamNyala}</TableCell>
                    <TableCell>{item.durasi}</TableCell>
                    <TableCell>
                      {new Date(item.tanggalGangguan).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell>{item.indikasi}</TableCell>
                    <TableCell>{item.kodeGangguan}</TableCell>
                    <TableCell>{item.arusR}</TableCell>
                    <TableCell>{item.arusS}</TableCell>
                    <TableCell>{item.arusT}</TableCell>
                    <TableCell>{item.arusN}</TableCell>
                    <TableCell>{item.penyebab}</TableCell>
                    <TableCell>
                      {item.lokasiGangguan === "-" ? (
                        "-"
                      ) : item.lokasiGangguan ? (
                        <Link
                          to={
                            "https://www.google.com/maps/place/" +
                            item.lokasiGangguan
                          }
                          target="_blank"
                        >
                          <span className="gap-2 flex bg-main text-white p-1 rounded items-center hover:bg-gray-600">
                            <TbMapSearch />
                            Maps
                          </span>
                        </Link>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="neutral"
                          onClick={() => handleEditClick(item)}
                        >
                          <EditIcon className="h-4 w-4 text-main" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="neutral"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {editItem && (
            <div className="mt-10 p-4 border rounded shadow-lg shadow-main col-span-1">
              <h3 className="text-xl font-semibold">Edit Penyulang</h3>
              <form>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">noGangguanAPKT</Label>
                  <Input
                    name="noGangguanAPKT"
                    type="text"
                    value={editItem.noGangguanAPKT}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        noGangguanAPKT: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">keypoint</Label>
                  <Input
                    name="keypoint"
                    type="text"
                    value={editItem.keypoint}
                    onChange={(e) =>
                      setEditItem({ ...editItem, keypoint: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">penyulang</Label>
                  <Input
                    name="penyulang"
                    type="text"
                    value={editItem.penyulang}
                    onChange={(e) =>
                      setEditItem({ ...editItem, penyulang: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">fasilitasPadam</Label>
                  <Input
                    name="fasilitasPadam"
                    type="text"
                    value={editItem.fasilitasPadam}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        fasilitasPadam: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">jamPadam</Label>
                  <Input
                    name="jamPadam"
                    type="text"
                    value={editItem.jamPadam}
                    onChange={(e) =>
                      setEditItem({ ...editItem, jamPadam: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">jamNyala</Label>
                  <Input
                    name="jamNyala"
                    type="text"
                    value={editItem.jamNyala}
                    onChange={(e) =>
                      setEditItem({ ...editItem, jamNyala: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">durasi</Label>
                  <Input
                    name="durasi"
                    type="text"
                    value={editItem.durasi}
                    onChange={(e) =>
                      setEditItem({ ...editItem, durasi: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">tanggalGangguan</Label>
                  <Input
                    name="tanggalGangguan"
                    type="text"
                    value={editItem.tanggalGangguan}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        tanggalGangguan: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">indikasi</Label>
                  <Input
                    name="indikasi"
                    type="text"
                    value={editItem.indikasi}
                    onChange={(e) =>
                      setEditItem({ ...editItem, indikasi: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">kodeGangguan</Label>
                  <Input
                    name="kodeGangguan"
                    type="text"
                    value={editItem.kodeGangguan}
                    onChange={(e) =>
                      setEditItem({ ...editItem, kodeGangguan: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">arusR</Label>
                  <Input
                    name="arusR"
                    type="text"
                    value={editItem.arusR}
                    onChange={(e) =>
                      setEditItem({ ...editItem, arusR: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">arusS</Label>
                  <Input
                    name="arusS"
                    type="text"
                    value={editItem.arusS}
                    onChange={(e) =>
                      setEditItem({ ...editItem, arusS: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">arusT</Label>
                  <Input
                    name="arusT"
                    type="text"
                    value={editItem.arusT}
                    onChange={(e) =>
                      setEditItem({ ...editItem, arusT: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">arusN</Label>
                  <Input
                    name="arusN"
                    type="text"
                    value={editItem.arusN}
                    onChange={(e) =>
                      setEditItem({ ...editItem, arusN: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">penyebab</Label>
                  <Input
                    name="penyebab"
                    type="text"
                    value={editItem.penyebab}
                    onChange={(e) =>
                      setEditItem({ ...editItem, penyebab: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">lokasiGangguan</Label>
                  <Input
                    name="lokasiGangguan"
                    type="text"
                    value={editItem.lokasiGangguan}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        lokasiGangguan: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* Tambahkan input lain sesuai kebutuhan */}
                <Button
                  type="submit"
                  variant="neutral"
                  className="mt-4 mr-8"
                  onClick={handleCancel}
                >
                  Batal
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <span className="h-10 px-4 py-2 rounded-md bg-main border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none">
                      Update
                    </span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Yakin ingin mengupdate?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUpdate}>
                        Update
                      </AlertDialogAction>
                    </AlertDialogFooter>
                    {error ? (
                      <p className="text-red-500 mb-4">{error}</p>
                    ) : null}
                  </AlertDialogContent>
                </AlertDialog>
              </form>
            </div>
          )}

          <ModalDialog
            open={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleConfirmDelete}
          />
        </div>
      </div>
    </Layouts>
  );
};

export default GangguanPenyulang;
