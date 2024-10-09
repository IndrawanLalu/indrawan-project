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

// Register necessary components with ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Top10gangguan = () => {
  const [gangguanTerbanyak, setGangguanTerbanyak] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "gangguanPenyulang"), // Sesuaikan nama koleksi
          where("tanggalGangguan", ">=", "2024-01-01"),
          where("tanggalGangguan", "<=", "2024-12-31")
        );
        const querySnapshot = await getDocs(q);
        const dataGangguan = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // Hitung frekuensi gangguan berdasarkan penyebab atau kode gangguan
        const gangguanCounts = {};
        dataGangguan.forEach((item) => {
          const keypoint = item.keypoint; // Bisa juga pakai item.kodeGangguan
          if (gangguanCounts[keypoint]) {
            gangguanCounts[keypoint] += 1;
          } else {
            gangguanCounts[keypoint] = 1;
          }
        });

        // Ubah object menjadi array, urutkan berdasarkan frekuensi, dan ambil top 10
        const sortedGangguan = Object.entries(gangguanCounts)
          .sort((a, b) => b[1] - a[1]) // Sort descending by count
          .slice(0, 10); // Take top 10

        setGangguanTerbanyak(sortedGangguan);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchData();
  }, []);
  const data = {
    labels: gangguanTerbanyak.map(([penyulang]) => penyulang),
    datasets: [
      {
        label: "Kali Gangguan",
        data: gangguanTerbanyak.map(([, count]) => count), // Data berupa frekuensi gangguan
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgb(127, 188, 140)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // Allows chart to resize dynamically
    indexAxis: "y", // Makes the bar chart horizontal
    barThickness: 14, // Controls bar thickness
    categoryPercentage: 0.7, // Controls spacing between categories
    barPercentage: 1, // Controls spacing between bars
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "TOP 10 Gangguan Penyulang 2024",
      },
      datalabels: {
        anchor: "center", // Position at the center of the bar
        align: "end", // Align the label to the end of the bar
        formatter: (value) => `${value}x`, // Customize label format
        color: "black", // Color of the data label
        font: {
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        ticks: {
          font: {
            size: 10, // Adjust font size for better readability
          },
          padding: 18, // Increase space between labels and chart
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default Top10gangguan;
