import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  Zap,
  RefreshCw,
} from "lucide-react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { fetchSheetData } from "@/utils/googleSheetsData";

const TotalGangguan = ({ startDate, endDate }) => {
  const userLogin = useSelector((state) => state.auth.user);
  const userUnit = userLogin ? userLogin.unit : null;

  const [totalGangguan, setTotalGangguan] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const targetGangguan = 81;

  // Memoized month mapping untuk performa yang lebih baik
  const monthMap = useMemo(
    () => ({
      Januari: 0,
      Februari: 1,
      Maret: 2,
      April: 3,
      Mei: 4,
      Juni: 5,
      Juli: 6,
      Agustus: 7,
      September: 8,
      Oktober: 9,
      November: 10,
      Desember: 11,
    }),
    []
  );

  // Fungsi animasi counter yang dioptimasi
  const animateCounter = useCallback((target, setter, duration = 2000) => {
    let start = 0;
    const startTime = Date.now();

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (target - start) * easeOutQuart);
      setter(current);
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    requestAnimationFrame(updateCounter);
  }, []);

  // Fungsi parsing tanggal yang lebih robust
  const parseDate = useCallback(
    (dateString) => {
      if (!dateString || typeof dateString !== "string") return null;

      const parts = dateString.trim().split(" ");
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0]);
      const monthName = parts[1];
      const year = parseInt(parts[2]);

      const month = monthMap[monthName];

      if (isNaN(day) || month === undefined || isNaN(year)) return null;
      if (day < 1 || day > 31 || year < 1900 || year > 2100) return null;

      return new Date(year, month, day);
    },
    [monthMap]
  );

  // Fungsi validasi dan filter data
  const filterGangguanData = useCallback(
    (data) => {
      if (!Array.isArray(data) || !userUnit || !startDate || !endDate) {
        return [];
      }

      return data.filter((item) => {
        // Validasi unit
        if (!item.ulp || typeof item.ulp !== "string") return false;
        const isUnitMatch =
          item.ulp.trim().toUpperCase() === userUnit.toUpperCase();

        // Validasi tanggal
        const itemDate = parseDate(item.tanggal);
        if (!itemDate) return false;

        const isDateInRange = itemDate >= startDate && itemDate <= endDate;

        return isUnitMatch && isDateInRange;
      });
    },
    [userUnit, startDate, endDate, parseDate]
  );

  // Fungsi fetch data dengan error handling yang lebih baik
  const fetchTotalGangguan = useCallback(async () => {
    if (!userUnit) {
      setLoading(false);
      setError("Unit pengguna tidak tersedia");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allGangguanData = await fetchSheetData("gangguanPenyulang", "A:S");

      if (!Array.isArray(allGangguanData)) {
        throw new Error("Data yang diterima tidak valid");
      }

      const filteredData = filterGangguanData(allGangguanData);
      const total = filteredData.length;

      setTotalGangguan(total);
      setLastFetch(new Date());

      // Animasi dengan delay untuk efek yang lebih smooth
      setTimeout(() => {
        animateCounter(total, setAnimatedTotal);
        animateCounter(
          total > 0 ? (total / targetGangguan) * 100 : 0,
          setAnimatedPercentage
        );
      }, 300);
    } catch (error) {
      console.error("Error fetching gangguan data:", error);
      setError(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [userUnit, filterGangguanData, animateCounter, targetGangguan]);

  // Effect untuk fetch data
  useEffect(() => {
    fetchTotalGangguan();
  }, [fetchTotalGangguan]);

  // Computed values
  const percentage = useMemo(
    () => (totalGangguan > 0 ? (totalGangguan / targetGangguan) * 100 : 0),
    [totalGangguan, targetGangguan]
  );

  const getStatusColor = useMemo(() => {
    if (percentage < 50) return "from-emerald-500 to-teal-600";
    if (percentage < 80) return "from-amber-500 to-orange-600";
    return "from-red-500 to-rose-600";
  }, [percentage]);

  const getStatusText = useMemo(() => {
    if (percentage < 50) return "Rendah";
    if (percentage < 80) return "Sedang";
    return "Tinggi";
  }, [percentage]);

  const refreshData = useCallback(() => {
    fetchTotalGangguan();
  }, [fetchTotalGangguan]);

  // Error UI
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
                disabled={loading}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
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
            Monitor real-time gangguan Penyulang {userUnit || "ULP SELONG"}
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh Data</span>
            </button>
            {lastFetch && (
              <span className="text-sm text-white/60">
                Terakhir diperbarui: {format(lastFetch, "HH:mm:ss")}
              </span>
            )}
          </div>
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
            <Card className="relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getStatusColor}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>

              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-full bg-gradient-to-r ${getStatusColor} group-hover:scale-110 transition-transform duration-300`}
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

                <div className="flex justify-center mt-6">
                  <div
                    className={`px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor}/20 border border-white/20`}
                  >
                    <span className="text-white text-sm font-medium flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Status: {getStatusText}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 bg-gradient-to-r ${getStatusColor} rounded-full transition-all duration-2000 ease-out`}
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
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
};

export { TotalGangguan };
