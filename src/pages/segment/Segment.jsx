import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { EditIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layouts from "../admin/layouts";

const Segment = () => {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null); // State untuk mengontrol item yang sedang di-edit
  const [error, setError] = useState(""); // State untuk menangani error
  const [filterPenyulang, setFilterPenyulang] = useState("all");

  const BulanSekarang = new Date().getMonth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "segment"), orderBy("idSegment", "asc"));
        const querySnapshot = await getDocs(q);
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
  const filteredDataByPenyulang = () => {
    return data.filter(
      (item) => filterPenyulang === "all" || item.penyulang === filterPenyulang
    );
  };
  const [selectedItems, setSelectedItems] = useState([]);
  const [newTanggal, setNewTanggal] = useState("");
  const [newStatus, setNewStatus] = useState("");
  // Fungsi untuk handle pemilihan item
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      // Jika item sudah dipilih, hapus dari array
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      // Jika belum, tambahkan ke array
      setSelectedItems([...selectedItems, id]);
    }
    console.log(selectedItems); // Cek apakah item yang dipilih sudah benar
  };
  // Fungsi untuk update massal
  const handleUpdateItems = async (e) => {
    e.preventDefault();
    if (!newTanggal || !newStatus) {
      setError("Tanggal dan status harus diisi.");
      return;
    }

    try {
      const batch = writeBatch(db); // Menggunakan batch untuk mengupdate banyak data sekaligus
      selectedItems.forEach((id) => {
        const itemDocRef = doc(db, "segment", id); // Mengambil referensi dokumen
        batch.update(itemDocRef, {
          tglCek: newTanggal,
          statusBulanIni: newStatus,
        });
      });

      await batch.commit(); // Commit perubahan batch

      // Update state data lokal
      setData((prevData) =>
        prevData.map((item) =>
          selectedItems.includes(item.id)
            ? { ...item, tglCek: newTanggal, statusBulanIni: newStatus }
            : item
        )
      );

      // Reset setelah update
      setSelectedItems([]);
      setNewTanggal("");
      setNewStatus("");
      setError("");

      // Tampilkan toast sukses
      toast({
        variant: "success",
        title: "Updated",
        description: "Data berhasil diupdate.",
      });
    } catch (error) {
      console.error("Error updating items: ", error);
      setError("Terjadi kesalahan saat mengupdate data.");
    }
  };
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
      !editItem.idSegment ||
      !editItem.penyulang ||
      !editItem.segment ||
      !editItem.panjangSegment ||
      !editItem.tglCek ||
      !editItem.statusBulanIni
    ) {
      setError("Semua field harus diisi."); // Set pesan error jika input kosong

      return;
    }
    try {
      const itemDocRef = doc(db, "segment", editItem.id); // Mengambil referensi dokumen di Firestore
      await updateDoc(itemDocRef, {
        idSegment: editItem.idSegment,
        penyulang: editItem.penyulang,
        segment: editItem.segment,
        panjangSegment: editItem.panjangSegment,
        tglCek: editItem.tglCek,
        statusBulanIni: editItem.statusBulanIni,
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
    <Layouts>
      <div className="w-full text-center mx-auto px-4">
        <div className="flex flex-col">
          <div className="text-2xl font-semibold py-2">
            Data Segment ULP Selong
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-2xl font-semibold">Tambah</span>
            <Link to="/aset/tambahSegment">
              <Button type="button" size="sm">
                <PlusCircleIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div
          className={`grid transition-all duration-5000 ease-in-out ${
            editItem || selectedItems.length
              ? "grid-cols-3 gap-4 "
              : "grid-cols-1"
          }`}
        >
          <div className="col-span-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]">#</TableHead>
                  <TableHead></TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>
                    <Select onValueChange={setFilterPenyulang}>
                      <SelectTrigger className="">
                        <SelectValue placeholder="Penyulang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {Array.from(
                          new Set(data.map((item) => item.penyulang))
                        ).map((penyulang) => (
                          <SelectItem key={penyulang} value={penyulang}>
                            {penyulang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Panjang</TableHead>
                  <TableHead>Tanggal Cek</TableHead>
                  <TableHead>Status Bulan Ini</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDataByPenyulang().map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>{item.idSegment}</TableCell>
                    <TableCell>{item.penyulang}</TableCell>
                    <TableCell>{item.segment}</TableCell>
                    <TableCell>{item.panjangSegment} kMS</TableCell>
                    <TableCell>{item.tglCek}</TableCell>
                    <TableCell>
                      {" "}
                      {BulanSekarang === new Date(item.tglCek).getMonth() ? (
                        <span className="bg-main rounded-md text-white p-1">
                          {item.statusBulanIni}
                        </span>
                      ) : item.statusBulanIni === "" ||
                        item.statusBulanIni === null ||
                        item.statusBulanIni === undefined ? (
                        <span className="bg-red-500 rounded-md text-white p-1">
                          Bahaya
                        </span>
                      ) : (
                        <span className="bg-yellow-500 rounded-md text-white p-1">
                          Waspada
                        </span>
                      )}
                    </TableCell>
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
          {/* Form untuk mengubah tanggal dan status */}
          {selectedItems.length > 0 && (
            <div className="mt-10 p-4 border rounded shadow-lg shadow-main col-span-1">
              <h3 className="text-xl font-semibold">Edit SegmentGangguan</h3>
              <form>
                <div className="mb-4 text-start">
                  <Label>Tanngal Cek:</Label>
                  <Input
                    type="date"
                    value={newTanggal}
                    onChange={(e) => setNewTanggal(e.target.value)}
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label>New Status:</Label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Choose status</option>
                    <option value="Sudah">Sudah</option>
                  </select>
                </div>
                <Button onClick={handleUpdateItems}>
                  Update Selected Items
                </Button>
              </form>
            </div>
          )}

          {editItem && (
            <div className="mt-10 p-4 border rounded shadow-lg shadow-main col-span-1">
              <h3 className="text-xl font-semibold">Edit SegmentGangguan</h3>
              <form>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">ID</Label>
                  <Input
                    name="idSegment"
                    type="text"
                    value={editItem.idSegment}
                    onChange={(e) =>
                      setEditItem({ ...editItem, idSegment: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
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
                    name="segment"
                    value={editItem.segment}
                    onChange={(e) =>
                      setEditItem({ ...editItem, segment: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">Panjang</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="text"
                      name="panjangSegment"
                      value={editItem.panjangSegment}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          panjangSegment: e.target.value,
                        })
                      }
                      className="border p-2 rounded w-30"
                    />
                    <span>KMS</span>
                  </div>
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">Tanggal Cek</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="date"
                      name="tglCek"
                      value={editItem.tglCek}
                      onChange={(e) =>
                        setEditItem({ ...editItem, tglCek: e.target.value })
                      }
                      className="border p-2 rounded w-30"
                    />
                  </div>
                </div>
                <div className="mb-4 text-start">
                  <Label className="font-semibold">Sudah Cek ?</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="text"
                      name="statusBulanIni"
                      value={editItem.statusBulanIni}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          statusBulanIni: e.target.value,
                        })
                      }
                      className="border p-2 rounded w-30"
                    />
                  </div>
                </div>
                {/* Tambahkan input lain sesuai kebutuhan */}
                <Button
                  type="submit"
                  variant="warning"
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
        </div>
      </div>
    </Layouts>
  );
};

export default Segment;
