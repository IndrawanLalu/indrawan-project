import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Sesuaikan dengan konfigurasi Firebase
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Register ArcElement, Tooltip, and Legend for Pie Chart
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartGangguan = () => {
  const [realisasiGangguan, setRealisasiGangguan] = useState(0);
  const targetGangguan = 100; // Misalkan target gangguan 100 (bisa disesuaikan)

  useEffect(() => {
    const fetchGangguanData = async () => {
      try {
        const q = query(
          collection(db, "gangguanPenyulang"),
          where("tanggalGangguan", ">=", "2024-01-01"),
          where("tanggalGangguan", "<=", "2024-12-31")
        );

        const querySnapshot = await getDocs(q);
        const totalRealisasi = querySnapshot.size; // Menghitung total gangguan yang terjadi

        setRealisasiGangguan(totalRealisasi);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchGangguanData();
  }, []);

  // Data for the Pie Chart
  const data = {
    labels: ["Realisasi Gangguan", "Sisa Gangguan"],
    datasets: [
      {
        label: "Gangguan Penyulang",
        data: [realisasiGangguan, targetGangguan - realisasiGangguan],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(234, 63, 151, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(234, 63, 151, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // Allows chart to resize dynamically
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            <span className="text-sm">Total Gangguan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Pie
            data={data}
            options={options}
            style={{ height: "150px", width: "150px" }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PieChartGangguan;
