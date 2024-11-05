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
import { EditIcon, FileIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layouts from "@/pages/admin/Layouts";
import ModalDialog from "@/lib/dialog";
import { format } from "date-fns";
import DatePicker from "react-datepicker";

const SuratMasuk = () => {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null); // State untuk mengontrol item yang sedang di-edit
  const [selectedItem, setSelectedItem] = useState(null); // State untuk item yang akan dihapus
  const [error, setError] = useState(""); // State untuk menangani error
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk kontrol modal

  const { toast } = useToast();
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1)
  ); // Default tgl 1 bulan ini
  const [endDate, setEndDate] = useState(new Date()); // Default hari ini

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "SuratMasuk"), // Sesuaikan nama koleksi
          where("tanggalSurat", ">=", format(startDate, "yyyy-MM-dd")),
          where("tanggalSurat", "<=", format(endDate, "yyyy-MM-dd"))
        );
        const querySnapshot = await getDocs(q);
        const dataSuratMasuk = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // Mengurutkan data berdasarkan tgl inspeksi dari yang terbaru ke terlama
        const sortedData = dataSuratMasuk.sort(
          (a, b) => new Date(b.tanggalSurat) - new Date(a.tanggalSurat)
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
      !editItem.noSurat ||
      !editItem.pengirim ||
      !editItem.alamat ||
      !editItem.tanggalSurat ||
      !editItem.perihal ||
      !editItem.noTelpon ||
      !editItem.status ||
      !editItem.tindakan ||
      !editItem.keterangan
    ) {
      setError("Semua field harus diisi."); // Set pesan error jika input kosong

      return;
    }
    try {
      const itemDocRef = doc(db, "SuratMasuk", editItem.id); // Mengambil referensi dokumen di Firestore
      await updateDoc(itemDocRef, {
        noSurat: editItem.noSurat,
        pengirim: editItem.pengirim,
        alamat: editItem.alamat,
        tanggalSurat: editItem.tanggalSurat,
        perihal: editItem.perihal,
        noTelpon: editItem.noTelpon,
        status: editItem.status,
        tindakan: editItem.tindakan,
        keterangan: editItem.keterangan,
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
      await deleteDoc(doc(db, "SuratMasuk", selectedItem.id));
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
            <span className="text-2xl font-semibold">
              Monitoring Surat Masuk
            </span>
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
            <Link to="/admin/tambah-surat-masuk">
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
                  <TableHead>No Surat</TableHead>
                  <TableHead>Pengirim</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>No. Telp</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead>Tgl. Surat Masuk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tindakan</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.noSurat}</TableCell>
                    <TableCell>{item.pengirim}</TableCell>
                    <TableCell>{item.alamat}</TableCell>
                    <TableCell>{item.noTelpon}</TableCell>
                    <TableCell>{item.perihal}</TableCell>
                    <TableCell>
                      {new Date(item.tanggalSurat).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {item.status === "BELUM SURVEY" ? (
                        <span className="  rounded-md px-2 bg-red-500">
                          {item.status}
                        </span>
                      ) : item.status === "SUDAH SURVEY" ? (
                        <span className="rounded-md px-2 bg-yellow-500">
                          {item.status}
                        </span>
                      ) : (
                        <span className="rounded-md px-2 bg-main">
                          {item.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{item.tindakan}</TableCell>
                    <TableCell>{item.keterangan}</TableCell>
                    <TableCell>
                      <Link to={item.imageUrl} target="_blank">
                        <FileIcon className="h-4 w-4 text-main" />
                      </Link>
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
                    name="noSurat"
                    type="text"
                    value={editItem.noSurat}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        noSurat: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">keypoint</Label>
                  <Input
                    name="pengirim"
                    type="text"
                    value={editItem.pengirim}
                    onChange={(e) =>
                      setEditItem({ ...editItem, pengirim: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">alamat</Label>
                  <Input
                    name="alamat"
                    type="text"
                    value={editItem.alamat}
                    onChange={(e) =>
                      setEditItem({ ...editItem, alamat: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">noTelpon</Label>
                  <Input
                    name="noTelpon"
                    type="text"
                    value={editItem.noTelpon}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        noTelpon: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">perihal</Label>
                  <Input
                    name="perihal"
                    type="text"
                    value={editItem.perihal}
                    onChange={(e) =>
                      setEditItem({ ...editItem, perihal: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">tanggalSurat</Label>
                  <Input
                    name="tanggalSurat"
                    type="text"
                    value={editItem.tanggalSurat}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        tanggalSurat: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">status</Label>
                  <Input
                    name="status"
                    type="text"
                    value={editItem.status}
                    onChange={(e) =>
                      setEditItem({ ...editItem, status: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">tindakan</Label>
                  <Input
                    name="tindakan"
                    type="text"
                    value={editItem.tindakan}
                    onChange={(e) =>
                      setEditItem({ ...editItem, tindakan: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">keterangan</Label>
                  <Input
                    name="keterangan"
                    type="text"
                    value={editItem.keterangan}
                    onChange={(e) =>
                      setEditItem({ ...editItem, keterangan: e.target.value })
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

export default SuratMasuk;
