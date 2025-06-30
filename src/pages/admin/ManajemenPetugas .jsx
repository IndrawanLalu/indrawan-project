import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  LuSearch,
  LuMoreVertical,
  LuTrash2,
  LuUserPlus,
  LuCheck,
  LuLoader2,
  LuUsers,
  LuPhone,
  LuMail,
  LuList,
} from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { FcEditImage } from "react-icons/fc";
import Layouts from "./Layouts";

// Mendapatkan inisial dari nama
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Mendapatkan warna avatar berdasarkan nama
const getAvatarColor = (name) => {
  if (!name) return "bg-gray-400";
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

// Komponen PetugasCard
const PetugasCard = ({ petugas, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        <div className="flex items-center space-x-3">
          <Avatar className={`${getAvatarColor(petugas.nama)}`}>
            <AvatarFallback>{getInitials(petugas.nama)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold">
              {petugas.nama}
            </CardTitle>
            <CardDescription>Grup: {petugas.group}</CardDescription>
          </div>
        </div>
        <Badge
          variant={petugas.status === "aktif" ? "default" : "secondary"}
          className={
            petugas.status === "aktif" ? "bg-green-500" : "bg-gray-500"
          }
        >
          {petugas.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4">
        {petugas.phone && (
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <LuPhone className="mr-2" size={14} />
            <span>{petugas.phone}</span>
          </div>
        )}
        {petugas.email && (
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <LuMail className="mr-2" size={14} />
            <span>{petugas.email}</span>
          </div>
        )}
        <div className="flex items-center text-xs text-gray-400 mt-2">
          <LuCheck className="mr-1" size={12} />
          <span>
            Terdaftar:{" "}
            {new Date(petugas.createdAt?.seconds * 1000).toLocaleDateString(
              "id-ID"
            )}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <LuMoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onEdit(petugas)}
              className="flex items-center"
            >
              <FaEdit className="mr-2" size={14} /> Edit Petugas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(petugas)}
              className="text-red-500 flex items-center"
            >
              <LuTrash2 className="mr-2" size={14} /> Hapus Petugas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

// PropTypes untuk PetugasCard
PetugasCard.propTypes = {
  petugas: PropTypes.shape({
    id: PropTypes.string,
    nama: PropTypes.string.isRequired,
    group: PropTypes.string,
    status: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    createdAt: PropTypes.shape({
      seconds: PropTypes.number,
      nanoseconds: PropTypes.number,
    }),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const ManajemenPetugas = () => {
  const [petugas, setPetugas] = useState([]);
  const [filteredPetugas, setFilteredPetugas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPetugas, setSelectedPetugas] = useState(null);
  const [groups, setGroups] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State tambahan untuk mengelola mode grup baru
  const [isNewGroup, setIsNewGroup] = useState(false);

  // Form state
  const [form, setForm] = useState({
    nama: "",
    group: "",
    status: "aktif",
    phone: "",
    email: "",
  });

  // Fetch petugas
  useEffect(() => {
    const fetchPetugas = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "petugas"), orderBy("nama", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPetugas(fetchedData);
        setFilteredPetugas(fetchedData);

        // Extract unique groups
        const uniqueGroups = [
          ...new Set(fetchedData.map((p) => p.group)),
        ].filter(Boolean);
        setGroups(uniqueGroups);
      } catch (error) {
        console.error("Error fetching petugas:", error);
        alert("Gagal memuat data petugas. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchPetugas();
  }, [refreshTrigger]);

  // Filter petugas
  useEffect(() => {
    let filtered = [...petugas];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.group &&
            item.group.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.email &&
            item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.phone && item.phone.includes(searchQuery))
      );
    }

    // Apply group filter
    if (filterGroup !== "all") {
      filtered = filtered.filter((item) => item.group === filterGroup);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    setFilteredPetugas(filtered);
  }, [searchQuery, filterGroup, filterStatus, petugas]);

  // Handle edit
  const handleEdit = (petugasData) => {
    setForm({
      nama: petugasData.nama || "",
      group: petugasData.group || "",
      status: petugasData.status || "aktif",
      phone: petugasData.phone || "",
      email: petugasData.email || "",
    });
    setSelectedPetugas(petugasData);
    setIsEditing(true);
    setIsNewGroup(false); // Reset state grup baru
    setFormOpen(true);
  };

  // Handle delete
  const handleDelete = (petugasData) => {
    setSelectedPetugas(petugasData);
    setDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      nama: "",
      group: "",
      status: "aktif",
      phone: "",
      email: "",
    });
    setSelectedPetugas(null);
    setIsEditing(false);
    setIsNewGroup(false); // Reset state grup baru
  };

  // Submit form
  const handleSubmit = async () => {
    if (!form.nama || !form.group) {
      alert("Nama dan Grup harus diisi.");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && selectedPetugas) {
        // Update existing petugas
        const petugasRef = doc(db, "petugas", selectedPetugas.id);
        await updateDoc(petugasRef, {
          ...form,
          updatedAt: serverTimestamp(),
        });

        alert("Data petugas berhasil diperbarui.");
      } else {
        // Add new petugas
        await addDoc(collection(db, "petugas"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        alert("Petugas baru berhasil ditambahkan.");
      }

      resetForm();
      setFormOpen(false);
      setRefreshTrigger((prev) => prev + 1); // Trigger refresh
    } catch (error) {
      console.error("Error saving petugas:", error);
      alert("Gagal menyimpan data petugas. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedPetugas) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "petugas", selectedPetugas.id));
      alert("Petugas berhasil dihapus.");
      setDeleteDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1); // Trigger refresh
    } catch (error) {
      console.error("Error deleting petugas:", error);
      alert("Gagal menghapus petugas. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layouts>
      <div className="mx-auto p-4 ">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
                <LuUsers className="mr-2" size={28} /> Manajemen Petugas
              </h1>
              <p className="text-blue-100">
                Kelola data petugas ULP Selong dengan mudah
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setFormOpen(true);
              }}
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              <LuUserPlus className="mr-2" size={16} /> Tambah Petugas
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari petugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Filter grup" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Grup</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="card" className="mb-6">
          <TabsList className="w-full max-w-xs mx-auto grid grid-cols-2">
            <TabsTrigger value="card" className="flex items-center">
              <LuUsers className="mr-2" size={16} /> Grid View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center">
              <LuList className="mr-2" size={16} /> List View
            </TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="card">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LuLoader2
                  className="animate-spin text-blue-500 mr-2"
                  size={24}
                />
                <span>Memuat data petugas...</span>
              </div>
            ) : filteredPetugas.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <LuUsers className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  Tidak ada petugas
                </h3>
                <p className="text-gray-500">
                  {searchQuery ||
                  filterGroup !== "all" ||
                  filterStatus !== "all"
                    ? "Tidak ada petugas yang sesuai dengan filter"
                    : "Belum ada petugas yang terdaftar. Tambahkan petugas baru."}
                </p>
                <Button
                  onClick={() => {
                    resetForm();
                    setFormOpen(true);
                  }}
                  className="mt-4"
                >
                  <LuUserPlus className="mr-2" size={16} /> Tambah Petugas
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPetugas.map((p) => (
                  <PetugasCard
                    key={p.id}
                    petugas={p}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* List View */}
          <TabsContent value="list">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LuLoader2
                  className="animate-spin text-blue-500 mr-2"
                  size={24}
                />
                <span>Memuat data petugas...</span>
              </div>
            ) : filteredPetugas.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <LuUsers className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  Tidak ada petugas
                </h3>
                <p className="text-gray-500">
                  {searchQuery ||
                  filterGroup !== "all" ||
                  filterStatus !== "all"
                    ? "Tidak ada petugas yang sesuai dengan filter"
                    : "Belum ada petugas yang terdaftar. Tambahkan petugas baru."}
                </p>
                <Button
                  onClick={() => {
                    resetForm();
                    setFormOpen(true);
                  }}
                  className="mt-4"
                >
                  <LuUserPlus className="mr-2" size={16} /> Tambah Petugas
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Petugas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grup
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPetugas.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Avatar className={`${getAvatarColor(p.nama)}`}>
                                <AvatarFallback>
                                  {getInitials(p.nama)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {p.nama}
                              </div>
                              <div className="text-sm text-gray-500">
                                Terdaftar:{" "}
                                {p.createdAt
                                  ? new Date(
                                      p.createdAt.seconds * 1000
                                    ).toLocaleDateString("id-ID")
                                  : "-"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{p.group}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              p.status === "aktif" ? "default" : "secondary"
                            }
                            className={
                              p.status === "aktif"
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.phone && (
                            <div className="flex items-center mb-1">
                              <LuPhone className="mr-2" size={14} />
                              <span>{p.phone}</span>
                            </div>
                          )}
                          {p.email && (
                            <div className="flex items-center">
                              <LuMail className="mr-2" size={14} />
                              <span>{p.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(p)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <FcEditImage size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <LuTrash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Data Petugas" : "Tambah Petugas Baru"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Perbarui informasi petugas"
                  : "Tambahkan petugas baru ke sistem"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">
                  Nama
                </Label>
                <Input
                  id="nama"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="col-span-3"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Grup
                </Label>
                <div className="col-span-3 space-y-2">
                  {/* Jika belum ada grup atau sedang membuat grup baru */}
                  {groups.length === 0 || isNewGroup ? (
                    <Input
                      value={form.group}
                      onChange={(e) =>
                        setForm({ ...form, group: e.target.value })
                      }
                      placeholder="Masukkan nama grup"
                    />
                  ) : (
                    /* Dropdown untuk memilih grup yang sudah ada */
                    <Select
                      value={isNewGroup ? "new" : form.group}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setIsNewGroup(true);
                          setForm({ ...form, group: "" });
                        } else {
                          setIsNewGroup(false);
                          setForm({ ...form, group: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih grup" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">+ Grup Baru</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {/* Input untuk grup baru jika user memilih "Grup Baru" */}
                  {isNewGroup && groups.length > 0 && (
                    <div className="space-y-2">
                      <Input
                        value={form.group}
                        onChange={(e) =>
                          setForm({ ...form, group: e.target.value })
                        }
                        placeholder="Masukkan nama grup baru"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsNewGroup(false);
                          setForm({ ...form, group: "" });
                        }}
                        className="text-sm"
                      >
                        Batal Grup Baru
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telepon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="col-span-3"
                  placeholder="Nomor telepon (opsional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="col-span-3"
                  placeholder="Alamat email (opsional)"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setFormOpen(false);
                }}
                disabled={loading}
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <LuLoader2 className="mr-2 animate-spin" /> Memproses...
                  </>
                ) : isEditing ? (
                  "Perbarui"
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus Petugas</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus petugas{" "}
                <span className="font-semibold">{selectedPetugas?.nama}</span>?
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600"
              >
                {loading ? (
                  <>
                    <LuLoader2 className="mr-2 animate-spin" /> Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layouts>
  );
};

export default ManajemenPetugas;
