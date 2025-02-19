import PropTypes from "prop-types";
// import { format } from "date-fns"; // For handling date formats
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
import { db } from "@/firebase/firebaseConfig"; // Sesuaikan dengan konfigurasi Firebase Anda
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels // Register DataLabels plugin
);

const DiagramGangguanPenyulang = ({ startDate, endDate }) => {
  const [gangguanTahunLalu, setGangguanTahunLalu] = useState([]);
  const [gangguannTahunIni, setGangguanTahunIni] = useState([]);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "gangguanPenyulang") // Sesuaikan nama koleksi
          // where("tanggalGangguan", ">=", format(startDate, "yyyy-MM-dd")),
          // where("tanggalGangguan", "<=", format(endDate, "yyyy-MM-dd"))
        );
        const querySnapshot = await getDocs(q);
        const dataGangguan = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // Misalnya Anda ingin menampilkan jumlah gangguan per bulan:
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
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

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
        label: "Tahun Ini",
        data: gangguannTahunIni, // Data gangguan per bulan
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Tahun Lalu",
        data: gangguanTahunLalu, // Data target per bulan
        borderColor: "rgba(234, 63, 151, 0.8)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // Allows chart to resize dynamically
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Gangguan Penyulang",
      },
      datalabels: {
        anchor: "end", // Position label at the end of each point
        align: "top", // Align label above the point
        offset: 0, // Adds spacing between the point and label
        formatter: (value) => value, // Show the exact value
        color: "black", // Text color for the labels
        font: {
          size: 12,
          weight: "bold",
        },
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
};
DiagramGangguanPenyulang.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};
export default DiagramGangguanPenyulang;
