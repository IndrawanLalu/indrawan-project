import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  Zap,
  RefreshCw,
} from "lucide-react";
import PropTypes from "prop-types";

const TotalGangguan = ({ startDate, endDate }) => {
  const [totalGangguan, setTotalGangguan] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [error, setError] = useState(null);

  const targetGangguan = 81;
  // const startDate = new Date(new Date().getFullYear(), 0, 1); // Awal tahun ini
  // const endDate = new Date(); // Hari ini

  // Animated counter function
  const animateCounter = (target, setter, duration = 2000) => {
    let start = 0;
    const startTime = Date.now();

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (target - start) * easeOutQuart);

      setter(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const fetchTotalGangguan = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "gangguanPenyulang"), // Sesuaikan dengan nama koleksi Firebase
        where("tanggalGangguan", ">=", format(startDate, "yyyy-MM-dd")),
        where("tanggalGangguan", "<=", format(endDate, "yyyy-MM-dd"))
      );

      const querySnapshot = await getDocs(q);
      const total = querySnapshot.size; // Menghitung jumlah dokumen (gangguan)

      setTotalGangguan(total); // Set jumlah total gangguan

      // Start animations after data is loaded
      setTimeout(() => {
        animateCounter(total, setAnimatedTotal);
        animateCounter((total / targetGangguan) * 100, setAnimatedPercentage);
      }, 300);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      setError("Gagal memuat data. Silakan coba lagi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalGangguan();
  }, [startDate, endDate]);

  const percentage =
    totalGangguan > 0 ? (totalGangguan / targetGangguan) * 100 : 0;

  const getStatusColor = () => {
    if (percentage < 50) return "from-emerald-500 to-teal-600";
    if (percentage < 80) return "from-amber-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const getStatusText = () => {
    if (percentage < 50) return "Rendah";
    if (percentage < 80) return "Sedang";
    return "Tinggi";
  };

  const refreshData = () => {
    fetchTotalGangguan();
  };

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="relative z-10 max-w-7xl mx-auto">
          <Card className="bg-red-500/10 backdrop-blur-lg border border-red-500/20">
            <CardContent className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Error Memuat Data
              </h3>
              <p className="text-red-300 mb-6">{error}</p>
              <button
                onClick={refreshData}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4">
            Dashboard Gangguan Penyulang
          </h1>
          <p className="text-gray-300 text-lg">
            Monitor real-time gangguan Penyulang ULP SELONG
          </p>
          <button
            onClick={refreshData}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Total Gangguan Card */}
          <div className="group">
            <Card className="relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white/90 text-lg font-semibold">
                      Total Gangguan
                    </CardTitle>
                  </div>
                  {loading && (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pt-0">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2 tabular-nums">
                    {loading ? "..." : animatedTotal.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/70">
                    {format(startDate, "MMM yyyy")} -{" "}
                    {format(endDate, "MMM yyyy")}
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="flex justify-center mt-6">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                      />
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="url(#gradient1)"
                        strokeWidth="2"
                        strokeDasharray={`${animatedPercentage}, 100`}
                        className="transition-all duration-2000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white/80 font-semibold">
                        {animatedPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Target Gangguan Card */}
          <div className="group">
            <Card className="relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white/90 text-lg font-semibold">
                    Target Maksimal
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pt-0">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2 tabular-nums">
                    {targetGangguan}
                  </div>
                  <div className="text-sm text-white/70">
                    Gangguan per tahun
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex justify-center mt-6">
                  <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                    <span className="text-emerald-300 text-sm font-medium">
                      Target Tahunan
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Persentase Card */}
          <div className="group">
            <Card
              className={`relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getStatusColor()}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>

              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-full bg-gradient-to-r ${getStatusColor()} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white/90 text-lg font-semibold">
                    Persentase
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pt-0">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2 tabular-nums">
                    {loading ? "..." : `${animatedPercentage.toFixed(1)}%`}
                  </div>
                  <div className="text-sm text-white/70">
                    dari target maksimal
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mt-6">
                  <div
                    className={`px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor()}/20 border border-white/20`}
                  >
                    <span className="text-white text-sm font-medium flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Status: {getStatusText()}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 bg-gradient-to-r ${getStatusColor()} rounded-full transition-all duration-2000 ease-out`}
                      style={{ width: `${Math.min(animatedPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SVG Gradients */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="0"
        height="0"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
TotalGangguan.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};

export { TotalGangguan };
