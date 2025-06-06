import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  RefreshCw,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  Activity,
  Filter,
  Download,
  Eye,
} from "lucide-react";

const TabelSegment = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return "from-emerald-500 to-green-400";
    if (percentage >= 60) return "from-amber-500 to-yellow-400";
    if (percentage >= 40) return "from-orange-500 to-red-400";
    return "from-red-500 to-red-600";
  };

  const getPercentageTextColor = (percentage) => {
    if (percentage >= 80) return "text-emerald-300";
    if (percentage >= 60) return "text-amber-300";
    return "text-red-300";
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const StatusBadge = ({ count, type }) => {
    const configs = {
      temuan: {
        color: "bg-red-500/20 text-red-300 border-red-500/30",
        icon: AlertTriangle,
      },
      pending: {
        color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        icon: Clock,
      },
      selesai: {
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        icon: CheckCircle,
      },
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        <span>{count}</span>
      </div>
    );
  };

  const ModernProgressBar = ({ percentage }) => {
    return (
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center">
          <span
            className={`text-xs font-semibold ${getPercentageTextColor(
              percentage
            )}`}
          >
            {percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-white/50">
            {percentage >= 80
              ? "Excellent"
              : percentage >= 60
              ? "Good"
              : percentage >= 40
              ? "Fair"
              : "Poor"}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getPercentageColor(
              percentage
            )} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  const SortableHeader = ({ children, sortKey }) => (
    <TableHead
      className="text-white/80 font-semibold cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig.key === sortKey && (
          <span className="text-xs">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </TableHead>
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const BulanIni = new Date().getMonth();

      // Ambil data dari koleksi "segment"
      const segmentQuery = query(
        collection(db, "segment"),
        orderBy("idSegment", "asc")
      );
      const segmentSnapshot = await getDocs(segmentQuery);
      const fetchedSegmentData = segmentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Ambil data dari koleksi "inspeksi"
      const inspeksiQuery = query(collection(db, "inspeksi"));
      const inspeksiSnapshot = await getDocs(inspeksiQuery);
      const fetchedInspeksiData = inspeksiSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Mengelompokkan inspeksi berdasarkan penyulang dan status
      const inspeksiByPenyulang = fetchedInspeksiData.reduce(
        (acc, inspeksi) => {
          const { penyulang, status } = inspeksi;
          if (!acc[penyulang]) {
            acc[penyulang] = { temuan: 0, pending: 0, selesai: 0 };
          }
          if (status === "Temuan") {
            acc[penyulang].temuan += 1;
          } else if (status === "Pending") {
            acc[penyulang].pending += 1;
          } else if (status === "Selesai") {
            acc[penyulang].selesai += 1;
          }
          return acc;
        },
        {}
      );

      // Menghitung total panjang, total segmen, dan segmen sudah dicek per penyulang
      const penyulangStats = fetchedSegmentData.reduce((acc, item) => {
        if (!acc[item.penyulang]) {
          acc[item.penyulang] = {
            totalPanjang: 0,
            totalSegmen: 0,
            segmenSudahDicek: 0,
            temuan: inspeksiByPenyulang[item.penyulang]?.temuan || 0,
            pending: inspeksiByPenyulang[item.penyulang]?.pending || 0,
            selesai: inspeksiByPenyulang[item.penyulang]?.selesai || 0,
          };
        }

        // Tambahkan panjang segmen dan total segmen
        acc[item.penyulang].totalPanjang +=
          parseFloat(item.panjangSegment) || 0;
        acc[item.penyulang].totalSegmen += 1;

        // Hitung segmen yang sudah dicek bulan ini
        if (new Date(item.tglCek).getMonth() === BulanIni) {
          acc[item.penyulang].segmenSudahDicek += 1;
        }

        return acc;
      }, {});

      // Mengubah objek menjadi array untuk ditampilkan di tabel
      const result = Object.entries(penyulangStats).map(
        ([penyulang, stats]) => ({
          penyulang,
          ...stats,
          persentase:
            stats.totalSegmen > 0
              ? (stats.segmenSudahDicek / stats.totalSegmen) * 100
              : 0,
          totalInspeksi: stats.temuan + stats.pending + stats.selesai,
          completionRate:
            stats.temuan + stats.pending + stats.selesai > 0
              ? (stats.selesai /
                  (stats.temuan + stats.pending + stats.selesai)) *
                100
              : 0,
        })
      );

      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Gagal memuat data segment. Silakan coba lagi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    item.penyulang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate summary statistics
  const summary = data.reduce(
    (acc, item) => ({
      totalPenyulang: acc.totalPenyulang + 1,
      totalKM: acc.totalKM + item.totalPanjang,
      totalSegmen: acc.totalSegmen + item.totalSegmen,
      totalDicek: acc.totalDicek + item.segmenSudahDicek,
      totalTemuan: acc.totalTemuan + item.temuan,
      totalPending: acc.totalPending + item.pending,
      totalSelesai: acc.totalSelesai + item.selesai,
      avgPersentase: 0, // Will calculate after
    }),
    {
      totalPenyulang: 0,
      totalKM: 0,
      totalSegmen: 0,
      totalDicek: 0,
      totalTemuan: 0,
      totalPending: 0,
      totalSelesai: 0,
      avgPersentase: 0,
    }
  );

  summary.avgPersentase =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.persentase, 0) / data.length
      : 0;

  // Add PropTypes for internal components
  StatusBadge.propTypes = {
    count: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["temuan", "pending", "selesai"]).isRequired,
  };

  ModernProgressBar.propTypes = {
    percentage: PropTypes.number.isRequired,
  };

  SortableHeader.propTypes = {
    children: PropTypes.node.isRequired,
    sortKey: PropTypes.string.isRequired,
  };

  if (error) {
    return (
      <Card className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 hover:bg-red-500/15 transition-all duration-300">
        <CardContent className="text-center py-12">
          <MapPin className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Memuat Tabel
          </h3>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <MapPin className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-300">
                  {loading ? "..." : summary.totalPenyulang}
                </p>
                <p className="text-xs text-white/70">Total Penyulang</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-300">
                  {loading ? "..." : `${summary.totalKM.toFixed(1)}`}
                </p>
                <p className="text-xs text-white/70">Total KM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-purple-500/20">
                <Target className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-300">
                  {loading ? "..." : `${summary.avgPersentase.toFixed(1)}%`}
                </p>
                <p className="text-xs text-white/70">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Activity className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-300">
                  {loading ? "..." : summary.totalTemuan + summary.totalPending}
                </p>
                <p className="text-xs text-white/70">Issues Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white/90 text-lg font-semibold">
                  Data Segment Penyulang
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Monitor progress inspeksi bulan{" "}
                  {new Date().toLocaleDateString("id-ID", { month: "long" })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {loading && (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Cari penyulang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pt-0">
          <div className="rounded-lg overflow-hidden bg-white/5 border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <SortableHeader sortKey="penyulang">Penyulang</SortableHeader>
                  <SortableHeader sortKey="totalPanjang">
                    Total Panjang (KM)
                  </SortableHeader>
                  <SortableHeader sortKey="totalSegmen">
                    Total Segmen
                  </SortableHeader>
                  <SortableHeader sortKey="segmenSudahDicek">
                    Sudah Dicek
                  </SortableHeader>
                  <SortableHeader sortKey="persentase">
                    Progress (%)
                  </SortableHeader>
                  <TableHead className="text-white/80 font-semibold">
                    Status Inspeksi
                  </TableHead>
                  <TableHead className="text-white/80 font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-white/10">
                      <TableCell>
                        <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 bg-white/10 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 bg-white/10 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 bg-white/10 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-white/60">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Tidak ada data penyulang ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((item, index) => (
                    <TableRow
                      key={index}
                      className="border-white/10 hover:bg-white/5 transition-colors duration-200"
                    >
                      <TableCell className="font-medium text-white/90">
                        {item.penyulang}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.totalPanjang.toFixed(2)} KM
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.totalSegmen}
                      </TableCell>
                      <TableCell className="text-white/80">
                        <div className="flex items-center space-x-2">
                          <span>{item.segmenSudahDicek}</span>
                          <span className="text-white/50">
                            / {item.totalSegmen}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ModernProgressBar percentage={item.persentase} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <StatusBadge count={item.temuan} type="temuan" />
                          <StatusBadge count={item.pending} type="pending" />
                          <StatusBadge count={item.selesai} type="selesai" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer Info */}
          {!loading && sortedData.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-white/60">
              <p>
                Menampilkan {sortedData.length} dari {data.length} penyulang
                {searchTerm && ` (filtered by "${searchTerm}")`}
              </p>
              <p>
                Total: {summary.totalDicek} / {summary.totalSegmen} segment
                dicek
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TabelSegment;
