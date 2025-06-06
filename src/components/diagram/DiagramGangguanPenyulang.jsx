import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
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
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, BarChart3, RefreshCw } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const DiagramGangguanPenyulang = ({ startDate, endDate }) => {
  const [gangguanTahunLalu, setGangguanTahunLalu] = useState([]);
  const [gangguannTahunIni, setGangguanTahunIni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from Firebase
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(collection(db, "gangguanPenyulang"));
      const querySnapshot = await getDocs(q);
      const dataGangguan = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const tahunIni = new Date().getFullYear();
      const tahunLalu = tahunIni - 1;

      // Inisialisasi array dengan 12 bulan
      const gangguanTahunIni = Array(12).fill(0);
      const gangguanTahunLalu = Array(12).fill(0);

      dataGangguan.forEach((item) => {
        const tanggal = new Date(item.tanggalGangguan);
        const bulan = tanggal.getMonth();
        const tahun = tanggal.getFullYear();

        if (tahun === tahunIni) {
          gangguanTahunIni[bulan] += 1;
        } else if (tahun === tahunLalu) {
          gangguanTahunLalu[bulan] += 1;
        }
      });

      setGangguanTahunIni(gangguanTahunIni);
      setGangguanTahunLalu(gangguanTahunLalu);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      setError("Gagal memuat data chart. Silakan coba lagi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const totalTahunIni = gangguannTahunIni.reduce((sum, val) => sum + val, 0);
  const totalTahunLalu = gangguanTahunLalu.reduce((sum, val) => sum + val, 0);
  const persentasePerubahan =
    totalTahunLalu > 0
      ? (((totalTahunIni - totalTahunLalu) / totalTahunLalu) * 100).toFixed(1)
      : 0;

  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
    datasets: [
      {
        label: `Tahun Ini (${new Date().getFullYear()})`,
        data: gangguannTahunIni,
        borderColor: "rgba(139, 92, 246, 1)", // Purple
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
        pointBorderColor: "rgba(255, 255, 255, 0.8)",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "rgba(139, 92, 246, 1)",
        pointHoverBorderColor: "rgba(255, 255, 255, 1)",
        pointHoverBorderWidth: 3,
      },
      {
        label: `Tahun Lalu (${new Date().getFullYear() - 1})`,
        data: gangguanTahunLalu,
        borderColor: "rgba(16, 185, 129, 1)", // Emerald
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "rgba(255, 255, 255, 0.8)",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "rgba(16, 185, 129, 1)",
        pointHoverBorderColor: "rgba(255, 255, 255, 1)",
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 10,
        right: 10,
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
            size: 12,
            weight: "500",
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 12,
            weight: "500",
          },
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            size: 13,
            weight: "600",
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      title: {
        display: false, // We'll use custom title in Card header
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
            return `Bulan ${context[0].label}`;
          },
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y} gangguan`;
          },
        },
      },
      datalabels: {
        display: function (context) {
          // Safe check for parsed data and only show labels for non-zero values
          return context.parsed && context.parsed.y && context.parsed.y > 0;
        },
        anchor: "end",
        align: "top",
        offset: 4,
        formatter: (value) => {
          // Safe check for value
          return value && value > 0 ? value : "";
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
    interaction: {
      intersect: false,
      mode: "index",
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
    <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/25">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white/90 text-lg font-semibold">
                Gangguan Penyulang
              </CardTitle>
              <p className="text-white/60 text-sm">
                Trend bulanan tahun ini vs tahun lalu
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
            <div className="text-2xl font-bold text-purple-300">
              {loading ? "..." : totalTahunIni}
            </div>
            <div className="text-xs text-white/70">Total Tahun Ini</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-emerald-300">
              {loading ? "..." : totalTahunLalu}
            </div>
            <div className="text-xs text-white/70">Total Tahun Lalu</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div
              className={`text-2xl font-bold ${
                persentasePerubahan > 0
                  ? "text-red-300"
                  : persentasePerubahan < 0
                  ? "text-emerald-300"
                  : "text-white/70"
              }`}
            >
              {loading
                ? "..."
                : `${
                    persentasePerubahan > 0 ? "+" : ""
                  }${persentasePerubahan}%`}
            </div>
            <div className="text-xs text-white/70">Perubahan</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/60">Memuat data chart...</p>
              </div>
            </div>
          ) : (
            <Line data={data} options={options} />
          )}
        </div>

        {/* Additional Info */}
        {!loading && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center space-x-2 text-white/70 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                Data diperbarui:{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

DiagramGangguanPenyulang.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};

export default DiagramGangguanPenyulang;
