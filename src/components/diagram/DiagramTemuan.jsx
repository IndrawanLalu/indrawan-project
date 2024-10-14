import PropTypes from "prop-types";
import { format } from "date-fns"; // For handling date formats
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

const DiagramTemuan = ({ startDate, endDate }) => {
  const [temuanTerbanyak, setTemuanTerbanyak] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "inspeksi"), // Sesuaikan nama koleksi
          where("tglInspeksi", ">=", format(startDate, "yyyy-MM-dd")),
          where("tglInspeksi", "<=", format(endDate, "yyyy-MM-dd"))
        );
        const querySnapshot = await getDocs(q);
        const dataInspeksi = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // console.log("Data dari Firebase:", dataInspeksi); // Tambahkan log ini

        // Hitung frekuensi gangguan berdasarkan penyebab atau kode gangguan
        const temuanCounts = {};
        dataInspeksi.forEach((item) => {
          const temuan = item.temuan; // Bisa juga pakai item.kodeGangguan
          if (temuanCounts[temuan]) {
            temuanCounts[temuan] += 1;
          } else {
            temuanCounts[temuan] = 1;
          }
        });

        // Ubah object menjadi array, urutkan berdasarkan frekuensi, dan ambil top 10
        const sortedGangguan = Object.entries(temuanCounts)
          .sort((a, b) => b[1] - a[1]) // Sort descending by count
          .slice(0, 20); // Take top 10

        setTemuanTerbanyak(sortedGangguan);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);
  const data = {
    labels: temuanTerbanyak.map(([temuan]) => temuan),
    datasets: [
      {
        label: "Temuan Inspeksi",
        data: temuanTerbanyak.map(([, count]) => count), // Data berupa frekuensi temuan
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgb(127, 188, 140)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to resize dynamically
    indexAxis: "y", // Makes the bar chart horizontal
    barThickness: 14, // Controls bar thickness
    categoryPercentage: 0.7, // Controls spacing between categories
    barPercentage: 1, // Controls spacing between bars
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        // display: true,
        // text: "TOP 10 Gangguan Penyulang 2024",
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
DiagramTemuan.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};
export default DiagramTemuan;
