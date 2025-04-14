import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  where,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import Layouts from "../admin/Layouts";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import { useNotifications } from "../../contexts/notifications";

const PengukuranTable = () => {
  const { checkAndCreateNotifications } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    kvaMin: "",
    kvaMax: "",
    bebanMin: "",
    bebanMax: "",
    unbalanceMin: "",
    unbalanceMax: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  ); // Default awal bulan ini
  const [endDate, setEndDate] = useState(new Date()); // Default hari ini
  const [pengukuranList, setPengukuranList] = useState([]);
  const [garduData, setGarduData] = useState({});

  const [selectedGardu, setSelectedGardu] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // State untuk dialog konfirmasi hapus
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [garduToDelete, setGarduToDelete] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const handleSelectGardu = (gardu) => {
    setSelectedGardu(gardu);
    setIsOpen(true);
  };

  // Fungsi untuk menangani klik tombol hapus
  const handleDeleteClick = (e, gardu) => {
    e.stopPropagation(); // Mencegah row click event
    setGarduToDelete(gardu);
    setIsDeleteDialogOpen(true);
  };

  // Fungsi untuk menghapus data dari Firebase
  const confirmDelete = async () => {
    if (!garduToDelete) return;

    try {
      // Hapus dokumen dari koleksi Pengukuran
      await deleteDoc(doc(db, "Pengukuran", garduToDelete.id));

      // Update state untuk menghapus data dari tabel
      setPengukuranList((prevList) =>
        prevList.filter((item) => item.id !== garduToDelete.id)
      );

      // Tutup dialog konfirmasi
      setIsDeleteDialogOpen(false);
      setGarduToDelete(null);

      // Feedback ke pengguna (opsional)
      alert(`Data gardu ${garduToDelete.nama} berhasil dihapus!`);
    } catch (error) {
      console.error("Error menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data. Silakan coba lagi.");
    }
  };

  // Fungsi untuk mengupdate status checklist
  const handleChecklistChange = async (id, field, value) => {
    try {
      // Referensi dokumen
      const docRef = doc(db, "Pengukuran", id);

      // Update dokumen
      await updateDoc(docRef, {
        [field]: !value,
      });

      // Update state lokal
      setPengukuranList((prevList) =>
        prevList.map((item) =>
          item.id === id ? { ...item, [field]: !value } : item
        )
      );

      console.log(
        `Status ${field} untuk gardu ${id} berhasil diubah ke ${!value}`
      );
    } catch (error) {
      console.error(`Error mengupdate status ${field}:`, error);
      alert(`Terjadi kesalahan saat mengupdate status. Silakan coba lagi.`);
    }
  };

  // Fungsi untuk handle perubahan filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fungsi untuk reset filter
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      kvaMin: "",
      kvaMax: "",
      bebanMin: "",
      bebanMax: "",
      unbalanceMin: "",
      unbalanceMax: "",
    });
    setShowFilters(false);
  };

  // Filter data berdasarkan pencarian dan filter
  useEffect(() => {
    let result = [...pengukuranList];

    // Filter berdasarkan pencarian (nama gardu atau alamat)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.nama && item.nama.toLowerCase().includes(searchLower)) ||
          (item.alamat && item.alamat.toLowerCase().includes(searchLower))
      );
    }

    // Filter berdasarkan range KVA
    if (filters.kvaMin) {
      result = result.filter((item) => {
        const kva = parseFloat(item.kva) || 0;
        return kva >= parseFloat(filters.kvaMin);
      });
    }
    if (filters.kvaMax) {
      result = result.filter((item) => {
        const kva = parseFloat(item.kva) || 0;
        return kva <= parseFloat(filters.kvaMax);
      });
    }

    // Filter berdasarkan range Beban KVA
    if (filters.bebanMin) {
      result = result.filter((item) => {
        const beban = parseFloat(item.bebanKva) || 0;
        return beban >= parseFloat(filters.bebanMin);
      });
    }
    if (filters.bebanMax) {
      result = result.filter((item) => {
        const beban = parseFloat(item.bebanKva) || 0;
        return beban <= parseFloat(filters.bebanMax);
      });
    }

    // Filter berdasarkan range Unbalance
    if (filters.unbalanceMin) {
      result = result.filter((item) => {
        const unbalance = parseFloat(item.unbalance) || 0;
        return unbalance >= parseFloat(filters.unbalanceMin);
      });
    }
    if (filters.unbalanceMax) {
      result = result.filter((item) => {
        const unbalance = parseFloat(item.unbalance) || 0;
        return unbalance <= parseFloat(filters.unbalanceMax);
      });
    }
    result.sort((a, b) => {
      // Konversi string tanggal ke objek Date
      const dateA = a.tanggalUkur
        ? new Date(a.tanggalUkur.split("-").join("/"))
        : new Date(0);
      const dateB = b.tanggalUkur
        ? new Date(b.tanggalUkur.split("-").join("/"))
        : new Date(0);

      // Jika tanggal sama, bandingkan jam
      if (dateA.getTime() === dateB.getTime()) {
        const timeA = a.jamUkur || "00:00";
        const timeB = b.jamUkur || "00:00";
        return timeB.localeCompare(timeA); // Jam terbaru lebih dulu
      }

      return dateB - dateA; // Tanggal terbaru lebih dulu
    });

    setFilteredData(result);
    // Hitung total pages berdasarkan data yang telah difilter
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    // Reset ke halaman pertama ketika filter berubah
    setCurrentPage(1);
  }, [pengukuranList, searchTerm, filters, itemsPerPage]);

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

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const data = snapshot.docs.map((doc) => {
          const pengukuran = doc.data();
          const gardu = garduData[pengukuran.nama] || {};
          // Tambahkan pemrosesan data petugas di sini
          const petugasName =
            typeof pengukuran.petugas === "string"
              ? pengukuran.petugas
              : pengukuran.petugas?.nama || "Unknown";

          return {
            id: doc.id,
            ...pengukuran,
            petugas: petugasName,
            alamat: gardu.alamat || "Tidak Diketahui",
            kva: gardu.kva || "Tidak Diketahui",
          };
        });
        setPengukuranList(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error saat memproses data pengukuran:", error);
      }
    });

    return () => unsubscribe();
  }, [garduData, startDate, endDate, checkAndCreateNotifications]);

  // Fungsi untuk mengubah halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Fungsi untuk mengubah jumlah item per halaman
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset ke halaman pertama ketika mengubah jumlah item
  };

  // Menghitung data yang akan ditampilkan pada halaman saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Fungsi untuk download data ke Excel dengan semua detail dalam satu sheet
  const downloadExcel = () => {
    try {
      // Membuat workbook baru
      const workbook = XLSX.utils.book_new();

      // Persiapkan array untuk menyimpan data gabungan
      const combinedData = [];

      // Proses setiap gardu - gunakan filteredData untuk menghasilkan file yang sesuai dengan filter
      filteredData.forEach((item) => {
        // Data utama gardu
        const baseData = {
          "Nama Gardu": item.nama || "",
          Alamat: item.alamat || "",
          KVA: item.kva || "",
          R: item.R || "",
          S: item.S || "",
          T: item.T || "",
          N: item.N || "",
          "Beban KVA": parseFloat(item.bebanKva || 0).toFixed(2),
          "Persen KVA": parseFloat(item.persenKva || 0).toFixed(2),
          UBL: parseFloat(item.unbalance || 0).toFixed(2),
          Petugas: item.petugas || "",
          Jam: item.jamUkur || "",
          "Tanggal Ukur": item.tanggalUkur || "",
          // Tambahkan data tegangan
          "Tegangan R-N": item.tegangan?.R_N || "",
          "Tegangan S-N": item.tegangan?.S_N || "",
          "Tegangan T-N": item.tegangan?.T_N || "",
          "Tegangan R-S": item.tegangan?.R_S || "",
          "Tegangan S-T": item.tegangan?.S_T || "",
          "Tegangan T-R": item.tegangan?.R_T || "",
        };

        // Tambahkan data beban per jurusan
        const jurusanList = ["A", "B", "C", "D", "K"];

        jurusanList.forEach((jurusan) => {
          baseData[`Jurusan ${jurusan} - R`] =
            item.perJurusan?.R?.[jurusan] || 0;
          baseData[`Jurusan ${jurusan} - S`] =
            item.perJurusan?.S?.[jurusan] || 0;
          baseData[`Jurusan ${jurusan} - T`] =
            item.perJurusan?.T?.[jurusan] || 0;
          baseData[`Jurusan ${jurusan} - N`] =
            item.perJurusan?.N?.[jurusan] || 0;
        });

        // Tambahkan data gabungan ke array
        combinedData.push(baseData);
      });

      // Buat worksheet dari data gabungan
      const combinedWorksheet = XLSX.utils.json_to_sheet(combinedData);

      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(
        workbook,
        combinedWorksheet,
        "Data Gardu Lengkap"
      );

      // Nama file
      const fileName = `Data_Pengukuran_Lengkap_${format(
        startDate,
        "dd-MM-yyyy"
      )}_sd_${format(endDate, "dd-MM-yyyy")}.xlsx`;

      // Mengubah workbook menjadi file excel dan mendownloadnya
      XLSX.writeFile(workbook, fileName);

      console.log("Excel file has been successfully downloaded");
    } catch (error) {
      console.error("Error downloading excel:", error);
      alert("Terjadi kesalahan saat mengunduh file Excel. Silahkan coba lagi.");
    }
  };

  // Pagination components
  const renderPagination = () => {
    const pages = [];

    // Menambahkan tombol Previous
    pages.push(
      <Button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        variant="outline"
        className="mx-1"
      >
        Prev
      </Button>
    );

    // Menambahkan tombol halaman
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          variant={currentPage === i ? "default" : "outline"}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    // Menambahkan tombol Next
    pages.push(
      <Button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        variant="outline"
        className="mx-1"
      >
        Next
      </Button>
    );

    return pages;
  };

  return (
    <Layouts>
      <div className=" mx-auto p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Data Pengukuran</h2>
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

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari nama gardu atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-main rounded-md px-3 py-2 w-full max-w-md"
            />
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-1"
            >
              <span>
                {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
              </span>
              <span>{showFilters ? "▲" : "▼"}</span>
            </Button>
            {(searchTerm || Object.values(filters).some((v) => v !== "")) && (
              <Button
                onClick={resetFilters}
                variant="destructive"
                className="ml-2"
              >
                Reset
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 p-4 border border-main rounded-md bg-gray-50">
              <h3 className="font-semibold mb-2">Filter Lanjutan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">KVA</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      name="kvaMin"
                      value={filters.kvaMin}
                      onChange={handleFilterChange}
                      className="border border-main rounded-md px-2 py-1 w-full"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      name="kvaMax"
                      value={filters.kvaMax}
                      onChange={handleFilterChange}
                      className="border border-main rounded-md px-2 py-1 w-full"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Beban KVA</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      name="bebanMin"
                      value={filters.bebanMin}
                      onChange={handleFilterChange}
                      className="border border-main rounded-md px-2 py-1 w-full"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      name="bebanMax"
                      value={filters.bebanMax}
                      onChange={handleFilterChange}
                      className="border border-main rounded-md px-2 py-1 w-full"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Unbalance (%)</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      name="unbalanceMin"
                      value={filters.unbalanceMin}
                      onChange={handleFilterChange}
                      className="border border-main rounded-md px-2 py-1 w-full"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      name="unbalanceMax"
                      value={filters.unbalanceMax}
                      onChange={handleFilterChange}
                      className="border border-main rounded-md px-2 py-1 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Excel Export Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={downloadExcel}
            className="bg-green-600 hover:bg-green-700"
          >
            Download Excel Lengkap
          </Button>
        </div>

        {/* Pagination Controls - Items per page */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="mr-2">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-main rounded-md px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2">item per halaman</span>
          </div>
          {filteredData.length !== pengukuranList.length && (
            <div className="text-sm text-gray-600">
              Menampilkan {filteredData.length} dari {pengukuranList.length}{" "}
              total data
            </div>
          )}
          <div>
            <span>
              Menampilkan {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
              {filteredData.length} data
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-transparent border-main">
            <thead>
              <tr className="bg-main">
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
                <th className="px-4 py-2 border">Input AMG</th>
                <th className="px-4 py-2 border">Input Probis</th>
                <th className="px-4 py-2 border" colSpan="2">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="text-center border ">
                  <td
                    className="px-4 py-2 border cursor-pointer font-bold text-blue-600 hover:underline"
                    onClick={() => handleSelectGardu(item)}
                  >
                    {item.nama}
                  </td>
                  <td className="px-4 py-2 border">{item.alamat}</td>
                  <td className="px-4 py-2 border">{item.kva}</td>
                  <td className="px-4 py-2 border">{item.R}</td>
                  <td className="px-4 py-2 border">{item.S}</td>
                  <td className="px-4 py-2 border">{item.T}</td>
                  <td className="px-4 py-2 border">{item.N}</td>
                  <td className="px-4 py-2 border">
                    {parseFloat(item.bebanKva || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">
                    {parseFloat(item.persenKva || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">
                    {parseFloat(item.unbalance || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">{item.petugas}</td>
                  <td className="px-4 py-2 border">{item.jamUkur}</td>
                  <td className="px-4 py-2 border">{item.tanggalUkur}</td>
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={item.inputAMG || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleChecklistChange(
                          item.id,
                          "inputAMG",
                          item.inputAMG || false
                        );
                      }}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={item.inputProbis || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleChecklistChange(
                          item.id,
                          "inputProbis",
                          item.inputProbis || false
                        );
                      }}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </td>
                  {/* <td className="border px-4 py-2">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectGardu(item);
                      }}
                    >
                      Detail
                    </Button>
                  </td> */}
                  <td className="border px-4 py-2">
                    <Button
                      variant="destructive"
                      onClick={(e) => handleDeleteClick(e, item)}
                      size="sm"
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4">{renderPagination()}</div>

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
                    {parseFloat(selectedGardu.kva || 0).toFixed(2)}
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
                      <p>R-N : {selectedGardu.tegangan?.R_N || "0"} Volt</p>
                      <p>S-N : {selectedGardu.tegangan?.S_N || "0"} Volt</p>
                      <p>T-N : {selectedGardu.tegangan?.T_N || "0"} Volt</p>
                    </div>
                    <div className="">
                      <p>R-S : {selectedGardu.tegangan?.R_S || "0"} Volt</p>
                      <p>S-T : {selectedGardu.tegangan?.S_T || "0"} Volt</p>
                      <p>T-R : {selectedGardu.tegangan?.R_T || "0"} Volt</p>
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

          {/* Dialog Konfirmasi Hapus */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus data gardu:{" "}
                  {garduToDelete?.nama}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Hapus
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
