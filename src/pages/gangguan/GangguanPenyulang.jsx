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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Edit,
  Plus,
  Trash2,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Download,
  Zap,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  Database,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layouts from "@/pages/admin/Layouts";
import ModalDialog from "@/lib/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const GangguanPenyulang = () => {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(new Date());

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysDifference = () => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "gangguanPenyulang"),
          where("tanggalGangguan", ">=", formatDate(startDate)),
          where("tanggalGangguan", "<=", formatDate(endDate))
        );
        const querySnapshot = await getDocs(q);
        const dataGangguan = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        const sortedData = dataGangguan.sort(
          (a, b) => new Date(b.tanggalGangguan) - new Date(a.tanggalGangguan)
        );
        setData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  // Filter data based on search term
  const filteredData = data.filter(
    (item) =>
      item.penyulang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keypoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.penyebab?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kodeGangguan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (item) => {
    setEditItem(item);
  };

  const handleCancel = () => {
    setEditItem(null);
    setError("");
  };

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
      setError("Semua field harus diisi.");
      return;
    }

    try {
      const itemDocRef = doc(db, "gangguanPenyulang", editItem.id);
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

      setData((prevData) =>
        prevData.map((item) => (item.id === editItem.id ? editItem : item))
      );

      setEditItem(null);
      setError("");

      toast({
        variant: "success",
        title: "Updated",
        description: "Data Berhasil diupdate",
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteDoc(doc(db, "gangguanPenyulang", selectedItem.id));
      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedItem.id)
      );

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

    handleCloseModal();
  };

  return (
    <Layouts>
      {/* Global DatePicker Styles */}
      <style>{`
        
        .react-datepicker {
          background-color: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px !important;
          color: white !important;
        }
        .react-datepicker__header {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: white !important;
        }
        .react-datepicker__day {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .react-datepicker__day:hover {
          background-color: rgba(249, 115, 22, 0.3) !important;
          color: white !important;
        }
        .react-datepicker__day--selected {
          background-color: rgb(249, 115, 22) !important;
          color: white !important;
        }
        .react-datepicker__day--today {
          background-color: rgba(59, 130, 246, 0.3) !important;
          color: white !important;
        }
        .react-datepicker__navigation {
          border: none !important;
        }
        .react-datepicker__navigation--previous {
          border-right-color: rgba(255, 255, 255, 0.7) !important;
        }
        .react-datepicker__navigation--next {
          border-left-color: rgba(255, 255, 255, 0.7) !important;
        }
      `}</style>

      <div className="relative min-h-screen bg-gradient-to-br from-backgroundFrom via-backgroundFrom to-backgroundTo ">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
          </div>
        </div>

        <div className="relative z-10 p-6 space-y-6">
          {/* Modern Header */}
          <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

            <CardHeader className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Gangguan Penyulang
                    </h1>
                    <p className="text-white/60 text-sm flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span>Data management & monitoring</span>
                      <span className="text-white/40">•</span>
                      <span>
                        {formatDisplayDate(startDate)} -{" "}
                        {formatDisplayDate(endDate)}
                      </span>
                      <span className="text-white/40">•</span>
                      <span>{getDaysDifference()} hari</span>
                    </p>
                  </div>
                </div>

                {/* Date Controls */}
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 relative">
                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10 relative z-10">
                    <Calendar className="w-5 h-5 text-white/70" />
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-white/60 mb-1">
                          Start Date
                        </label>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200"
                          dateFormat="dd/MM/yyyy"
                          popperClassName="z-[9999]"
                          popperPlacement="bottom-start"
                          popperModifiers={[
                            {
                              name: "offset",
                              options: {
                                offset: [0, 8],
                              },
                            },
                            {
                              name: "preventOverflow",
                              options: {
                                rootBoundary: "viewport",
                                tether: false,
                                altAxis: true,
                              },
                            },
                          ]}
                        />
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-white/20"></div>
                      <div className="flex flex-col">
                        <label className="text-xs text-white/60 mb-1">
                          End Date
                        </label>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200"
                          dateFormat="dd/MM/yyyy"
                          popperClassName="z-[9999]"
                          popperPlacement="bottom-start"
                          popperModifiers={[
                            {
                              name: "offset",
                              options: {
                                offset: [0, 8],
                              },
                            },
                            {
                              name: "preventOverflow",
                              options: {
                                rootBoundary: "viewport",
                                tether: false,
                                altAxis: true,
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-300">
                      {loading ? "..." : data.length}
                    </p>
                    <p className="text-xs text-white/70">Total Gangguan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Filter className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-300">
                      {filteredData.length}
                    </p>
                    <p className="text-xs text-white/70">Filtered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-emerald-500/20">
                    <Clock className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-300">
                      {getDaysDifference()}
                    </p>
                    <p className="text-xs text-white/70">Days Period</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 -z-10">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-amber-500/20">
                    <TrendingUp className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-300">
                      {loading
                        ? "..."
                        : Math.round(
                            (data.length / Math.max(getDaysDifference(), 1)) * 7
                          )}
                    </p>
                    <p className="text-xs text-white/70">Weekly Avg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              editItem ? "lg:grid-cols-3 gap-6" : "grid-cols-1"
            }`}
          >
            <div className={editItem ? "lg:col-span-2" : "col-span-1"}>
              <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <CardTitle className="text-white/90 text-xl flex items-center space-x-2">
                      <Database className="w-6 h-6" />
                      <span>Data Gangguan Penyulang</span>
                    </CardTitle>

                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                        <input
                          type="text"
                          placeholder="Search data..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Link to="/admin/tambahGangguan">
                          <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-none">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah
                          </Button>
                        </Link>

                        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white/60">Loading data...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/10 relative">
                      <div className="overflow-auto max-h-[600px]">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white/10 backdrop-blur-lg">
                            <TableRow className="border-white/10 hover:bg-white/5">
                              <TableHead className="text-white/80 font-semibold">
                                #
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                No. Gangguan
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Key Point
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Penyulang
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Fasilitas Padam
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Jam Padam
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Jam Nyala
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Durasi
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Tgl. Gangguan
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Indikasi
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Kode Gangguan
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Arus R
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Arus S
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Arus T
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Arus N
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Penyebab
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Lokasi
                              </TableHead>
                              <TableHead className="text-white/80 font-semibold">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredData.map((item, index) => (
                              <TableRow
                                key={item.id}
                                className="border-white/10 hover:bg-white/5 transition-colors duration-200"
                              >
                                <TableCell className="text-white/70">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.noGangguanAPKT}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.keypoint}
                                </TableCell>
                                <TableCell className="text-white/90 font-medium">
                                  {item.penyulang}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.fasilitasPadam}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.jamPadam}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.jamNyala}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.durasi}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {new Date(
                                    item.tanggalGangguan
                                  ).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.indikasi}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.kodeGangguan}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.arusR}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.arusS}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.arusT}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.arusN}
                                </TableCell>
                                <TableCell className="text-white/90">
                                  {item.penyebab}
                                </TableCell>
                                <TableCell>
                                  {item.lokasiGangguan === "-" ? (
                                    <span className="text-white/50">-</span>
                                  ) : item.lokasiGangguan ? (
                                    <Link
                                      to={
                                        "https://www.google.com/maps/place/" +
                                        item.lokasiGangguan
                                      }
                                      target="_blank"
                                    >
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-none"
                                      >
                                        <MapPin className="w-3 h-3 mr-1" />
                                        Maps
                                      </Button>
                                    </Link>
                                  ) : null}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditClick(item)}
                                      className="hover:bg-blue-500/20 text-blue-300 hover:text-blue-200"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteClick(item)}
                                      className="hover:bg-red-500/20 text-red-300 hover:text-red-200"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Table Footer */}
                  {!loading && (
                    <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                      <p>
                        Showing {filteredData.length} of {data.length} records
                        {searchTerm && ` (filtered by "${searchTerm}")`}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Live Data</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Form Panel */}
            {editItem && (
              <div className="lg:col-span-1">
                <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 sticky top-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                        <Edit className="w-5 h-5" />
                        <span>Edit Gangguan</span>
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="hover:bg-red-500/20 text-red-300 hover:text-red-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 max-h-[600px] overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          No. Gangguan APKT
                        </Label>
                        <Input
                          value={editItem.noGangguanAPKT || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              noGangguanAPKT: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Key Point
                        </Label>
                        <Input
                          value={editItem.keypoint || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              keypoint: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Penyulang
                        </Label>
                        <Input
                          value={editItem.penyulang || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              penyulang: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Fasilitas Padam
                        </Label>
                        <Input
                          value={editItem.fasilitasPadam || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              fasilitasPadam: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-white/80 font-medium">
                            Jam Padam
                          </Label>
                          <Input
                            value={editItem.jamPadam || ""}
                            onChange={(e) =>
                              setEditItem({
                                ...editItem,
                                jamPadam: e.target.value,
                              })
                            }
                            className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/80 font-medium">
                            Jam Nyala
                          </Label>
                          <Input
                            value={editItem.jamNyala || ""}
                            onChange={(e) =>
                              setEditItem({
                                ...editItem,
                                jamNyala: e.target.value,
                              })
                            }
                            className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Durasi
                        </Label>
                        <Input
                          value={editItem.durasi || ""}
                          onChange={(e) =>
                            setEditItem({ ...editItem, durasi: e.target.value })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Tanggal Gangguan
                        </Label>
                        <Input
                          value={editItem.tanggalGangguan || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              tanggalGangguan: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Indikasi
                        </Label>
                        <Input
                          value={editItem.indikasi || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              indikasi: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Kode Gangguan
                        </Label>
                        <Input
                          value={editItem.kodeGangguan || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              kodeGangguan: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-white/80 font-medium">
                            Arus R
                          </Label>
                          <Input
                            value={editItem.arusR || ""}
                            onChange={(e) =>
                              setEditItem({
                                ...editItem,
                                arusR: e.target.value,
                              })
                            }
                            className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/80 font-medium">
                            Arus S
                          </Label>
                          <Input
                            value={editItem.arusS || ""}
                            onChange={(e) =>
                              setEditItem({
                                ...editItem,
                                arusS: e.target.value,
                              })
                            }
                            className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-white/80 font-medium">
                            Arus T
                          </Label>
                          <Input
                            value={editItem.arusT || ""}
                            onChange={(e) =>
                              setEditItem({
                                ...editItem,
                                arusT: e.target.value,
                              })
                            }
                            className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/80 font-medium">
                            Arus N
                          </Label>
                          <Input
                            value={editItem.arusN || ""}
                            onChange={(e) =>
                              setEditItem({
                                ...editItem,
                                arusN: e.target.value,
                              })
                            }
                            className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Penyebab
                        </Label>
                        <Input
                          value={editItem.penyebab || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              penyebab: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 font-medium">
                          Lokasi Gangguan
                        </Label>
                        <Input
                          value={editItem.lokasiGangguan || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              lokasiGangguan: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-300 text-sm">{error}</p>
                        </div>
                      )}

                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleCancel}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none">
                              <Save className="w-4 h-4 mr-2" />
                              Update
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900/95 backdrop-blur-lg border border-white/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">
                                Konfirmasi Update
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-white/70">
                                Apakah Anda yakin ingin mengupdate data gangguan
                                ini? Perubahan tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleUpdate}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              >
                                Update
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
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
