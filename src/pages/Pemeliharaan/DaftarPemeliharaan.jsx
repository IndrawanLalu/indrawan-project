import { db, storage } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  FaCheck,
  FaTrash,
  FaFilter,
  FaSearch,
  FaFileExcel,
  FaTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaClipboardList,
  FaArrowLeft,
} from "react-icons/fa";
import { CgDanger } from "react-icons/cg";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import downloadExcel from "@/pages/Pemeliharaan/DownloadExcel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layouts from "@/pages/admin/Layouts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Konstanta untuk penyimpanan data di localStorage
const STORAGE_KEYS = {
  INSPEKSI_DATA: "inspeksi_data",
  PENYULANG_DATA: "penyulang_data",
  FILTER_STATE: "filter_state",
  ACTIVE_TAB: "active_tab",
};

const DaftarPemeliharaan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);

  // State untuk data
  const [data, setData] = useState([]);
  const [dataPenyulang, setDataPenyulang] = useState([]);

  // State untuk filter
  const [filterCategory, setFilterCategory] = useState(
    queryParams.get("category") ||
      localStorage.getItem(`${STORAGE_KEYS.FILTER_STATE}_category`) ||
      "all"
  );
  const [filterPenyulang, setFilterPenyulang] = useState(
    queryParams.get("penyulang") ||
      localStorage.getItem(`${STORAGE_KEYS.FILTER_STATE}_penyulang`) ||
      "all"
  );
  const [filterInspektor, setFilterInspektor] = useState(
    queryParams.get("inspektor") ||
      localStorage.getItem(`${STORAGE_KEYS.FILTER_STATE}_inspektor`) ||
      "all"
  );
  const [searchTerm, setSearchTerm] = useState(
    queryParams.get("search") ||
      localStorage.getItem(`${STORAGE_KEYS.FILTER_STATE}_search`) ||
      ""
  );

  // State lainnya
  const [isFiltersOpen, setIsFiltersOpen] = useState(
    localStorage.getItem("filters_open") === "true" || false
  );
  const [activeTab, setActiveTab] = useState(
    queryParams.get("tab") ||
      localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) ||
      "Temuan"
  );
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [inspektorList, setInspektorList] = useState([]);
  const [detailView, setDetailView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // State untuk indikator jumlah
  const [counts, setCounts] = useState({
    Temuan: 0,
    Pending: 0,
    Selesai: 0,
  });

  // Efek untuk menyimpan state filter ke localStorage
  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEYS.FILTER_STATE}_category`,
      filterCategory
    );
    localStorage.setItem(
      `${STORAGE_KEYS.FILTER_STATE}_penyulang`,
      filterPenyulang
    );
    localStorage.setItem(
      `${STORAGE_KEYS.FILTER_STATE}_inspektor`,
      filterInspektor
    );
    localStorage.setItem(`${STORAGE_KEYS.FILTER_STATE}_search`, searchTerm);
    localStorage.setItem("filters_open", isFiltersOpen);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);

    // Update URL with query parameters
    const params = new URLSearchParams();
    if (filterCategory !== "all") params.set("category", filterCategory);
    if (filterPenyulang !== "all") params.set("penyulang", filterPenyulang);
    if (filterInspektor !== "all") params.set("inspektor", filterInspektor);
    if (searchTerm) params.set("search", searchTerm);
    params.set("tab", activeTab);

    const newUrl = `${location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [
    filterCategory,
    filterPenyulang,
    filterInspektor,
    searchTerm,
    isFiltersOpen,
    activeTab,
    location.pathname,
  ]);

  // Fungsi untuk mengambil data inspeksi
  const fetchInspeksiData = async () => {
    try {
      setLoading(true);

      // Cek apakah data sudah ada di localStorage dan masih valid (usia < 1 jam)
      const cachedData = localStorage.getItem(STORAGE_KEYS.INSPEKSI_DATA);
      const cachedTime = localStorage.getItem(
        `${STORAGE_KEYS.INSPEKSI_DATA}_time`
      );

      const now = new Date().getTime();
      const isDataValid =
        cachedData && cachedTime && now - parseInt(cachedTime) < 3600000; // 1 jam

      if (isDataValid) {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);

        // Hitung jumlah berdasarkan status
        const temuanCount = parsedData.filter(
          (item) => item.status === "Temuan"
        ).length;
        const pendingCount = parsedData.filter(
          (item) => item.status === "Pending"
        ).length;
        const selesaiCount = parsedData.filter(
          (item) => item.status === "Selesai"
        ).length;

        setCounts({
          Temuan: temuanCount,
          Pending: pendingCount,
          Selesai: selesaiCount,
        });

        // Ekstrak inspektor unik
        const inspektors = [
          ...new Set(parsedData.map((item) => item.inspektor)),
        ].filter(Boolean);
        setInspektorList(inspektors);

        setLoading(false);
        return;
      }

      // Ambil data dari Firestore jika tidak ada di cache atau sudah tidak valid
      const querySnapshot = await getDocs(collection(db, "inspeksi"));
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Urutkan data berdasarkan tanggal inspeksi dari yang terbaru
      const sortedData = fetchedData.sort(
        (a, b) => new Date(b.tglInspeksi) - new Date(a.tglInspeksi)
      );

      // Simpan ke localStorage dengan timestamp
      localStorage.setItem(
        STORAGE_KEYS.INSPEKSI_DATA,
        JSON.stringify(sortedData)
      );
      localStorage.setItem(
        `${STORAGE_KEYS.INSPEKSI_DATA}_time`,
        now.toString()
      );

      // Ekstrak inspektor unik
      const inspektors = [
        ...new Set(sortedData.map((item) => item.inspektor)),
      ].filter(Boolean);
      setInspektorList(inspektors);

      // Hitung jumlah berdasarkan status
      const temuanCount = sortedData.filter(
        (item) => item.status === "Temuan"
      ).length;
      const pendingCount = sortedData.filter(
        (item) => item.status === "Pending"
      ).length;
      const selesaiCount = sortedData.filter(
        (item) => item.status === "Selesai"
      ).length;

      setCounts({
        Temuan: temuanCount,
        Pending: pendingCount,
        Selesai: selesaiCount,
      });

      setData(sortedData);
      setLoading(false);
    } catch (error) {
      console.error("Error mengambil data: ", error);
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil data penyulang
  const fetchPenyulangData = async () => {
    try {
      // Cek cache untuk data penyulang
      const cachedData = localStorage.getItem(STORAGE_KEYS.PENYULANG_DATA);
      const cachedTime = localStorage.getItem(
        `${STORAGE_KEYS.PENYULANG_DATA}_time`
      );

      const now = new Date().getTime();
      const isDataValid =
        cachedData && cachedTime && now - parseInt(cachedTime) < 3600000; // 1 jam

      if (isDataValid) {
        setDataPenyulang(JSON.parse(cachedData));
        return;
      }

      const querySnapshot = await getDocs(collection(db, "penyulang"));
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      localStorage.setItem(
        STORAGE_KEYS.PENYULANG_DATA,
        JSON.stringify(fetchedData)
      );
      localStorage.setItem(
        `${STORAGE_KEYS.PENYULANG_DATA}_time`,
        now.toString()
      );

      setDataPenyulang(fetchedData);
    } catch (error) {
      console.error("Error mengambil data penyulang: ", error);
    }
  };

  // Fungsi untuk mendapatkan detail temuan
  const getTemuanDetail = async (id) => {
    // Cek apakah item sudah ada di data lokal
    const existingItem = data.find((item) => item.id === id);

    if (existingItem) {
      setSelectedItem(existingItem);
      setDetailView(true);
      return;
    }

    try {
      setLoading(true);
      const docRef = doc(db, "inspeksi", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSelectedItem({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Data tidak ditemukan!");
        navigate("/admin/pemeliharaan");
      }

      setDetailView(true);
      setLoading(false);
    } catch (error) {
      console.error("Error mengambil detail: ", error);
      setLoading(false);
      navigate("/admin/pemeliharaan");
    }
  };

  // Effect untuk memuat data saat komponen dirender pertama kali
  useEffect(() => {
    const init = async () => {
      // Cek apakah kita perlu memuat detail temuan
      if (params.id) {
        await getTemuanDetail(params.id);
      } else {
        // Jika tidak di halaman detail, reset view
        setDetailView(false);
        setSelectedItem(null);

        // Memuat data inspeksi dan penyulang jika belum ada
        if (data.length === 0) {
          await fetchInspeksiData();
        }

        if (dataPenyulang.length === 0) {
          await fetchPenyulangData();
        }
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Filter data berdasarkan semua kriteria
  const filteredData = (status) => {
    return data.filter((item) => {
      // Filter status dasar
      if (item.status !== status) return false;

      // Filter kategori
      if (filterCategory !== "all" && item.category !== filterCategory)
        return false;

      // Filter penyulang
      if (filterPenyulang !== "all" && item.penyulang !== filterPenyulang)
        return false;

      // Filter inspektor
      if (filterInspektor !== "all" && item.inspektor !== filterInspektor)
        return false;

      // Filter kata pencarian
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (item.temuan && item.temuan.toLowerCase().includes(searchLower)) ||
          (item.lokasi && item.lokasi.toLowerCase().includes(searchLower)) ||
          (item.location && item.location.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  };

  // Handler untuk konfirmasi hapus
  const handleDelete = async (item) => {
    setDeleteConfirm(item);
  };

  // Konfirmasi penghapusan data
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      // Hapus dokumen dari Firestore
      await deleteDoc(doc(db, "inspeksi", deleteConfirm.id));

      // Jika ada gambar terkait, hapus dari Firebase Storage
      if (deleteConfirm.imageUrl) {
        const imageRef = ref(storage, deleteConfirm.imageUrl);
        await deleteObject(imageRef);
      }

      // Update data di state dan localStorage
      const updatedData = data.filter((item) => item.id !== deleteConfirm.id);
      setData(updatedData);

      // Update localStorage
      localStorage.setItem(
        STORAGE_KEYS.INSPEKSI_DATA,
        JSON.stringify(updatedData)
      );

      // Update counts
      setCounts((prev) => ({
        ...prev,
        [deleteConfirm.status]: prev[deleteConfirm.status] - 1,
      }));

      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error menghapus dokumen: ", error);
      alert("Gagal menghapus data");
      setDeleteConfirm(null);
    }
  };

  // Batalkan konfirmasi hapus
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Reset semua filter
  const resetFilters = () => {
    setFilterCategory("all");
    setFilterPenyulang("all");
    setFilterInspektor("all");
    setSearchTerm("");
  };

  // Handler perubahan tab
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Kembali ke halaman daftar dari detail
  const handleBack = () => {
    setDetailView(false);
    setSelectedItem(null);
    navigate("/admin/pemeliharaan");
  };

  // Tentukan variant badge status
  const getStatusVariant = (statusValidasi) => {
    if (statusValidasi === null || statusValidasi === undefined) {
      return "temuan";
    } else if (statusValidasi === "invalid") {
      return "pending";
    } else {
      return "default";
    }
  };

  // Tampilan detail temuan
  if (detailView && selectedItem) {
    return (
      <Layouts>
        <div className="p-0 w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <FaArrowLeft size={14} />
                Kembali ke Daftar
              </Button>
              <h1 className="font-bold text-2xl">Detail Temuan</h1>
            </div>
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>{selectedItem.temuan}</CardTitle>
              <CardDescription>
                Penyulang: {selectedItem.penyulang} | Inspektur:{" "}
                {selectedItem.inspektor}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Informasi Dasar</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Kategori:</span>{" "}
                      {selectedItem.category}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {selectedItem.status}
                    </p>
                    <p>
                      <span className="font-medium">Tanggal Inspeksi:</span>{" "}
                      {selectedItem.tglInspeksi}
                    </p>
                    <p>
                      <span className="font-medium">Status Validasi:</span>{" "}
                      <Badge
                        variant={getStatusVariant(selectedItem.statusValidasi)}
                      >
                        {selectedItem.statusValidasi === null ||
                        selectedItem.statusValidasi === undefined
                          ? "Menunggu"
                          : selectedItem.statusValidasi === "invalid"
                          ? "Invalid"
                          : "Valid"}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Lokasi</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Alamat:</span>{" "}
                      {selectedItem.lokasi}
                    </p>
                    <p>
                      <span className="font-medium">Titik Lokasi:</span>{" "}
                      {selectedItem.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Material</h3>
                {selectedItem.materials && selectedItem.materials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedItem.materials.map((material, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{material.namaMaterial}</p>
                        <p>Jumlah: {material.jumlahMaterial}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Tidak ada material</p>
                )}
              </div>

              {selectedItem.imageUrl && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Foto Temuan</h3>
                  <div className="mt-2 max-w-md">
                    <img
                      src={selectedItem.imageUrl}
                      alt="Foto temuan"
                      className="rounded-lg w-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <FaArrowLeft size={14} />
                Kembali
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedItem)}
                  className="gap-2"
                >
                  <FaTrash size={14} />
                  Hapus
                </Button>
                <Link
                  to={`/admin/pemeliharaan/update-temuan/${selectedItem.id}`}
                >
                  <Button className="gap-2">
                    <FaCheck size={14} />
                    Update Status
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </Layouts>
    );
  }

  // Tampilan daftar temuan (default)
  return (
    <Layouts>
      <div className="p-0 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-2xl">Daftar Temuan Hasil Inspeksi</h1>
          <Button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            variant="outline"
            className="gap-2"
          >
            <FaFilter />
            {isFiltersOpen ? "Sembunyikan Filter" : "Tampilkan Filter"}
          </Button>
        </div>

        {/* Bagian Filter */}
        {isFiltersOpen && (
          <Card className="mb-4 bg-gray-50 border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Filter Data</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-1"
                >
                  <FaTimes size={12} />
                  Reset
                </Button>
              </div>
              <CardDescription>
                Gunakan filter berikut untuk mempersempit hasil pencarian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Input Pencarian */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <FaSearch size={14} />
                    Pencarian
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Cari temuan atau lokasi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                    {searchTerm && (
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setSearchTerm("")}
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Kategori */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <FaClipboardList size={14} />
                    Kategori
                  </label>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      <SelectItem value="JTM">JTM</SelectItem>
                      <SelectItem value="JTR">JTR</SelectItem>
                      <SelectItem value="gardu">Gardu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Penyulang */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <FaMapMarkerAlt size={14} />
                    Penyulang
                  </label>
                  <Select
                    value={filterPenyulang}
                    onValueChange={setFilterPenyulang}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Penyulang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Penyulang</SelectItem>
                      {dataPenyulang.map((penyulang) => (
                        <SelectItem
                          key={penyulang.id}
                          value={penyulang.penyulang}
                        >
                          {penyulang.penyulang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Inspektor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <FaUser size={14} />
                    Inspektor
                  </label>
                  <Select
                    value={filterInspektor}
                    onValueChange={setFilterInspektor}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Inspektor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Inspektor</SelectItem>
                      {inspektorList.map((inspektor, index) => (
                        <SelectItem key={index} value={inspektor}>
                          {inspektor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-gray-500">
                {filteredData(activeTab).length} data ditemukan
              </div>
              <Button
                onClick={downloadExcel}
                variant="outline"
                className="gap-2"
              >
                <FaFileExcel className="text-green-600" />
                Download Excel
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Tab dan Tabel */}
        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="Temuan" className="relative">
              Temuan
              {counts.Temuan > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {counts.Temuan}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="Pending" className="relative">
              Pending
              {counts.Pending > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {counts.Pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="Selesai" className="relative">
              Selesai
              {counts.Selesai > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {counts.Selesai}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Header Tabel */}
          <div className="hidden md:grid grid-cols-9 gap-2 justify-start text-center py-3 bg-main/10 rounded-t-lg font-semibold mb-2 w-full">
            <h1 className="col-span-1 px-2">Temuan</h1>
            <h1 className="px-2">Penyulang</h1>
            <h1 className="px-2">Inspektor</h1>
            <h1 className="px-2">Tgl Inspeksi</h1>
            <h1 className="px-2">Material</h1>
            <h1 className="px-2">Alamat</h1>
            <h1 className="px-2">Titik Lokasi</h1>
            <h1 className="px-2">Status</h1>
            <h1 className="px-2 text-center">Aksi</h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-main"></div>
            </div>
          ) : (
            <>
              <TabsContent value="Temuan">
                <ScrollArea className="w-full h-[calc(100vh-300px)]">
                  {filteredData("Temuan").length > 0 ? (
                    filteredData("Temuan").map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-2 md:grid-cols-9 gap-2 justify-start py-3 hover:bg-main/5 border-b border-main/20 items-center rounded-md transition-colors duration-200"
                      >
                        <div className="col-span-2 md:col-span-1 text-start pl-2">
                          <Link
                            to={`/admin/pemeliharaan/detail/${item.id}`}
                            className="font-semibold truncate hover:text-blue-600 hover:underline"
                          >
                            {item.temuan}
                          </Link>
                          <p className="md:hidden text-xs text-gray-500">
                            {item.penyulang} - {item.inspektor}
                          </p>
                        </div>
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.penyulang}</h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.inspektor}</h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FaCalendarAlt
                              className="text-gray-400"
                              size={12}
                            />
                            <h2 className="">{item.tglInspeksi}</h2>
                          </div>
                        </div>
                        <div className="hidden md:block text-center">
                          {item.materials && item.materials.length > 0 ? (
                            <div className="max-h-20 overflow-y-auto">
                              {item.materials.map((material, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {material.namaMaterial}
                                  </span>
                                  : {material.jumlahMaterial}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">
                              Tidak ada material
                            </p>
                          )}
                        </div>
                        <div className="hidden md:block text-center">
                          <h2
                            className="truncate max-w-[150px] mx-auto"
                            title={item.lokasi}
                          >
                            {item.lokasi}
                          </h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.location}</h2>
                        </div>
                        <div className="flex flex-col justify-center items-end md:items-center">
                          <div className="md:hidden text-xs">
                            {new Date(item.tglInspeksi).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <Link
                            to={`/admin/pemeliharaan/update-temuan/${item.id}`}
                          >
                            <Badge
                              variant={getStatusVariant(item.statusValidasi)}
                            >
                              {item.statusValidasi === null ||
                              item.statusValidasi === undefined ? (
                                "Menunggu"
                              ) : item.statusValidasi === "invalid" ? (
                                <>
                                  <CgDanger className="mr-1" />
                                  Invalid
                                </>
                              ) : (
                                <>
                                  <FaCheck className="mr-1" />
                                  Valid
                                </>
                              )}
                            </Badge>
                          </Link>
                        </div>
                        <div className="text-end md:text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <FaTrash size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                      <div className="text-5xl mb-3">🔍</div>
                      <p className="text-center">
                        Tidak ada data temuan yang ditemukan
                      </p>
                      {(filterCategory !== "all" ||
                        filterPenyulang !== "all" ||
                        filterInspektor !== "all" ||
                        searchTerm) && (
                        <Button
                          variant="link"
                          onClick={resetFilters}
                          className="mt-2"
                        >
                          Reset filter
                        </Button>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="Pending">
                <ScrollArea className="w-full h-[calc(100vh-300px)] px-2">
                  {filteredData("Pending").length > 0 ? (
                    filteredData("Pending").map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-2 md:grid-cols-9 gap-2 justify-start py-3 hover:bg-main/5 border-b border-main/20 items-center rounded-md transition-colors duration-200"
                      >
                        <div className="col-span-2 md:col-span-1 text-start pl-2">
                          <Link
                            to={`/admin/pemeliharaan/detail/${item.id}`}
                            className="font-semibold truncate hover:text-blue-600 hover:underline"
                          >
                            {item.temuan}
                          </Link>
                          <p className="md:hidden text-xs text-gray-500">
                            {item.penyulang} - {item.inspektor}
                          </p>
                        </div>
                        {/* Konten lainnya - sama seperti tab Temuan */}
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.penyulang}</h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.inspektor}</h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FaCalendarAlt
                              className="text-gray-400"
                              size={12}
                            />
                            <h2 className="">{item.tglInspeksi}</h2>
                          </div>
                        </div>
                        <div className="hidden md:block text-center">
                          {item.materials && item.materials.length > 0 ? (
                            <div className="max-h-20 overflow-y-auto">
                              {item.materials.map((material, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {material.namaMaterial}
                                  </span>
                                  : {material.jumlahMaterial}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">
                              Tidak ada material
                            </p>
                          )}
                        </div>
                        <div className="hidden md:block text-center">
                          <h2
                            className="truncate max-w-[150px] mx-auto"
                            title={item.lokasi}
                          >
                            {item.lokasi}
                          </h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.location}</h2>
                        </div>
                        <div className="flex flex-col justify-center items-end md:items-center">
                          <div className="md:hidden text-xs">
                            {new Date(item.tglInspeksi).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <Link
                            to={`/admin/pemeliharaan/update-temuan/${item.id}`}
                          >
                            <Badge
                              variant={getStatusVariant(item.statusValidasi)}
                            >
                              {item.statusValidasi === null ||
                              item.statusValidasi === undefined ? (
                                "Menunggu"
                              ) : item.statusValidasi === "invalid" ? (
                                <>
                                  <CgDanger className="mr-1" />
                                  Invalid
                                </>
                              ) : (
                                <>
                                  <FaCheck className="mr-1" />
                                  Valid
                                </>
                              )}
                            </Badge>
                          </Link>
                        </div>
                        <div className="text-end md:text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <FaTrash size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                      <div className="text-5xl mb-3">🔍</div>
                      <p className="text-center">
                        Tidak ada data pending yang ditemukan
                      </p>
                      {(filterCategory !== "all" ||
                        filterPenyulang !== "all" ||
                        filterInspektor !== "all" ||
                        searchTerm) && (
                        <Button
                          variant="link"
                          onClick={resetFilters}
                          className="mt-2"
                        >
                          Reset filter
                        </Button>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="Selesai">
                <ScrollArea className="w-full h-[calc(100vh-300px)] px-2">
                  {filteredData("Selesai").length > 0 ? (
                    filteredData("Selesai").map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-2 md:grid-cols-9 gap-2 justify-start py-3 hover:bg-main/5 border-b border-main/20 items-center rounded-md transition-colors duration-200"
                      >
                        <div className="col-span-2 md:col-span-1 text-start pl-2">
                          <Link
                            to={`/admin/pemeliharaan/detail/${item.id}`}
                            className="font-semibold truncate hover:text-blue-600 hover:underline"
                          >
                            {item.temuan}
                          </Link>
                          <p className="md:hidden text-xs text-gray-500">
                            {item.penyulang} - {item.inspektor}
                          </p>
                        </div>
                        {/* Konten lainnya - sama seperti tab Temuan */}
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.penyulang}</h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.inspektor}</h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FaCalendarAlt
                              className="text-gray-400"
                              size={12}
                            />
                            <h2 className="">{item.tglInspeksi}</h2>
                          </div>
                        </div>
                        <div className="hidden md:block text-center">
                          {item.materials && item.materials.length > 0 ? (
                            <div className="max-h-20 overflow-y-auto">
                              {item.materials.map((material, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {material.namaMaterial}
                                  </span>
                                  : {material.jumlahMaterial}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">
                              Tidak ada material
                            </p>
                          )}
                        </div>
                        <div className="hidden md:block text-center">
                          <h2
                            className="truncate max-w-[150px] mx-auto"
                            title={item.lokasi}
                          >
                            {item.lokasi}
                          </h2>
                        </div>
                        <div className="hidden md:block text-center">
                          <h2 className="">{item.location}</h2>
                        </div>
                        <div className="flex flex-col justify-center items-end md:items-center">
                          <div className="md:hidden text-xs">
                            {new Date(item.tglInspeksi).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <Link
                            to={`/admin/pemeliharaan/update-temuan/${item.id}`}
                          >
                            <Badge
                              variant={getStatusVariant(item.statusValidasi)}
                            >
                              {item.statusValidasi === null ||
                              item.statusValidasi === undefined ? (
                                "Menunggu"
                              ) : item.statusValidasi === "invalid" ? (
                                <>
                                  <CgDanger className="mr-1" />
                                  Invalid
                                </>
                              ) : (
                                <>
                                  <FaCheck className="mr-1" />
                                  Valid
                                </>
                              )}
                            </Badge>
                          </Link>
                        </div>
                        <div className="text-end md:text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <FaTrash size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                      <div className="text-5xl mb-3">🔍</div>
                      <p className="text-center">
                        Tidak ada data selesai yang ditemukan
                      </p>
                      {(filterCategory !== "all" ||
                        filterPenyulang !== "all" ||
                        filterInspektor !== "all" ||
                        searchTerm) && (
                        <Button
                          variant="link"
                          onClick={resetFilters}
                          className="mt-2"
                        >
                          Reset filter
                        </Button>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Dialog Konfirmasi */}
        <Dialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Data</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus data temuan ini? Tindakan ini
                tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            {deleteConfirm && (
              <div className="py-4 border-y">
                <p className="font-medium">{deleteConfirm.temuan}</p>
                <div className="text-sm text-gray-500 mt-2">
                  <p>Penyulang: {deleteConfirm.penyulang}</p>
                  <p>Inspektor: {deleteConfirm.inspektor}</p>
                  <p>Tanggal: {deleteConfirm.tglInspeksi}</p>
                </div>
              </div>
            )}
            <DialogFooter className="flex space-x-2 sm:justify-end">
              <Button variant="outline" onClick={cancelDelete}>
                Batal
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Hapus Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layouts>
  );
};

export default DaftarPemeliharaan;
