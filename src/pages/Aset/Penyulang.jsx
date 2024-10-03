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
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { EditIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Penyulang = () => {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null); // State untuk mengontrol item yang sedang di-edit
  const [error, setError] = useState(""); // State untuk menangani error

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "penyulang"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (item) => {
    setEditItem(item); // Set item yang sedang di-edit
  };
  // Fungsi untuk meng-cancel edit
  const handleCancel = () => {
    setEditItem(null); // Set editItem kembali ke null untuk menutup form edit
    setError("");
  };
  const { toast } = useToast();

  // Fungsi untuk meng-handle update data di Firestore
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (
      !editItem.penyulang ||
      !editItem.sumber ||
      !editItem.Panjang ||
      !editItem.beban ||
      !editItem.tglUpdate
    ) {
      setError("Semua field harus diisi."); // Set pesan error jika input kosong

      return;
    }
    try {
      const itemDocRef = doc(db, "penyulang", editItem.id); // Mengambil referensi dokumen di Firestore
      await updateDoc(itemDocRef, {
        penyulang: editItem.penyulang,
        sumber: editItem.sumber,
        Panjang: editItem.Panjang,
        beban: editItem.beban,
        tglUpdate: editItem.tglUpdate,
      });

      // Update data di state
      setData((prevData) =>
        prevData.map((item) => (item.id === editItem.id ? editItem : item))
      );

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
  return (
    <div className="w-full pt-24 text-center mx-auto px-28">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold py-2">Penyulang ULP Selong</div>
        <div className="flex gap-2 items-center">
          <span className="text-2xl font-semibold">Tambah</span>
          <Link to="/aset/tambahPenyulang">
            <Button type="button" size="sm">
              <PlusCircleIcon />
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
                <TableHead>Penyulang</TableHead>
                <TableHead>Sumber GI/PLTD</TableHead>
                <TableHead>Panjang</TableHead>
                <TableHead>Beban</TableHead>
                <TableHead>Tgl Update</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.penyulang}</TableCell>
                  <TableCell>{item.sumber}</TableCell>
                  <TableCell>{item.Panjang} kMS</TableCell>
                  <TableCell>{item.beban} MW</TableCell>
                  <TableCell> {item.tglUpdate}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Button
                        type="button"
                        size="ssm"
                        variant="delete"
                        onClick={() => handleEditClick(item)}
                      >
                        <EditIcon className="h-4 w-4 text-main" />
                      </Button>
                      <Button type="button" variant="delete" size="icon">
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
                <Label className="font-semibold">Penyulang</Label>
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
                <Label className="font-semibold">Sumber GI/PLTD</Label>
                <Input
                  type="text"
                  value={editItem.sumber}
                  onChange={(e) =>
                    setEditItem({ ...editItem, sumber: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mb-4 text-start">
                <Label className="font-semibold">Panjang</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={editItem.Panjang}
                    onChange={(e) =>
                      setEditItem({ ...editItem, Panjang: e.target.value })
                    }
                    className="border p-2 rounded w-30"
                  />
                  <span>KMS</span>
                </div>
              </div>
              <div className="mb-4 text-start">
                <Label className="font-semibold">Beban</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={editItem.beban}
                    onChange={(e) =>
                      setEditItem({ ...editItem, beban: e.target.value })
                    }
                    className="border p-2 rounded w-30"
                  />
                  <span>MW</span>
                </div>
              </div>
              <div className="mb-4 text-start">
                <Label className="font-semibold">Tanggal Update</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="date"
                    value={editItem.tglUpdate}
                    onChange={(e) =>
                      setEditItem({ ...editItem, tglUpdate: e.target.value })
                    }
                    className="border p-2 rounded w-40"
                  />
                </div>
              </div>
              {/* Tambahkan input lain sesuai kebutuhan */}
              <Button
                type="submit"
                variant="destructive"
                className="mt-4 mr-8"
                onClick={handleCancel}
              >
                Batal
              </Button>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button className="mt-4">Update</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Yakin ingin mengupdate?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpdate}>
                      Update
                    </AlertDialogAction>
                  </AlertDialogFooter>
                  {error ? <p className="text-red-500 mb-4">{error}</p> : null}
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Penyulang;
