import { useEffect, useState, useMemo } from "react";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  where,
} from "firebase/firestore";
import Layouts from "../admin/Layouts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const DashboardPengukuran = () => {
  // State untuk filter tanggal
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(new Date());

  // State untuk pemilihan tahun pada tabel rekapitulasi
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  // State untuk data
  const [pengukuranList, setPengukuranList] = useState([]);
  const [garduData, setGarduData] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);

  // State untuk KPI
  const [highestLoadGardu, setHighestLoadGardu] = useState(null);
  const [highestUnbalance, setHighestUnbalance] = useState(null);
  const [highestKvaPercentage, setHighestKvaPercentage] = useState(null);

  // State untuk data chart
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [heatMapData, setHeatMapData] = useState([]);

  // Nama bulan dalam bahasa Indonesia untuk tabel
  const bulanIndonesia = useMemo(
    () => [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ],
    []
  );

  // Ambil data gardu dari Firestore
  useEffect(() => {
    const fetchGarduData = async () => {
      const querySnapshot = await getDocs(collection(db, "gardu"));
      const garduMap = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        garduMap[data.nama] = { alamat: data.alamat, kva: data.kva };
      });
      setGarduData(garduMap);
    };

    fetchGarduData();
  }, []);

  // Ambil semua data pengukuran untuk mendapatkan tahun-tahun yang tersedia
  useEffect(() => {
    const fetchAllYears = async () => {
      const querySnapshot = await getDocs(collection(db, "Pengukuran"));
      const years = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tanggalUkur) {
          const year = data.tanggalUkur.split("-")[0];
          if (year) years.add(parseInt(year));
        }
      });

      const yearsArray = Array.from(years).sort((a, b) => b - a); // Urutkan tahun dari terbaru
      setAvailableYears(yearsArray);

      // Jika tidak ada tahun yang tersedia, tambahkan tahun sekarang
      if (yearsArray.length === 0) {
        setAvailableYears([new Date().getFullYear()]);
      }
    };

    fetchAllYears();
  }, []);

  // Ambil data pengukuran dari Firestore
  useEffect(() => {
    const q = query(
      collection(db, "Pengukuran"),
      where("tanggalUkur", ">=", format(startDate, "yyyy-MM-dd")),
      where("tanggalUkur", "<=", format(endDate, "yyyy-MM-dd"))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setPengukuranList([]);
        setBarChartData([]);
        setLineChartData([]);
        setHeatMapData([]);
        setHighestLoadGardu(null);
        setHighestUnbalance(null);
        setHighestKvaPercentage(null);
        return;
      }

      const data = snapshot.docs.map((doc) => {
        const pengukuran = doc.data();
        const gardu = garduData[pengukuran.nama] || {};
        return {
          id: doc.id,
          ...pengukuran,
          alamat: gardu.alamat || "Tidak Diketahui",
          kva: gardu.kva || "Tidak Diketahui",
        };
      });
      setPengukuranList(data);
      processData(data);
    });

    return () => unsubscribe();
  }, [garduData, startDate, endDate]);

  // Ambil data untuk rekapitulasi bulanan berdasarkan tahun yang dipilih
  useEffect(() => {
    const fetchMonthlyData = async () => {
      // Buat tanggal awal tahun dan akhir tahun
      const startOfYear = `${selectedYear}-01-01`;
      const endOfYear = `${selectedYear}-12-31`;

      const q = query(
        collection(db, "Pengukuran"),
        where("tanggalUkur", ">=", startOfYear),
        where("tanggalUkur", "<=", endOfYear)
      );

      const querySnapshot = await getDocs(q);

      // Inisialisasi array untuk menyimpan jumlah pengukuran per bulan
      // Index 0 = Januari, 11 = Desember
      const monthCounts = Array(12).fill(0);
      const monthlyAvgBeban = Array(12).fill(0);
      const monthlyAvgUnbalance = Array(12).fill(0);
      const monthlyTotalCounters = Array(12).fill(0);

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.tanggalUkur) {
          const dateParts = data.tanggalUkur.split("-");

          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Konversi ke index 0-11

            if (year === selectedYear && month >= 0 && month < 12) {
              // Tambahkan ke counter
              monthCounts[month]++;

              // Tambahkan nilai untuk menghitung rata-rata
              if (data.bebanKva) {
                monthlyAvgBeban[month] += parseFloat(data.bebanKva) || 0;
                monthlyTotalCounters[month]++;
              }

              if (data.unbalance) {
                monthlyAvgUnbalance[month] += parseFloat(data.unbalance) || 0;
              }
            }
          }
        }
      });

      // Hitung rata-rata
      const monthlyStats = bulanIndonesia.map((bulan, index) => {
        const count = monthCounts[index];
        const avgBeban =
          count > 0
            ? (monthlyAvgBeban[index] / monthlyTotalCounters[index]).toFixed(2)
            : 0;
        const avgUnbalance =
          count > 0 ? (monthlyAvgUnbalance[index] / count).toFixed(2) : 0;

        return {
          bulan,
          jumlah: count,
          avgBeban,
          avgUnbalance,
        };
      });

      setMonthlyData(monthlyStats);
    };

    fetchMonthlyData();
  }, [selectedYear, bulanIndonesia]);

  // Proses data untuk visualisasi dan KPI
  const processData = (data) => {
    if (!data || data.length === 0) return;

    // Temukan gardu dengan beban tertinggi
    const sortedByLoad = [...data].sort(
      (a, b) => (parseFloat(b.bebanKva) || 0) - (parseFloat(a.bebanKva) || 0)
    );
    setHighestLoadGardu(sortedByLoad[0] || null);

    // Temukan gardu dengan unbalance tertinggi
    const sortedByUnbalance = [...data].sort(
      (a, b) => (parseFloat(b.unbalance) || 0) - (parseFloat(a.unbalance) || 0)
    );
    setHighestUnbalance(sortedByUnbalance[0] || null);

    // Temukan gardu dengan persentase KVA tertinggi
    const sortedByKvaPercentage = [...data].sort(
      (a, b) => (parseFloat(b.persenKva) || 0) - (parseFloat(a.persenKva) || 0)
    );
    setHighestKvaPercentage(sortedByKvaPercentage[0] || null);

    // Siapkan data untuk bar chart - top 10
    const barData = sortedByLoad.slice(0, 10).map((item) => ({
      name: item.nama || "Tidak Diketahui",
      beban: parseFloat(item.bebanKva) || 0,
    }));
    setBarChartData(barData);

    // Siapkan data untuk line chart - trend berdasarkan waktu
    // Kelompokkan berdasarkan tanggal dan hitung rata-rata beban
    const groupedByDate = {};
    data.forEach((item) => {
      const date = item.tanggalUkur || "";
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          totalBeban: 0,
          count: 0,
        };
      }
      groupedByDate[date].totalBeban += parseFloat(item.bebanKva) || 0;
      groupedByDate[date].count += 1;
    });

    const lineData = Object.keys(groupedByDate)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        tanggal: date,
        bebanRataRata:
          groupedByDate[date].totalBeban / groupedByDate[date].count,
      }));

    setLineChartData(lineData);

    // Siapkan data untuk heat map
    // Menggunakan fase (R, S, T) dan nama gardu untuk membuat matrix
    const heatData = data.slice(0, 15).map((item) => ({
      name: item.nama || "Tidak Diketahui",
      R: parseFloat(item.R) || 0,
      S: parseFloat(item.S) || 0,
      T: parseFloat(item.T) || 0,
    }));
    setHeatMapData(heatData);
  };

  // Fungsi untuk mendapatkan warna heat map
  const getHeatMapColor = (value, max = 200) => {
    // Normalisasi nilai antara 0 dan 1
    const normalizedValue = Math.min(Math.max(value / max, 0), 1);

    // Hitung warna berdasarkan gradien dari hijau (rendah) ke kuning (sedang) ke merah (tinggi)
    if (normalizedValue < 0.5) {
      // Gradien Hijau ke Kuning untuk nilai rendah
      const r = Math.floor(normalizedValue * 2 * 255);
      const g = 255;
      return `rgba(${r}, ${g}, 0, 0.7)`;
    } else {
      // Gradien Kuning ke Merah untuk nilai tinggi
      const g = Math.floor((1 - (normalizedValue - 0.5) * 2) * 255);
      const r = 255;
      return `rgba(${r}, ${g}, 0, 0.7)`;
    }
  };

  return (
    <Layouts>
      <div className="container mx-auto p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Dashboard Pengukuran</h2>
          <div className="flex gap-2 justify-items-center justify-end px-6">
            <label>Start Date: </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="bg-transparent border border-main rounded-md px-2 text-black"
              dateFormat={"dd/MM/yyyy"}
            />
            <label>End Date: </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="bg-transparent border border-main rounded-md px-2 text-black"
              dateFormat={"dd/MM/yyyy"}
            />
          </div>
        </div>
        {/* Tabel Rekapitulasi Bulanan */}
        <Card className="mb-6 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg">
                Rekapitulasi Pengukuran Bulanan
              </CardTitle>
              <div className="flex items-center">
                <label htmlFor="yearSelect" className="mr-2">
                  Tahun:
                </label>
                <select
                  id="yearSelect"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent border border-main rounded-md px-2 py-1 text-black"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-transparent border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Bulan</th>
                    <th className="px-4 py-2 border">Jumlah Pengukuran</th>
                    <th className="px-4 py-2 border">Rata-rata Beban (KVA)</th>
                    <th className="px-4 py-2 border">
                      Rata-rata Unbalance (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="px-4 py-2 border font-medium">
                        {item.bulan}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {item.jumlah}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {item.avgBeban}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {item.avgUnbalance}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td className="px-4 py-2 border">Total</td>
                    <td className="px-4 py-2 border text-center">
                      {monthlyData.reduce((sum, item) => sum + item.jumlah, 0)}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {(
                        monthlyData.reduce((sum, item) => {
                          return (
                            sum +
                            (item.jumlah > 0 ? parseFloat(item.avgBeban) : 0)
                          );
                        }, 0) /
                          monthlyData.filter((item) => item.jumlah > 0)
                            .length || 0
                      ).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {(
                        monthlyData.reduce((sum, item) => {
                          return (
                            sum +
                            (item.jumlah > 0
                              ? parseFloat(item.avgUnbalance)
                              : 0)
                          );
                        }, 0) /
                          monthlyData.filter((item) => item.jumlah > 0)
                            .length || 0
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Highest Load Gardu */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <CardTitle className="text-lg mb-2">Beban Tertinggi</CardTitle>
              <div className="text-3xl font-bold text-red-600">
                {highestLoadGardu
                  ? parseFloat(highestLoadGardu.bebanKva || 0).toFixed(2)
                  : "0"}{" "}
                KVA
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Gardu: {highestLoadGardu?.nama || "Tidak ada data"}
              </div>
            </CardContent>
          </Card>

          {/* Highest Unbalance */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <CardTitle className="text-lg mb-2">
                Unbalance Tertinggi
              </CardTitle>
              <div className="text-3xl font-bold text-orange-600">
                {highestUnbalance
                  ? parseFloat(highestUnbalance.unbalance || 0).toFixed(2)
                  : "0"}
                %
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Gardu: {highestUnbalance?.nama || "Tidak ada data"}
              </div>
            </CardContent>
          </Card>

          {/* Highest KVA Percentage */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <CardTitle className="text-lg mb-2">
                Persentase KVA Tertinggi
              </CardTitle>
              <div className="text-3xl font-bold text-blue-600">
                {highestKvaPercentage
                  ? parseFloat(highestKvaPercentage.persenKva || 0).toFixed(2)
                  : "0"}
                %
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Gardu: {highestKvaPercentage?.nama || "Tidak ada data"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <CardTitle className="text-lg mb-4">
                Beban per Gardu (Top 10)
              </CardTitle>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis
                      label={{
                        value: "Beban KVA",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${value.toFixed(2)} KVA`,
                        "Beban",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="beban" fill="#8884d8" name="Beban KVA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <CardTitle className="text-lg mb-4">
                Trend Beban Rata-rata
              </CardTitle>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="tanggal"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis
                      label={{
                        value: "Beban KVA Rata-rata",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${value.toFixed(2)} KVA`,
                        "Beban Rata-rata",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bebanRataRata"
                      stroke="#82ca9d"
                      name="Beban Rata-rata"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heat Map Section */}
        <Card className="mb-6 shadow-md">
          <CardContent className="pt-6">
            <CardTitle className="text-lg mb-4">
              Distribusi Beban per Fase (Heat Map)
            </CardTitle>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-transparent border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Nama Gardu</th>
                    <th className="px-4 py-2 border">Fase R</th>
                    <th className="px-4 py-2 border">Fase S</th>
                    <th className="px-4 py-2 border">Fase T</th>
                  </tr>
                </thead>
                <tbody>
                  {heatMapData.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td className="px-4 py-2 border font-medium">
                        {item.name}
                      </td>
                      <td
                        className="px-4 py-2 border"
                        style={{
                          backgroundColor: getHeatMapColor(item.R),
                          color: item.R > 120 ? "white" : "black",
                        }}
                      >
                        {item.R.toFixed(1)}
                      </td>
                      <td
                        className="px-4 py-2 border"
                        style={{
                          backgroundColor: getHeatMapColor(item.S),
                          color: item.S > 120 ? "white" : "black",
                        }}
                      >
                        {item.S.toFixed(1)}
                      </td>
                      <td
                        className="px-4 py-2 border"
                        style={{
                          backgroundColor: getHeatMapColor(item.T),
                          color: item.T > 120 ? "white" : "black",
                        }}
                      >
                        {item.T.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Panel */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <CardTitle className="text-lg mb-4">Ringkasan Pengukuran</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <div className="text-gray-500 mb-1">Total Gardu</div>
                <div className="text-xl font-bold">{pengukuranList.length}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <div className="text-gray-500 mb-1">Rata-rata Beban KVA</div>
                <div className="text-xl font-bold">
                  {pengukuranList.length > 0
                    ? (
                        pengukuranList.reduce(
                          (sum, item) => sum + (parseFloat(item.bebanKva) || 0),
                          0
                        ) / pengukuranList.length
                      ).toFixed(2)
                    : "0"}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <div className="text-gray-500 mb-1">Rata-rata Persen KVA</div>
                <div className="text-xl font-bold">
                  {pengukuranList.length > 0
                    ? (
                        pengukuranList.reduce(
                          (sum, item) =>
                            sum + (parseFloat(item.persenKva) || 0),
                          0
                        ) / pengukuranList.length
                      ).toFixed(2)
                    : "0"}
                  %
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <div className="text-gray-500 mb-1">Rata-rata Unbalance</div>
                <div className="text-xl font-bold">
                  {pengukuranList.length > 0
                    ? (
                        pengukuranList.reduce(
                          (sum, item) =>
                            sum + (parseFloat(item.unbalance) || 0),
                          0
                        ) / pengukuranList.length
                      ).toFixed(2)
                    : "0"}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layouts>
  );
};

export default DashboardPengukuran;
