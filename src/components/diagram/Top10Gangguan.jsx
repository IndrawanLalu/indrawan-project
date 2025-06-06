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
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Zap, BarChart3, RefreshCw, AlertTriangle } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Top10gangguan = ({ startDate, endDate }) => {
  const [gangguanTerbanyak, setGangguanTerbanyak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "gangguanPenyulang"),
        where("tanggalGangguan", ">=", format(startDate, "yyyy-MM-dd")),
        where("tanggalGangguan", "<=", format(endDate, "yyyy-MM-dd"))
      );
      const querySnapshot = await getDocs(q);
      const dataGangguan = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Hitung frekuensi gangguan berdasarkan penyulang
      const gangguanCounts = {};
      dataGangguan.forEach((item) => {
        const penyulang = item.penyulang;
        if (gangguanCounts[penyulang]) {
          gangguanCounts[penyulang] += 1;
        } else {
          gangguanCounts[penyulang] = 1;
        }
      });

      // Ubah object menjadi array, urutkan berdasarkan frekuensi, dan ambil top 10
      const sortedGangguan = Object.entries(gangguanCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Take top 10

      setGangguanTerbanyak(sortedGangguan);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      setError("Gagal memuat data top 10. Silakan coba lagi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Calculate stats
  const totalGangguan = gangguanTerbanyak.reduce(
    (sum, [, count]) => sum + count,
    0
  );
  const avgGangguan =
    gangguanTerbanyak.length > 0
      ? (totalGangguan / gangguanTerbanyak.length).toFixed(1)
      : 0;
  const topPenyulang =
    gangguanTerbanyak.length > 0 ? gangguanTerbanyak[0] : null;

  // Generate gradient colors for bars
  const generateGradientColors = (count) => {
    const colors = [];
    const backgroundColors = [];

    for (let i = 0; i < count; i++) {
      const intensity = 1 - (i / count) * 0.7; // Fade from full to 30% intensity
      colors.push(`rgba(139, 92, 246, ${intensity})`); // Purple gradient
      backgroundColors.push(`rgba(139, 92, 246, ${intensity * 0.8})`);
    }

    return { colors, backgroundColors };
  };

  const { colors, backgroundColors } = generateGradientColors(
    gangguanTerbanyak.length
  );

  const data = {
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
  };

  const options = {
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
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: false, // We'll use custom title
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "rgba(255, 255, 255, 1)",
        bodyColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
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
  };

  if (error) {
    return (
      <Card className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 hover:bg-red-500/15 transition-all duration-300">
        <CardContent className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Memuat Top 10
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
                Periode {format(startDate, "dd MMM")} -{" "}
                {format(endDate, "dd MMM yyyy")}
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
              title="Refresh data"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-amber-300">
              {loading ? "..." : gangguanTerbanyak.length}
            </div>
            <div className="text-xs text-white/70">Penyulang</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-purple-300">
              {loading ? "..." : totalGangguan}
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
            <Bar data={data} options={options} />
          )}
        </div>

        {/* Legend */}
        {!loading && gangguanTerbanyak.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-white/70 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-300 rounded"></div>
                <span>Intensitas warna menunjukkan ranking gangguan</span>
              </div>
              <div className="text-xs">
                Diperbarui:{" "}
                {new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

Top10gangguan.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};

export default Top10gangguan;
