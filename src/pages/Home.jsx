import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { IoIosWarning } from "react-icons/io";
import {
  FaTachometerAlt,
  FaBolt,
  // FaCalendarCheck,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import SidebarLayout from "@/components/admin/SidebarLayout";

// Daftar layanan/menu yang diizinkan untuk yantek
const allowedServicesForYantek = ["/pengukuran-form", "/", "/preventive"];

const Home = () => {
  const user = useSelector((state) => state.auth.user);
  // Ambil petugas dari Redux dengan fallback ke localStorage
  const selectedPetugas = useSelector(
    (state) => state.petugas?.selectedPetugas || []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    garduHariIni: 0,
    garduBulanIni: 0,
    gangguanHariIni: 0,
    gangguanBulanIni: 0,
    temuanHariIni: 0,
    totalGardu: 0, // Total gardu keseluruhan
    garduBebanTinggi: 0, // Gardu dengan beban > 80%
    garduBebanRendah: 0, // Gardu dengan beban < 20%
    garduUnbalance: 0, // Gardu dengan unbalance > 20%
    gangguanBulanIniList: [], // List gangguan bulan ini per penyulang
    gangguanTahunanList: [], // List gangguan 1 tahun per penyulang
  });

  // Mendapatkan tanggal hari ini dan bulan ini dalam format string
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getMonthString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  };

  // Fungsi untuk mengambil data dashboard dasar
  const fetchDashboardData = async () => {
    try {
      const db = getFirestore();
      const todayString = getTodayString();
      const monthString = getMonthString();

      // Get gardu measurements for today
      const garduTodayQuery = query(
        collection(db, "Pengukuran"),
        where("tanggalUkur", "==", todayString)
      );

      // Get gardu measurements for this month
      const garduMonthQuery = query(
        collection(db, "Pengukuran"),
        where("tanggalUkur", ">=", `${monthString}-01`),
        where("tanggalUkur", "<=", `${monthString}-31`)
      );

      // Get disruptions for today
      const gangguanTodayQuery = query(
        collection(db, "gangguanPenyulang"),
        where("tanggalGangguan", "==", todayString)
      );

      // Get disruptions for this month
      const gangguanMonthQuery = query(
        collection(db, "gangguanPenyulang"),
        where("tanggalGangguan", ">=", `${monthString}-01`),
        where("tanggalGangguan", "<=", `${monthString}-31`)
      );

      // Get findings for today
      const temuanTodayQuery = query(
        collection(db, "temuanInspeksi"),
        where("tanggalUkur", "==", todayString)
      );

      // Execute all queries
      const [
        garduTodaySnapshot,
        garduMonthSnapshot,
        gangguanTodaySnapshot,
        gangguanMonthSnapshot,
        temuanTodaySnapshot,
      ] = await Promise.all([
        getDocs(garduTodayQuery),
        getDocs(garduMonthQuery),
        getDocs(gangguanTodayQuery),
        getDocs(gangguanMonthQuery),
        getDocs(temuanTodayQuery),
      ]);

      // Mengelompokkan gangguan bulan ini berdasarkan nama penyulang
      const gangguanBulanIniByPenyulang = {};

      gangguanMonthSnapshot.forEach((doc) => {
        const data = doc.data();
        const namaPenyulang =
          data.penyulang || data.penyulang || "Tidak diketahui";

        if (!gangguanBulanIniByPenyulang[namaPenyulang]) {
          gangguanBulanIniByPenyulang[namaPenyulang] = 0;
        }

        gangguanBulanIniByPenyulang[namaPenyulang]++;
      });

      // Mengubah ke format array dan mengurutkan berdasarkan jumlah gangguan
      const gangguanBulanIniList = Object.entries(gangguanBulanIniByPenyulang)
        .map(([nama, jumlah]) => ({
          nama,
          jumlah,
        }))
        .sort((a, b) => b.jumlah - a.jumlah);

      // Set dashboard data
      setDashboardData((prevData) => ({
        ...prevData,
        garduHariIni: garduTodaySnapshot.size,
        garduBulanIni: garduMonthSnapshot.size,
        gangguanHariIni: gangguanTodaySnapshot.size,
        gangguanBulanIni: gangguanMonthSnapshot.size,
        gangguanBulanIniList: gangguanBulanIniList,
        temuanHariIni: temuanTodaySnapshot.size,
      }));
    } catch (err) {
      console.error("Error mengambil data dashboard:", err);
      throw err;
    }
  };

  // Fungsi untuk mengambil data kondisi gardu total
  const fetchTotalGardu = async () => {
    try {
      const db = getFirestore();

      // Query untuk mengambil semua data pengukuran
      const pengukuranQuery = query(collection(db, "Pengukuran"));
      const pengukuranSnapshot = await getDocs(pengukuranQuery);

      // Set untuk menyimpan ID gardu unik
      const uniqueGarduIds = new Set();

      // Map untuk menyimpan pengukuran terbaru untuk setiap gardu
      const pengukuranByGardu = {};

      // Memproses semua data pengukuran
      pengukuranSnapshot.forEach((doc) => {
        const data = doc.data();
        const garduId = data.garduId || data.idGardu || doc.id; // Coba beberapa kemungkinan field id gardu

        if (!garduId) return; // Skip jika tidak ada id gardu

        // Tambahkan garduId ke set unik
        uniqueGarduIds.add(garduId);

        // Simpan pengukuran terbaru untuk setiap gardu
        if (
          !pengukuranByGardu[garduId] ||
          new Date(data.tanggalUkur) >
            new Date(pengukuranByGardu[garduId].tanggalUkur)
        ) {
          pengukuranByGardu[garduId] = data;
        }
      });

      // Inisialisasi counter
      let bebanTinggi = 0;
      let bebanRendah = 0;
      let bebanUnbalance = 0;

      // Analisis data pengukuran untuk setiap gardu
      Object.values(pengukuranByGardu).forEach((data) => {
        try {
          // Dapatkan persenKva langsung dari data
          const persenKva = parseFloat(data.persenKva || 0);
          const unbalance = parseFloat(data.unbalance || 0);

          // Hitung beban tinggi (>80%)
          if (persenKva > 80) {
            bebanTinggi++;
          }

          // Hitung beban rendah (<20%)
          if (persenKva < 20) {
            bebanRendah++;
          }
          if (unbalance > 20) {
            bebanUnbalance++;
          }
        } catch (e) {
          console.error("Error processing gardu data:", e);
        }
      });

      // Update state dengan data total gardu dan kondisinya
      setDashboardData((prevData) => ({
        ...prevData,
        totalGardu: uniqueGarduIds.size, // Jumlah total gardu yang pernah diukur
        garduBebanTinggi: bebanTinggi,
        garduBebanRendah: bebanRendah,
        garduUnbalance: bebanUnbalance,
      }));
    } catch (error) {
      console.error("Error mengambil data total gardu:", error);
    }
  };

  // Fungsi untuk mengambil data gangguan penyulang selama 1 tahun terakhir
  const fetchGangguanPenyulangTahunan = async () => {
    try {
      const db = getFirestore();

      // Mendapatkan tanggal 1 tahun yang lalu
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const yearAgoString =
        oneYearAgo.getFullYear() +
        "-" +
        String(oneYearAgo.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(oneYearAgo.getDate()).padStart(2, "0");

      // Query untuk gangguan selama 1 tahun terakhir
      const gangguanTahunanQuery = query(
        collection(db, "gangguanPenyulang"),
        where("tanggalGangguan", ">=", yearAgoString)
      );

      const gangguanSnapshot = await getDocs(gangguanTahunanQuery);

      // Mengelompokkan gangguan berdasarkan nama penyulang
      const gangguanByPenyulang = {};

      gangguanSnapshot.forEach((doc) => {
        const data = doc.data();
        const namaPenyulang =
          data.penyulang || data.penyulang || "Tidak diketahui";

        if (!gangguanByPenyulang[namaPenyulang]) {
          gangguanByPenyulang[namaPenyulang] = 0;
        }

        gangguanByPenyulang[namaPenyulang]++;
      });

      // Mengubah ke format array dan mengurutkan berdasarkan jumlah gangguan
      const gangguanPenyulangList = Object.entries(gangguanByPenyulang)
        .map(([nama, jumlah]) => ({
          nama,
          jumlah,
        }))
        .sort((a, b) => b.jumlah - a.jumlah);

      // Ambil 5 penyulang dengan gangguan terbanyak
      const topGangguanPenyulang = gangguanPenyulangList.slice(0, 5);

      return topGangguanPenyulang;
    } catch (error) {
      console.error("Error mengambil data gangguan penyulang tahunan:", error);
      return [];
    }
  };

  // Fungsi untuk menampilkan status preventife
  const [preventiveHariIni, setPreventiveHariIni] = useState(0);
  const fetchPreventiveHariIni = async () => {
    try {
      const db = getFirestore();
      const todayString = getTodayString();

      // Query untuk mengambil data inspeksi preventive yang diselesaikan hari ini
      const preventiveQuery = query(
        collection(db, "inspeksi"),
        where("category", "==", "Preventive"),
        where("status", "==", "Selesai"),
        where("tglEksekusi", "==", todayString)
      );

      const preventiveSnapshot = await getDocs(preventiveQuery);
      return preventiveSnapshot.size;
    } catch (error) {
      console.error("Error mengambil data preventive:", error);
      return 0;
    }
  };
  // Tambahkan state baru untuk preventive stats
  const [preventiveStats, setPreventiveStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  // Tambahkan fungsi untuk mengambil statistik preventif
  const fetchPreventiveStats = async () => {
    try {
      const db = getFirestore();

      // Query untuk mengambil semua temuan preventif
      const preventiveQuery = query(
        collection(db, "inspeksi"),
        where("category", "==", "Preventive")
      );

      const preventiveSnapshot = await getDocs(preventiveQuery);

      let total = preventiveSnapshot.size;
      let completed = 0;

      preventiveSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Selesai") {
          completed++;
        }
      });

      // Hitung yang belum selesai
      let pending = total - completed;

      return { total, completed, pending };
    } catch (error) {
      console.error("Error mengambil statistik preventif:", error);
      return { total: 0, completed: 0, pending: 0 };
    }
  };

  // Mengambil semua data saat komponen dimounting
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Panggil fungsi untuk mendapatkan data gangguan tahunan
        const gangguanTahunanList = await fetchGangguanPenyulangTahunan();

        // Tambahkan ini untuk mengambil data preventive hari ini
        const jumlahPreventiveHariIni = await fetchPreventiveHariIni();
        setPreventiveHariIni(jumlahPreventiveHariIni);

        // Tambahkan ini untuk mengambil statistik preventif
        const preventiveStatsData = await fetchPreventiveStats();
        setPreventiveStats(preventiveStatsData);

        // Panggil fungsi-fungsi fetch data lainnya secara paralel
        await Promise.all([fetchDashboardData(), fetchTotalGardu()]);

        // Update state dengan data gangguan tahunan
        setDashboardData((prevData) => ({
          ...prevData,
          gangguanTahunanList: gangguanTahunanList || [],
        }));
      } catch (err) {
        console.error("Error mengambil data dashboard:", err);
        setError("Gagal memuat data. Silahkan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <SidebarLayout pengguna={user} ruteDisetujui={allowedServicesForYantek}>
      <div className="relative bg-gray-50 min-h-screen">
        <div className="fixed top-0 right-0 bg-main text-white px-4 py-2 h-16 w-full z-10 flex items-center justify-center bg-gradient-to-r from-main to-blue-500 font-semibold">
          SIEKAS
        </div>
        {/* Sidebar Mobile */}

        {/* Konten Utama */}
        <div className="p-4 max-w-sm mx-auto md:max-w-3xl lg:max-w-5xl mt-10">
          {/* Header Section */}
          <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">
              Selamat datang, {user?.email || "Inspektor"} |{" "}
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-main to-blue-500 text-white p-5 rounded-xl shadow-md relative mb-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold">SIEKAS</p>
                <h2 className="text-xl font-bold mb-2">
                  Sistem Inspeksi dan Eksekusi Asset Selaparang
                </h2>
                <p className="text-sm opacity-90">
                  ULP Selong | {user?.role || "Inspektor"}
                </p>
                <p>
                  {selectedPetugas.length > 0 && (
                    <div className=" text-sm">
                      <p>
                        Petugas: {selectedPetugas.map((p) => p.nama).join(", ")}
                      </p>
                    </div>
                  )}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FaTachometerAlt size={24} />
              </div>
            </div>
          </div>

          {/* Dashboard Metrics */}
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <FaSpinner className="animate-spin text-main text-4xl" />
              <p className="ml-3 text-gray-600">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium flex items-center">
                <FaExclamationTriangle className="mr-2" /> {error}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Metrik 1: Gardu Hari Ini */}
              {/* Metrik 3: Status Pemadaman */}
              {/* Metrik 4: Temuan Hari Ini */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Link to="/preventive">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-500 text-sm">
                      Temuan Preventif belum di Eksekusi
                    </h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <IoIosWarning className="text-red-500" />
                    </div>
                  </div>
                </Link>
                <p className="text-2xl font-bold">{preventiveStats.pending}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <span>{preventiveHariIni} Selesai hari ini</span>
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                      <span>{preventiveStats.pending} Belum</span>
                    </span>
                  </div>
                </div>
              </div>
              {/* <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-gray-500 text-sm">Preventif Hari Ini</h3>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaCalendarCheck className="text-green-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{preventiveHariIni}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Jumlah pekerjaan preventif yang diselesaikan hari ini
                </div>
              </div> */}

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-gray-500 text-sm">
                    Gardu Diukur Hari Ini
                  </h3>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaTachometerAlt className="text-blue-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {dashboardData.garduHariIni}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Dari {dashboardData.garduBulanIni} pengukuran bulan ini
                </div>
              </div>

              {/* Metrik 2: Gangguan Hari Ini */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-gray-500 text-sm">
                    Gangguan Penyulang Hari Ini
                  </h3>
                  <div className="bg-red-100 p-2 rounded-lg">
                    <FaBolt className="text-red-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {dashboardData.gangguanHariIni}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Dari {dashboardData.gangguanBulanIni} gangguan bulan ini
                </div>
              </div>
            </div>
          )}

          {/* Performa Gardu dan Penyulang */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Performa Jaringan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Komponen Kondisi Gardu - Total Gardu */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">Kondisi Gardu</h3>
                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {dashboardData.totalGardu} Total Gardu
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm text-gray-600">
                          Beban Tinggi ({">"}80%)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-800">
                          {dashboardData.garduBebanTinggi || 0}
                        </span>
                        <span className="text-xs text-gray-500">Gardu</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full"
                        style={{
                          width: `${
                            dashboardData.totalGardu
                              ? (dashboardData.garduBebanTinggi /
                                  dashboardData.totalGardu) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm text-gray-600">
                          Beban Rendah ({"<"}20%)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-800">
                          {dashboardData.garduBebanRendah || 0}
                        </span>
                        <span className="text-xs text-gray-500">Gardu</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-yellow-500 h-3 rounded-full"
                        style={{
                          width: `${
                            dashboardData.totalGardu
                              ? (dashboardData.garduBebanRendah /
                                  dashboardData.totalGardu) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <span className="text-sm text-gray-600">
                          Unbalance ({">"}20%)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-800">
                          {dashboardData.garduUnbalance || 0}
                        </span>
                        <span className="text-xs text-gray-500">Gardu</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full"
                        style={{
                          width: `${
                            dashboardData.totalGardu
                              ? (dashboardData.garduUnbalance /
                                  dashboardData.totalGardu) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Container untuk Gangguan Penyulang (1 tahun dan bulan ini) */}
              <div className="space-y-4">
                {/* Gangguan Performance - Tampilan Tahunan */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-700">
                      Gangguan Penyulang (1 Tahun)
                    </h3>
                    <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Top 5
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex justify-center items-center h-24">
                      <FaSpinner className="animate-spin text-main" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dashboardData.gangguanTahunanList &&
                      dashboardData.gangguanTahunanList.length > 0 ? (
                        dashboardData.gangguanTahunanList.map((item, index) => {
                          // Tentukan warna berdasarkan ranking
                          let bgColor = "bg-yellow-500";
                          let badgeBg = "bg-yellow-100";
                          let badgeText = "text-yellow-700";

                          if (index === 0) {
                            bgColor = "bg-red-500";
                            badgeBg = "bg-red-100";
                            badgeText = "text-red-700";
                          } else if (index === 1) {
                            bgColor = "bg-orange-500";
                            badgeBg = "bg-orange-100";
                            badgeText = "text-orange-700";
                          }

                          return (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-2 h-10 ${bgColor} rounded-full mr-3`}
                                ></div>
                                <span className="font-medium">{item.nama}</span>
                              </div>
                              <span
                                className={`px-2 py-1 ${badgeBg} ${badgeText} rounded-md text-sm font-medium`}
                              >
                                {item.jumlah} kali
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Tidak ada data gangguan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Gangguan Performance - Tampilan Bulan Ini */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-700">
                      Gangguan Penyulang (Bulan Ini)
                    </h3>
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {dashboardData.gangguanBulanIni} gangguan
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex justify-center items-center h-24">
                      <FaSpinner className="animate-spin text-main" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dashboardData.gangguanBulanIniList &&
                      dashboardData.gangguanBulanIniList.length > 0 ? (
                        dashboardData.gangguanBulanIniList.map(
                          (item, index) => {
                            // Tentukan warna berdasarkan ranking
                            let bgColor = "bg-yellow-500";
                            let badgeBg = "bg-yellow-100";
                            let badgeText = "text-yellow-700";

                            if (index === 0) {
                              bgColor = "bg-red-500";
                              badgeBg = "bg-red-100";
                              badgeText = "text-red-700";
                            } else if (index === 1) {
                              bgColor = "bg-orange-500";
                              badgeBg = "bg-orange-100";
                              badgeText = "text-orange-700";
                            }

                            return (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded"
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`w-2 h-10 ${bgColor} rounded-full mr-3`}
                                  ></div>
                                  <span className="font-medium">
                                    {item.nama}
                                  </span>
                                </div>
                                <span
                                  className={`px-2 py-1 ${badgeBg} ${badgeText} rounded-md text-sm font-medium`}
                                >
                                  {item.jumlah} kali
                                </span>
                              </div>
                            );
                          }
                        )
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Tidak ada data gangguan bulan ini
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Button */}
          {user?.role === "yantek" ? (
            <Link to="/preventive?action=openManualDialog">
              <button className="fixed bottom-6 right-6 bg-main text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center">
                <span className="text-xl">➕</span>
              </button>
            </Link>
          ) : (
            <Link to="/tambahTemuan">
              <button className="fixed bottom-6 right-6 bg-main text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center">
                <span className="text-xl">➕</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Home;
