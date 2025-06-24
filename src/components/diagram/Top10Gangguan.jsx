import PropTypes from "prop-types";
import { format } from "date-fns";
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
import { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Zap, BarChart3, RefreshCw, AlertTriangle } from "lucide-react";
import { useTop10Gangguan } from "@/hooks/useTop10Gangguan";
import { withErrorBoundary } from "@/components/ErrorBoundary";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Top10GangguanWithHook = ({ startDate, endDate }) => {
  // 🎯 Menggunakan custom hook untuk Top 10 data
  const {
    gangguanTerbanyak,
    totalGangguan,
    avgGangguan,
    topPenyulang,
    totalPenyulang,
    loading,
    error,
    lastFetch,
    refresh,
    userUnit,
  } = useTop10Gangguan({
    startDate,
    endDate,
    filterByUnit: true,
    top: 10,
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
  });

  // Generate gradient colors for bars
  const generateGradientColors = useCallback((count) => {
    const colors = [];
    const backgroundColors = [];

    for (let i = 0; i < count; i++) {
      const intensity = 1 - (i / count) * 0.7; // Fade from full to 30% intensity
      colors.push(`rgba(139, 92, 246, ${intensity})`); // Purple gradient
      backgroundColors.push(`rgba(139, 92, 246, ${intensity * 0.8})`);
    }

    return { colors, backgroundColors };
  }, []);

  const { colors, backgroundColors } = useMemo(
    () => generateGradientColors(gangguanTerbanyak.length),
    [generateGradientColors, gangguanTerbanyak.length]
  );

  // Chart data
  const chartData = useMemo(
    () => ({
      labels: gangguanTerbanyak.map(([penyulang]) => penyulang),
      datasets: [
        {
          label: "Kali Gangguan",
          data: gangguanTerbanyak.map(([, count]) => count),
          borderColor: colors,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    }),
    [gangguanTerbanyak, colors, backgroundColors]
  );

  // Chart options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 30,
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.2)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.8)",
            font: {
              size: 11,
              weight: "500",
            },
            stepSize: 1,
          },
          beginAtZero: true,
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.8)",
            font: {
              size: 11,
              weight: "500",
            },
            padding: 10,
            maxRotation: 0,
            callback: function (value) {
              const label = this.getLabelForValue(value);
              return label.length > 15 ? label.substring(0, 15) + "..." : label;
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "rgba(255, 255, 255, 1)",
          bodyColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "rgba(139, 92, 246, 0.5)",
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            title: function (context) {
              return context[0].label;
            },
            label: function (context) {
              return `${context.parsed.x} kali gangguan`;
            },
          },
        },
        datalabels: {
          display: function (context) {
            return context.parsed && context.parsed.x && context.parsed.x > 0;
          },
          anchor: "end",
          align: "right",
          offset: 4,
          formatter: (value) => {
            return value && value > 0 ? `${value}x` : "";
          },
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            size: 10,
            weight: "bold",
          },
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: 4,
          padding: {
            top: 2,
            bottom: 2,
            left: 4,
            right: 4,
          },
        },
      },
      animation: {
        duration: 2000,
        easing: "easeInOutQuart",
      },
    }),
    []
  );

  // Error UI
  if (error) {
    return (
      <Card className="bg-red-500/10 backdrop-blur-lg border border-red-500/20">
        <CardContent className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Memuat Top 10
          </h3>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Coba Lagi</span>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/25">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white/90 text-lg font-semibold">
                Top 10 Penyulang Bermasalah
              </CardTitle>
              <p className="text-white/60 text-sm">
                {startDate && endDate ? (
                  <>
                    Periode {format(startDate, "dd MMM")} -{" "}
                    {format(endDate, "dd MMM yyyy")}
                  </>
                ) : (
                  "Semua data"
                )}{" "}
                {userUnit && `- ${userUnit}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {loading && (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            <button
              onClick={refresh}
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

        {/* Summary Stats menggunakan data dari hook */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-amber-300">
              {loading ? "..." : totalPenyulang}
            </div>
            <div className="text-xs text-white/70">Penyulang</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-purple-300">
              {loading ? "..." : totalGangguan.toLocaleString()}
            </div>
            <div className="text-xs text-white/70">Total Gangguan</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-orange-300">
              {loading ? "..." : avgGangguan}
            </div>
            <div className="text-xs text-white/70">Rata-rata</div>
          </div>
        </div>

        {/* Top Performer Alert */}
        {!loading && topPenyulang && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-300" />
              <div>
                <p className="text-red-200 font-medium text-sm">
                  Penyulang Terbermasalah:{" "}
                  <span className="font-bold">{topPenyulang[0]}</span>
                </p>
                <p className="text-red-300 text-xs">
                  {topPenyulang[1]} kali gangguan dalam periode ini
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/60">Memuat data ranking...</p>
              </div>
            </div>
          ) : gangguanTerbanyak.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Tidak ada data gangguan</p>
                <p className="text-white/40 text-sm">
                  pada periode yang dipilih
                </p>
              </div>
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>

        {/* Additional Info */}
        {!loading && gangguanTerbanyak.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-white/70 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-300 rounded"></div>
                <span>Intensitas warna menunjukkan ranking gangguan</span>
              </div>
              <div className="text-xs">
                Diperbarui:{" "}
                {lastFetch
                  ? lastFetch.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Belum ada data"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

Top10GangguanWithHook.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};

// Export dengan error boundary
export default withErrorBoundary(Top10GangguanWithHook);
