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
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, BarChart3, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import { fetchSheetData } from "@/utils/googleSheetsData";

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

const DiagramGangguanPenyulang = () => {
  const userLogin = useSelector((state) => state.auth.user);
  const userUnit = userLogin ? userLogin.unit : null;

  const [gangguanTahunLalu, setGangguanTahunLalu] = useState(Array(12).fill(0));
  const [gangguanTahunIni, setGangguanTahunIni] = useState(Array(12).fill(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  // const [debugInfo, setDebugInfo] = useState(null);

  // Memoized constants
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

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const previousYear = useMemo(() => currentYear - 1, [currentYear]);

  // Fungsi parsing tanggal yang robust dengan logging
  const parseDate = useCallback(
    (dateString) => {
      if (!dateString) return null;

      // Convert to string and trim
      const dateStr = dateString.toString().trim();
      if (!dateStr) return null;

      const parts = dateStr.split(" ");
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

  // Fungsi untuk memfilter dan memproses data dengan logging detail
  const processGangguanData = useCallback(
    (rawData) => {
      console.log("=== PROCESSING DATA ===");
      console.log("Raw data length:", rawData.length);

      if (!Array.isArray(rawData)) {
        console.warn("Raw data is not an array");
        return {
          gangguanTahunIni: Array(12).fill(0),
          gangguanTahunLalu: Array(12).fill(0),
          debugInfo: { error: "Data tidak valid" },
        };
      }

      // Check if first row is header
      const firstRow = rawData[0];
      const isFirstRowHeader =
        firstRow &&
        typeof firstRow.ulp === "string" &&
        (firstRow.ulp.toLowerCase().includes("ulp") ||
          firstRow.ulp.toLowerCase().includes("unit"));

      const dataRows = isFirstRowHeader ? rawData.slice(1) : rawData;
      console.log("Data rows (excluding potential header):", dataRows.length);

      // Initialize counters
      const gangguanTahunIni = Array(12).fill(0);
      const gangguanTahunLalu = Array(12).fill(0);

      let processedCount = 0;
      let unitMatchCount = 0;
      let validDateCount = 0;
      let thisYearCount = 0;
      let lastYearCount = 0;
      const invalidDates = [];
      const validData = [];

      dataRows.forEach((item, index) => {
        if (!item || typeof item !== "object") return;

        processedCount++;

        // Filter berdasarkan unit jika userUnit tersedia
        let isUnitMatch = true;
        if (userUnit && item.ulp) {
          const itemUnit = item.ulp.toString().trim().toUpperCase();
          const targetUnit = userUnit.toString().trim().toUpperCase();
          isUnitMatch = itemUnit === targetUnit;

          if (isUnitMatch) {
            unitMatchCount++;
          }
        } else if (userUnit) {
          isUnitMatch = false; // Skip jika userUnit ada tapi item.ulp tidak ada
        } else {
          unitMatchCount++; // Count semua jika tidak ada filter unit
        }

        if (!isUnitMatch) return;

        // Parse tanggal
        const itemDate = parseDate(item.tanggal);
        if (!itemDate) {
          invalidDates.push({ index, tanggal: item.tanggal, ulp: item.ulp });
          return;
        }

        validDateCount++;
        const bulan = itemDate.getMonth();
        const tahun = itemDate.getFullYear();

        // Kategorikan berdasarkan tahun
        if (tahun === currentYear) {
          gangguanTahunIni[bulan] += 1;
          thisYearCount++;
          validData.push({
            ...item,
            parsedDate: itemDate,
            kategori: "tahun_ini",
          });
        } else if (tahun === previousYear) {
          gangguanTahunLalu[bulan] += 1;
          lastYearCount++;
          validData.push({
            ...item,
            parsedDate: itemDate,
            kategori: "tahun_lalu",
          });
        }
      });

      const debugInfo = {
        totalRawData: rawData.length,
        processedRows: processedCount,
        isFirstRowHeader,
        dataRowsCount: dataRows.length,
        unitMatchCount,
        validDateCount,
        thisYearCount,
        lastYearCount,
        invalidDatesCount: invalidDates.length,
        userUnit,
        currentYear,
        previousYear,
        invalidDates: invalidDates.slice(0, 5), // Show first 5 invalid dates
        sampleValidData: validData.slice(0, 3), // Show sample valid data
      };

      console.log("Debug Info:", debugInfo);
      console.log("Gangguan tahun ini per bulan:", gangguanTahunIni);
      console.log("Total tahun ini:", thisYearCount);

      return { gangguanTahunIni, gangguanTahunLalu, debugInfo };
    },
    [userUnit, parseDate, currentYear, previousYear]
  );

  // Fetch data dari Google Sheets
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching data from Google Sheets...");
      const allGangguanData = await fetchSheetData("gangguanPenyulang", "A:S");

      if (!Array.isArray(allGangguanData)) {
        throw new Error("Data yang diterima tidak valid");
      }

      const { gangguanTahunIni, gangguanTahunLalu } =
        processGangguanData(allGangguanData);

      setGangguanTahunIni(gangguanTahunIni);
      setGangguanTahunLalu(gangguanTahunLalu);
      // setDebugInfo(debugInfo);
      setLastFetch(new Date());
    } catch (error) {
      console.error("Error fetching data from Google Sheets:", error);
      setError(`Gagal memuat data chart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [processGangguanData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed values
  const totalTahunIni = useMemo(
    () => gangguanTahunIni.reduce((sum, val) => sum + val, 0),
    [gangguanTahunIni]
  );

  const totalTahunLalu = useMemo(
    () => gangguanTahunLalu.reduce((sum, val) => sum + val, 0),
    [gangguanTahunLalu]
  );

  const persentasePerubahan = useMemo(() => {
    if (totalTahunLalu === 0) return totalTahunIni > 0 ? 100 : 0;
    return ((totalTahunIni - totalTahunLalu) / totalTahunLalu) * 100;
  }, [totalTahunIni, totalTahunLalu]);

  // Chart data
  const chartData = useMemo(
    () => ({
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
          label: `Tahun Ini (${currentYear})`,
          data: gangguanTahunIni,
          borderColor: "rgba(139, 92, 246, 1)",
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
          label: `Tahun Lalu (${previousYear})`,
          data: gangguanTahunLalu,
          borderColor: "rgba(16, 185, 129, 1)",
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
    }),
    [currentYear, previousYear, gangguanTahunIni, gangguanTahunLalu]
  );

  // Chart options
  const chartOptions = useMemo(
    () => ({
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
            stepSize: 1,
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
            return context.parsed && context.parsed.y && context.parsed.y > 0;
          },
          anchor: "end",
          align: "top",
          offset: 4,
          formatter: (value) => {
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
    }),
    []
  );

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Error UI
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
            onClick={refreshData}
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
                Trend bulanan tahun ini vs tahun lalu{" "}
                {userUnit && `- ${userUnit}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {loading && (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            <button
              onClick={refreshData}
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
              {loading ? "..." : totalTahunIni.toLocaleString()}
            </div>
            <div className="text-xs text-white/70">Total Tahun Ini</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-emerald-300">
              {loading ? "..." : totalTahunLalu.toLocaleString()}
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
                  }${persentasePerubahan.toFixed(1)}%`}
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
            <Line data={chartData} options={chartOptions} />
          )}
        </div>

        {/* Additional Info */}
        {!loading && (
          <div className="mt-4 space-y-2">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-white/70 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Data diperbarui:{" "}
                    {lastFetch
                      ? lastFetch.toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Belum ada data"}
                  </span>
                </div>
                {userUnit && (
                  <span className="text-xs bg-white/10 px-2 py-1 rounded">
                    Unit: {userUnit}
                  </span>
                )}
              </div>
            </div>

            {/* Debug Info (hanya tampil di development) */}
            {/* {debugInfo && process.env.NODE_ENV === "development" && (
              <details className="p-3 rounded-lg bg-white/5 border border-white/10">
                <summary className="text-white/70 text-sm cursor-pointer flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span>Debug Info (Development Only)</span>
                </summary>
                <div className="mt-2 text-xs text-white/60 space-y-1">
                  <div>Total data spreadsheet: {debugInfo.totalRawData}</div>
                  <div>Data rows processed: {debugInfo.processedRows}</div>
                  <div>Unit matches: {debugInfo.unitMatchCount}</div>
                  <div>Valid dates: {debugInfo.validDateCount}</div>
                  <div>Tahun ini: {debugInfo.thisYearCount}</div>
                  <div>Tahun lalu: {debugInfo.lastYearCount}</div>
                  <div>Invalid dates: {debugInfo.invalidDatesCount}</div>
                  {debugInfo.invalidDates.length > 0 && (
                    <div className="mt-2">
                      <div>Sample invalid dates:</div>
                      {debugInfo.invalidDates.map((item, idx) => (
                        <div key={idx} className="ml-2">
                          Row {item.index}: "{item.tanggal}" (ULP: {item.ulp})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            )} */}
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
