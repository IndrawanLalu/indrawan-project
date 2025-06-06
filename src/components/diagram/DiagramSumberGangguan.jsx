import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Power,
  Clock,
  Shield,
  AlertCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Target,
  Timer,
  Zap,
  Activity,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  ChartDataLabels
);

const DiagramSumberGangguan = ({ startDate, endDate }) => {
  const [chartData, setChartData] = useState([0, 0]);
  const [chartDurasi, setChartDurasi] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalGangguan: 0,
    avgDurasi: 0,
    maxDurasi: 0,
    minDurasi: 0,
    totalDurasiDetik: 0,
    gangguanPerHari: 0,
    reliabilityScore: 0,
    fastRecoveryRate: 0,
    criticalCount: 0,
  });

  // Fungsi untuk mengonversi "HH:MM:SS" ke dalam detik
  const convertToSeconds = (timeString) => {
    const [hours, minutes, seconds = 0] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Fungsi untuk mengonversi detik ke format waktu
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Helper function to format date to yyyy-MM-dd
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch data from Firebase
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "gangguanPenyulang"),
        where("tanggalGangguan", ">=", formatDate(startDate)),
        where("tanggalGangguan", "<=", formatDate(endDate))
      );
      const querySnapshot = await getDocs(q);
      const dataSumberGangguan = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      let giCount = 0;
      let recloserCount = 0;
      let padamLebihLimaMenit = 0;
      let padamKurangLimaMenit = 0;
      let totalDurasiDetik = 0;
      let durasiArray = [];
      let criticalCount = 0;

      // Menghitung gangguan per sumber dan analytics
      dataSumberGangguan.forEach((data) => {
        // Fasilitas padam
        if (data.fasilitasPadam === "GI/PLTD") {
          giCount++;
        } else if (data.fasilitasPadam === "RECLOSER") {
          recloserCount++;
        }

        // Durasi analysis
        const durasiInSeconds = convertToSeconds(data.durasi);
        const fiveMinutesInSeconds = 5 * 60;
        const thirtyMinutesInSeconds = 30 * 60;

        totalDurasiDetik += durasiInSeconds;
        durasiArray.push(durasiInSeconds);

        if (durasiInSeconds > fiveMinutesInSeconds) {
          padamLebihLimaMenit++;
        } else {
          padamKurangLimaMenit++;
        }

        // Critical incidents (> 30 minutes)
        if (durasiInSeconds > thirtyMinutesInSeconds) {
          criticalCount++;
        }
      });

      const totalGangguan = dataSumberGangguan.length;
      const avgDurasi =
        totalGangguan > 0 ? totalDurasiDetik / totalGangguan : 0;
      const maxDurasi = Math.max(...durasiArray, 0);
      const minDurasi = durasiArray.length > 0 ? Math.min(...durasiArray) : 0;

      // Calculate period in days
      const periodDays =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
      const gangguanPerHari = totalGangguan / periodDays;

      // Reliability metrics
      const fastRecoveryRate =
        totalGangguan > 0 ? (padamKurangLimaMenit / totalGangguan) * 100 : 0;
      const reliabilityScore =
        100 - (criticalCount / Math.max(totalGangguan, 1)) * 100;

      setChartData([giCount, recloserCount]);
      setChartDurasi([padamLebihLimaMenit, padamKurangLimaMenit]);
      setAnalytics({
        totalGangguan,
        avgDurasi,
        maxDurasi,
        minDurasi,
        totalDurasiDetik,
        gangguanPerHari,
        reliabilityScore,
        fastRecoveryRate,
        criticalCount,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      setError("Gagal memuat analisis sumber gangguan.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Chart configurations
  const facilityData = {
    labels: ["GI/PLTD", "RECLOSER"],
    datasets: [
      {
        data: chartData,
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Green for GI/PLTD
          "rgba(168, 85, 247, 0.8)", // Purple for RECLOSER
        ],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(168, 85, 247, 1)"],
        borderWidth: 2,
      },
    ],
  };

  const durationData = {
    labels: ["> 5 Menit", "≤ 5 Menit"],
    datasets: [
      {
        data: chartDurasi,
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)", // Red for long duration
          "rgba(34, 197, 94, 0.8)", // Green for quick recovery
        ],
        borderColor: ["rgba(239, 68, 68, 1)", "rgba(34, 197, 94, 1)"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            size: 11,
            weight: "500",
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "rgba(255, 255, 255, 1)",
        bodyColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(34, 197, 94, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        display: function (context) {
          return context.parsed && context.parsed > 0;
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
          return value > 0 ? `${value}\n(${percentage}%)` : "";
        },
        color: "rgba(255, 255, 255, 0.9)",
        font: {
          size: 10,
          weight: "bold",
        },
        textAlign: "center",
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuart",
    },
  };

  const getReliabilityColor = (score) => {
    if (score >= 90) return "text-emerald-300";
    if (score >= 75) return "text-amber-300";
    return "text-red-300";
  };

  const getReliabilityIcon = (score) => {
    if (score >= 90) return <Shield className="w-5 h-5 text-emerald-300" />;
    if (score >= 75) return <Target className="w-5 h-5 text-amber-300" />;
    return <AlertCircle className="w-5 h-5 text-red-300" />;
  };

  if (error) {
    return (
      <Card className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 hover:bg-red-500/15 transition-all duration-300">
        <CardContent className="text-center py-12">
          <Power className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Analisis
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
      {/* Main Analytics Card */}
      <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/25">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white/90 text-lg font-semibold">
                  Analisis Sumber Gangguan
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Fasilitas & durasi padam
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {loading && (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 disabled:opacity-50"
                title="Refresh analisis"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xl font-bold text-emerald-300">
                {loading ? "..." : analytics.totalGangguan}
              </div>
              <div className="text-xs text-white/70">Total Gangguan</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xl font-bold text-cyan-300">
                {loading
                  ? "..."
                  : formatDuration(Math.round(analytics.avgDurasi))}
              </div>
              <div className="text-xs text-white/70">Rata-rata Durasi</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xl font-bold text-amber-300">
                {loading ? "..." : analytics.gangguanPerHari.toFixed(1)}
              </div>
              <div className="text-xs text-white/70">Per Hari</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div
                className={`text-xl font-bold ${getReliabilityColor(
                  analytics.reliabilityScore
                )}`}
              >
                {loading ? "..." : `${analytics.reliabilityScore.toFixed(0)}%`}
              </div>
              <div className="text-xs text-white/70">Reliabilitas</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facility Chart */}
            <div className="space-y-3">
              <h4 className="text-white/80 text-sm font-medium flex items-center space-x-2">
                <Power className="w-4 h-4" />
                <span>Fasilitas Padam</span>
              </h4>
              <div className="h-48">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Doughnut data={facilityData} options={chartOptions} />
                )}
              </div>
            </div>

            {/* Duration Chart */}
            <div className="space-y-3">
              <h4 className="text-white/80 text-sm font-medium flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Durasi Padam</span>
              </h4>
              <div className="h-48">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Doughnut data={durationData} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Performance Metrics */}
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white/90 text-sm font-medium flex items-center space-x-2">
              {getReliabilityIcon(analytics.reliabilityScore)}
              <span>Performa Sistem</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Fast Recovery Rate</span>
              <span className="text-emerald-300 font-semibold text-sm">
                {loading ? "..." : `${analytics.fastRecoveryRate.toFixed(1)}%`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Critical Incidents</span>
              <span className="text-red-300 font-semibold text-sm">
                {loading ? "..." : analytics.criticalCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Reliability Score</span>
              <span
                className={`font-semibold text-sm ${getReliabilityColor(
                  analytics.reliabilityScore
                )}`}
              >
                {loading ? "..." : `${analytics.reliabilityScore.toFixed(1)}%`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Duration Analysis */}
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white/90 text-sm font-medium flex items-center space-x-2">
              <Timer className="w-4 h-4" />
              <span>Analisis Durasi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Durasi Terpendek</span>
              <span className="text-emerald-300 font-semibold text-sm">
                {loading ? "..." : formatDuration(analytics.minDurasi)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Durasi Terpanjang</span>
              <span className="text-red-300 font-semibold text-sm">
                {loading ? "..." : formatDuration(analytics.maxDurasi)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Total Downtime</span>
              <span className="text-amber-300 font-semibold text-sm">
                {loading ? "..." : formatDuration(analytics.totalDurasiDetik)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Impact Assessment */}
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white/90 text-sm font-medium flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Dampak Gangguan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Quick Recovery</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-semibold text-sm">
                  {loading ? "..." : chartDurasi[1]}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">Extended Outage</span>
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-red-300 font-semibold text-sm">
                  {loading ? "..." : chartDurasi[0]}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">System Health</span>
              <span
                className={`font-semibold text-sm ${
                  analytics.reliabilityScore >= 90
                    ? "text-emerald-300"
                    : analytics.reliabilityScore >= 75
                    ? "text-amber-300"
                    : "text-red-300"
                }`}
              >
                {loading
                  ? "..."
                  : analytics.reliabilityScore >= 90
                  ? "Excellent"
                  : analytics.reliabilityScore >= 75
                  ? "Good"
                  : "Needs Attention"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

DiagramSumberGangguan.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};

export default DiagramSumberGangguan;
