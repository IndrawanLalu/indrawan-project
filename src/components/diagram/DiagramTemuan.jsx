import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Filter,
  Download,
  Calendar,
  Target,
  Award,
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const DiagramTemuan = ({ startDate, endDate }) => {
  const [temuanTerbanyak, setTemuanTerbanyak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' or 'asc'

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "inspeksi"),
        where("tglInspeksi", ">=", formatDate(startDate)),
        where("tglInspeksi", "<=", formatDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      const dataInspeksi = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Calculate temuan frequency
      const temuanCounts = {};
      dataInspeksi.forEach((item) => {
        const temuan = item.temuan || "Unknown"; // Handle missing temuan
        if (temuanCounts[temuan]) {
          temuanCounts[temuan] += 1;
        } else {
          temuanCounts[temuan] = 1;
        }
      });

      // Convert to array and sort
      const sortedTemuan = Object.entries(temuanCounts)
        .sort((a, b) => (sortOrder === "desc" ? b[1] - a[1] : a[1] - b[1]))
        .slice(0, 20);

      setTemuanTerbanyak(sortedTemuan);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      setError("Gagal memuat data temuan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, sortOrder]);

  // Filter data based on search term
  const filteredData = temuanTerbanyak.filter(([temuan]) =>
    temuan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate analytics
  const analytics = temuanTerbanyak.reduce(
    (acc, [, count]) => ({
      totalTemuan: acc.totalTemuan + count,
      maxCount: Math.max(acc.maxCount, count),
      avgCount: 0, // Will calculate after
      categories: acc.categories + 1,
    }),
    {
      totalTemuan: 0,
      maxCount: 0,
      avgCount: 0,
      categories: 0,
    }
  );

  analytics.avgCount =
    analytics.categories > 0
      ? (analytics.totalTemuan / analytics.categories).toFixed(1)
      : 0;

  // Chart configuration
  const data = {
    labels: filteredData.map(([temuan]) =>
      temuan.length > 30 ? temuan.substring(0, 30) + "..." : temuan
    ),
    datasets: [
      {
        label: "Jumlah Temuan",
        data: filteredData.map(([, count]) => count),
        backgroundColor: filteredData.map((_, index) => {
          const opacity = 0.8 - index * 0.03; // Gradual opacity decrease
          return `rgba(239, 68, 68, ${Math.max(opacity, 0.3)})`;
        }),
        borderColor: filteredData.map((_, index) => {
          const opacity = 1 - index * 0.05;
          return `rgba(239, 68, 68, ${Math.max(opacity, 0.5)})`;
        }),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    barThickness: 16,
    categoryPercentage: 0.8,
    barPercentage: 0.9,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(239, 68, 68, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: (context) => {
            const fullLabel = temuanTerbanyak[context[0].dataIndex]?.[0] || "";
            return fullLabel;
          },
          label: (context) => {
            const count = context.parsed.x;
            const percentage = ((count / analytics.totalTemuan) * 100).toFixed(
              1
            );
            return [`Jumlah: ${count} temuan`, `Persentase: ${percentage}%`];
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "right",
        formatter: (value) => {
          const percentage = ((value / analytics.totalTemuan) * 100).toFixed(1);
          return `${value}x (${percentage}%)`;
        },
        color: "#fff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 4,
        padding: 4,
        font: {
          weight: "bold",
          size: 10,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            size: 10,
          },
          padding: 8,
          maxTicksLimit: 20,
        },
      },
    },
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  if (error) {
    return (
      <Card className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 hover:bg-red-500/15 transition-all duration-300">
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Memuat Chart
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
      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-300">
                  {loading ? "..." : analytics.totalTemuan}
                </p>
                <p className="text-xs text-white/70">Total Temuan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Target className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-300">
                  {loading ? "..." : analytics.categories}
                </p>
                <p className="text-xs text-white/70">Jenis Temuan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-300">
                  {loading ? "..." : analytics.avgCount}
                </p>
                <p className="text-xs text-white/70">Rata-rata</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-emerald-500/20">
                <Award className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-300">
                  {loading ? "..." : analytics.maxCount}
                </p>
                <p className="text-xs text-white/70">Tertinggi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Card */}
      <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/25">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white/90 text-lg font-semibold">
                  TOP 20 Temuan Inspeksi
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Periode:{" "}
                  {startDate &&
                    endDate &&
                    `${formatDisplayDate(startDate)} - ${formatDisplayDate(
                      endDate
                    )}`}
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
                placeholder="Cari jenis temuan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSortOrder}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 flex items-center space-x-1"
                title={`Sort ${
                  sortOrder === "desc" ? "ascending" : "descending"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs">
                  {sortOrder === "desc" ? "↓" : "↑"}
                </span>
              </button>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pt-0">
          <div className="h-96 md:h-[500px] lg:h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/60">Memuat data temuan...</p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white/60">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Tidak ada data temuan</p>
                  <p className="text-sm">
                    {searchTerm
                      ? `Tidak ditemukan temuan yang mengandung "${searchTerm}"`
                      : "Belum ada data pada periode yang dipilih"}
                  </p>
                </div>
              </div>
            ) : (
              <Bar data={data} options={options} />
            )}
          </div>

          {/* Chart Footer Info */}
          {!loading && filteredData.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-white/60">
              <p>
                Menampilkan {filteredData.length} dari {temuanTerbanyak.length}{" "}
                jenis temuan
                {searchTerm && ` (filtered by "${searchTerm}")`}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Periode:{" "}
                    {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))}{" "}
                    hari
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

DiagramTemuan.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};

export default DiagramTemuan;
