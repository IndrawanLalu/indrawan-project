import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isValid,
  addMonths,
  subMonths,
  getDate,
} from "date-fns";
import { id } from "date-fns/locale";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  LuCalendar,
  LuFilter,
  LuSearch,
  LuCheckCircle2,
  LuAlertTriangle,
  LuBarChart3,
  LuUsers,
  LuListChecks,
  LuEye,
  LuArrowUpDown,
  LuCircle,
  LuCheckCircle,
  LuInfo,
  LuLoader2,
  LuDownload,
  LuRefreshCw,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import Layouts from "../admin/Layouts";

const PreventiveDashboard = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [preventiveData, setPreventiveData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("table");
  const [selectedPreventive, setSelectedPreventive] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "tglInspeksi",
    direction: "desc",
  });
  const [uniquePetugas, setUniquePetugas] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    petugasCount: 0,
  });

  // Helper function to get days in month
  const getDaysInMonth = (date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get preventive data
        const q = query(
          collection(db, "inspeksi"),
          where("category", "==", "Preventive"),
          orderBy("tglInspeksi", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          tglInspeksi: doc.data().tglInspeksi || null,
          tglEksekusi: doc.data().tglEksekusi || null,
        }));

        // Process the data
        const processedData = fetchedData.map((item) => ({
          ...item,
          tglInspeksiObj: item.tglInspeksi ? parseDate(item.tglInspeksi) : null,
          tglEksekusiObj: item.tglEksekusi ? parseDate(item.tglEksekusi) : null,
        }));

        setPreventiveData(processedData);
        setFilteredData(processedData);

        // Calculate summary stats
        const completed = processedData.filter(
          (item) => item.status === "Selesai"
        ).length;

        // Extract unique petugas
        const allPetugas = new Set();
        processedData.forEach((item) => {
          if (item.status === "Selesai" && item.eksekutor) {
            const petugasList = item.eksekutor.split(", ");
            petugasList.forEach((p) => allPetugas.add(p.trim()));
          }
        });

        setSummaryStats({
          total: processedData.length,
          completed: completed,
          pending: processedData.length - completed,
          petugasCount: allPetugas.size,
        });

        setUniquePetugas(Array.from(allPetugas));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshing]);

  // Helper function to parse date strings
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? parsedDate : null;
  };

  // Filter data based on search query and filter status
  useEffect(() => {
    let result = [...preventiveData];

    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          (item.temuan && item.temuan.toLowerCase().includes(lowerCaseQuery)) ||
          (item.lokasi && item.lokasi.toLowerCase().includes(lowerCaseQuery)) ||
          (item.noGardu &&
            item.noGardu.toLowerCase().includes(lowerCaseQuery)) ||
          (item.penyulang &&
            item.penyulang.toLowerCase().includes(lowerCaseQuery)) ||
          (item.inspektor &&
            item.inspektor.toLowerCase().includes(lowerCaseQuery)) ||
          (item.eksekutor &&
            item.eksekutor.toLowerCase().includes(lowerCaseQuery))
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((item) => item.status === filterStatus);
    }

    setFilteredData(result);
  }, [searchQuery, filterStatus, preventiveData]);

  // Sort data
  const sortedData = useMemo(() => {
    const sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        // Handle dates for sorting
        if (
          sortConfig.key === "tglInspeksi" ||
          sortConfig.key === "tglEksekusi"
        ) {
          const aDate = a[sortConfig.key + "Obj"];
          const bDate = b[sortConfig.key + "Obj"];

          // Handle null cases
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;

          const comparison = aDate > bDate ? 1 : -1;
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }

        // Handle regular string/number fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) {
      return <LuArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <LuArrowUpDown className="ml-1 h-4 w-4 text-blue-500" />
    ) : (
      <LuArrowUpDown className="ml-1 h-4 w-4 text-blue-500 transform rotate-180" />
    );
  };

  // Format date nicely
  const formatDate = (date) => {
    if (!date) return "-";
    return format(date, "d MMMM yyyy", { locale: id });
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    setSelectedDate((prev) => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate((prev) => addMonths(prev, 1));
  };

  // Get petugas performance data for the selected month
  const petugasPerformanceData = useMemo(() => {
    // Get start and end of selected month
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    // Generate all days in the month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create a map to store performance data per petugas per day
    const performanceMap = {};

    // Initialize the map with all days and petugas
    uniquePetugas.forEach((petugas) => {
      performanceMap[petugas] = {};
      daysInMonth.forEach((day) => {
        const dayKey = format(day, "yyyy-MM-dd");
        performanceMap[petugas][dayKey] = 0;
      });
    });

    // Fill in the data
    preventiveData.forEach((item) => {
      if (item.status === "Selesai" && item.tglEksekusiObj && item.eksekutor) {
        // Check if the execution date is within the selected month
        if (
          item.tglEksekusiObj >= monthStart &&
          item.tglEksekusiObj <= monthEnd
        ) {
          const dayKey = format(item.tglEksekusiObj, "yyyy-MM-dd");
          const petugasList = item.eksekutor.split(", ");

          petugasList.forEach((petugas) => {
            const trimmedPetugas = petugas.trim();
            if (
              performanceMap[trimmedPetugas] &&
              performanceMap[trimmedPetugas][dayKey] !== undefined
            ) {
              performanceMap[trimmedPetugas][dayKey]++;
            }
          });
        }
      }
    });

    // Convert map to array
    const result = Object.entries(performanceMap).map(([petugas, days]) => ({
      petugas,
      days: Object.entries(days).map(([date, count]) => ({ date, count })),
      total: Object.values(days).reduce((sum, count) => sum + count, 0),
    }));

    // Sort by total count descending
    return result.sort((a, b) => b.total - a.total);
  }, [preventiveData, uniquePetugas, selectedDate]);

  // Function to handle data export
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Prepare data for export
      const exportData = sortedData.map((item) => ({
        "Tanggal Inspeksi": item.tglInspeksiObj
          ? format(item.tglInspeksiObj, "yyyy-MM-dd")
          : "-",
        "Tanggal Eksekusi": item.tglEksekusiObj
          ? format(item.tglEksekusiObj, "yyyy-MM-dd")
          : "-",
        Temuan: item.temuan || "-",
        Lokasi: item.lokasi || "-",
        "No. Gardu": item.noGardu || "-",
        Penyulang: item.penyulang || "-",
        Status: item.status || "-",
        Inspektor: item.inspektor || "-",
        Eksekutor: item.eksekutor || "-",
        Keterangan: item.keterangan || "-",
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const cell = row[header] || "";
              // Escape commas and quotes
              return `"${String(cell).replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `preventive_data_${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Function to refresh data
  const handleRefresh = () => {
    setRefreshing((prev) => !prev);
  };

  return (
    <Layouts>
      <div className=" mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Monitoring Preventive
          </h1>
          <p className="text-muted-foreground mt-2">
            Pantau dan analisis pekerjaan preventive maintenance
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Preventive
              </CardTitle>
              <LuListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Semua pekerjaan preventive
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Diselesaikan
              </CardTitle>
              <LuCheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {summaryStats.total > 0
                  ? `${Math.round(
                      (summaryStats.completed / summaryStats.total) * 100
                    )}% dari total`
                  : "0% dari total"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Belum Dikerjakan
              </CardTitle>
              <LuAlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Menunggu eksekusi
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Jumlah Petugas
              </CardTitle>
              <LuUsers className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats.petugasCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Telah mengeksekusi preventive
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="temuan" className="mb-6">
          <TabsList className="mb-4 w-auto">
            <TabsTrigger value="temuan" className="flex items-center">
              <LuListChecks className="mr-2 h-4 w-4" />
              Daftar Temuan
            </TabsTrigger>
            <TabsTrigger value="petugas" className="flex items-center">
              <LuUsers className="mr-2 h-4 w-4" />
              Kinerja Petugas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temuan">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>Daftar Temuan Preventive</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={loading || refreshing}
                    >
                      {loading || refreshing ? (
                        <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LuRefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExport}
                      disabled={exportLoading || sortedData.length === 0}
                    >
                      {exportLoading ? (
                        <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LuDownload className="mr-2 h-4 w-4" />
                      )}
                      Export CSV
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Daftar semua temuan preventive dengan status dan detailnya
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Cari temuan, lokasi, petugas..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <LuFilter className="text-gray-400" />
                    <Select
                      value={filterStatus}
                      onValueChange={(value) => setFilterStatus(value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Temuan">Belum Dikerjakan</SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="hidden md:flex items-center ml-2">
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        className="h-9 rounded-r-none"
                        onClick={() => setViewMode("table")}
                      >
                        <LuListChecks className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "cards" ? "default" : "outline"}
                        size="sm"
                        className="h-9 rounded-l-none"
                        onClick={() => setViewMode("cards")}
                      >
                        <LuBarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LuLoader2 className="mr-2 h-6 w-6 animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                ) : (
                  <>
                    {sortedData.length === 0 ? (
                      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                        <LuAlertTriangle
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />
                        <p className="text-gray-500">
                          Tidak ada data preventive yang sesuai dengan filter
                        </p>
                      </div>
                    ) : viewMode === "table" ? (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead
                                onClick={() => requestSort("temuan")}
                                className="cursor-pointer"
                              >
                                Temuan {getSortDirectionIcon("temuan")}
                              </TableHead>
                              <TableHead
                                onClick={() => requestSort("lokasi")}
                                className="cursor-pointer"
                              >
                                Lokasi {getSortDirectionIcon("lokasi")}
                              </TableHead>
                              <TableHead
                                onClick={() => requestSort("penyulang")}
                                className="cursor-pointer"
                              >
                                Penyulang {getSortDirectionIcon("penyulang")}
                              </TableHead>
                              <TableHead
                                onClick={() => requestSort("tglInspeksi")}
                                className="cursor-pointer"
                              >
                                Tgl Inspeksi{" "}
                                {getSortDirectionIcon("tglInspeksi")}
                              </TableHead>
                              <TableHead
                                onClick={() => requestSort("tglEksekusi")}
                                className="cursor-pointer"
                              >
                                Tgl Eksekusi{" "}
                                {getSortDirectionIcon("tglEksekusi")}
                              </TableHead>
                              <TableHead
                                onClick={() => requestSort("status")}
                                className="cursor-pointer"
                              >
                                Status {getSortDirectionIcon("status")}
                              </TableHead>
                              <TableHead
                                onClick={() => requestSort("eksekutor")}
                                className="cursor-pointer"
                              >
                                Petugas {getSortDirectionIcon("eksekutor")}
                              </TableHead>
                              <TableHead>Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedData.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell
                                  className="max-w-[200px] truncate"
                                  title={item.temuan}
                                >
                                  {item.temuan}
                                </TableCell>
                                <TableCell
                                  className="max-w-[180px] truncate"
                                  title={item.lokasi}
                                >
                                  {item.lokasi}
                                </TableCell>
                                <TableCell>{item.penyulang || "-"}</TableCell>
                                <TableCell>
                                  {item.tglInspeksiObj
                                    ? formatDate(item.tglInspeksiObj)
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {item.tglEksekusiObj
                                    ? formatDate(item.tglEksekusiObj)
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      item.status === "Selesai"
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                    }
                                  >
                                    {item.status === "Selesai" ? (
                                      <LuCheckCircle className="mr-1 h-3 w-3" />
                                    ) : (
                                      <LuCircle className="mr-1 h-3 w-3" />
                                    )}
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-[150px] truncate">
                                  {item.status === "Selesai"
                                    ? item.eksekutor
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedPreventive(item);
                                      setDetailsOpen(true);
                                    }}
                                  >
                                    <LuEye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedData.map((item) => (
                          <Card key={item.id} className="overflow-hidden">
                            <CardHeader className="p-4 pb-0">
                              <div className="flex justify-between">
                                <div>
                                  <CardTitle
                                    className="text-base line-clamp-1"
                                    title={item.temuan}
                                  >
                                    {item.temuan}
                                  </CardTitle>
                                  <CardDescription
                                    className="line-clamp-1"
                                    title={item.lokasi}
                                  >
                                    {item.lokasi}
                                  </CardDescription>
                                </div>
                                <Badge
                                  className={
                                    item.status === "Selesai"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  }
                                >
                                  {item.status === "Selesai" ? (
                                    <LuCheckCircle className="mr-1 h-3 w-3" />
                                  ) : (
                                    <LuCircle className="mr-1 h-3 w-3" />
                                  )}
                                  {item.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Penyulang:
                                  </span>
                                  <p>{item.penyulang || "-"}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    No. Gardu:
                                  </span>
                                  <p>{item.noGardu || "-"}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Tgl Inspeksi:
                                  </span>
                                  <p>
                                    {item.tglInspeksiObj
                                      ? formatDate(item.tglInspeksiObj)
                                      : "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Tgl Eksekusi:
                                  </span>
                                  <p>
                                    {item.tglEksekusiObj
                                      ? formatDate(item.tglEksekusiObj)
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between">
                              <div className="text-xs text-gray-500">
                                {item.status === "Selesai"
                                  ? "Eksekutor: " + item.eksekutor
                                  : "Inspektor: " + item.inspektor}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPreventive(item);
                                  setDetailsOpen(true);
                                }}
                              >
                                <LuEye className="h-4 w-4 mr-1" /> Detail
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <p>
                    Menampilkan {sortedData.length} dari {preventiveData.length}{" "}
                    temuan
                  </p>
                  {filterStatus !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterStatus("all")}
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="petugas">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Kinerja Petugas Preventive</CardTitle>
                    <CardDescription>
                      Pengerjaan preventive per petugas dalam periode waktu
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToPreviousMonth}
                    >
                      <LuChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-2 min-w-32 justify-center">
                      <LuCalendar className="h-4 w-4" />
                      <span>
                        {format(selectedDate, "MMMM yyyy", { locale: id })}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToNextMonth}
                    >
                      <LuChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LuLoader2 className="mr-2 h-6 w-6 animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                ) : petugasPerformanceData.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                    <LuInfo className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">
                      Tidak ada data kinerja petugas untuk bulan{" "}
                      {format(selectedDate, "MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <div className="rounded-md border min-w-[800px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px] bg-muted">
                              Nama Petugas
                            </TableHead>
                            <TableHead
                              colSpan={getDaysInMonth(selectedDate).length}
                              className="text-center bg-muted"
                            >
                              Jumlah Pengerjaan per Tanggal
                            </TableHead>
                            <TableHead className="text-right bg-muted w-[80px]">
                              Total
                            </TableHead>
                          </TableRow>
                          <TableRow>
                            <TableHead className="bg-muted"></TableHead>
                            {getDaysInMonth(selectedDate).map((day) => (
                              <TableHead
                                key={format(day, "yyyy-MM-dd")}
                                className="p-2 text-center w-[36px] bg-muted/50"
                              >
                                {getDate(day)}
                              </TableHead>
                            ))}
                            <TableHead className="bg-muted"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {petugasPerformanceData.map((petugas) => (
                            <TableRow key={petugas.petugas}>
                              <TableCell className="font-medium">
                                {petugas.petugas}
                              </TableCell>
                              {getDaysInMonth(selectedDate).map((day) => {
                                const dayKey = format(day, "yyyy-MM-dd");
                                const dayData = petugas.days.find(
                                  (d) => d.date === dayKey
                                );
                                const count = dayData ? dayData.count : 0;

                                return (
                                  <TableCell
                                    key={dayKey}
                                    className="p-1 text-center"
                                  >
                                    {count > 0 && (
                                      <div
                                        className={`w-6 h-6 rounded-sm mx-auto flex items-center justify-center text-xs font-medium
                                        ${
                                          count >= 5
                                            ? "bg-green-500 text-white"
                                            : count >= 3
                                            ? "bg-green-300 text-gray-800"
                                            : "bg-green-100 text-gray-800"
                                        }`}
                                        title={`${format(day, "d MMMM yyyy", {
                                          locale: id,
                                        })}: ${count} pekerjaan`}
                                      >
                                        {count}
                                      </div>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-right">
                                <Badge variant="outline" className="font-bold">
                                  {petugas.total}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded-sm"></div>
                  <span>1-2 pekerjaan</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-4 h-4 bg-green-300 rounded-sm"></div>
                  <span>3-4 pekerjaan</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  <span>5+ pekerjaan</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        {selectedPreventive && (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detail Temuan Preventive</DialogTitle>
                <DialogDescription>
                  Informasi lengkap tentang temuan preventive
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="pr-3">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Temuan</p>
                      <p className="font-medium">{selectedPreventive.temuan}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Lokasi</p>
                      <p>{selectedPreventive.lokasi}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">No. Gardu</p>
                      <p>{selectedPreventive.noGardu || "-"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Penyulang</p>
                      <p>{selectedPreventive.penyulang}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <Badge
                        className={`${
                          selectedPreventive.status === "Selesai"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        } mt-1`}
                      >
                        {selectedPreventive.status === "Selesai" ? (
                          <LuCheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <LuCircle className="mr-1 h-3 w-3" />
                        )}
                        {selectedPreventive.status}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Tanggal Inspeksi
                      </p>
                      <p>
                        {selectedPreventive.tglInspeksiObj
                          ? formatDate(selectedPreventive.tglInspeksiObj)
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Inspektor</p>
                      <p>{selectedPreventive.inspektor}</p>
                    </div>

                    {selectedPreventive.status === "Selesai" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Tanggal Eksekusi
                          </p>
                          <p>
                            {selectedPreventive.tglEksekusiObj
                              ? formatDate(selectedPreventive.tglEksekusiObj)
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Eksekutor
                          </p>
                          <p>{selectedPreventive.eksekutor}</p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-sm text-gray-500 mb-1">
                            Keterangan
                          </p>
                          <p>{selectedPreventive.keterangan || "-"}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Foto Temuan</p>
                    <div className="mt-1 aspect-video rounded-md overflow-hidden border">
                      {selectedPreventive.imageUrl ? (
                        <img
                          src={selectedPreventive.imageUrl}
                          alt="Foto Temuan"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          Tidak ada foto
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPreventive.status === "Selesai" &&
                    selectedPreventive.imageEksekusiURL && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Foto Setelah Eksekusi
                        </p>
                        <div className="mt-1 aspect-video rounded-md overflow-hidden border">
                          <img
                            src={selectedPreventive.imageEksekusiURL}
                            alt="Foto Eksekusi"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layouts>
  );
};

export default PreventiveDashboard;
