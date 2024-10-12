import PropTypes from "prop-types";
import { format } from "date-fns"; // For handling date formats
import { Pie } from "react-chartjs-2";
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
  ArcElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
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
  ArcElement,
  ChartDataLabels // Register DataLabels plugin
);
const DiagramSumberGangguan = ({ startDate, endDate }) => {
  const [chartData, setChartData] = useState([0, 0]);
  const [chartDurasi, setChartDurasi] = useState([0, 0]);
  // Fungsi untuk mengonversi "HH:MM:SS" ke dalam detik
  const convertToSeconds = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60;
  };

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "gangguanPenyulang"), // Sesuaikan nama koleksi
          where("tanggalGangguan", ">=", format(startDate, "yyyy-MM-dd")),
          where("tanggalGangguan", "<=", format(endDate, "yyyy-MM-dd"))
        );
        const querySnapshot = await getDocs(q);
        const dataSumberGangguan = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        let giCount = 0;
        let recloserCount = 0;
        let padamLebihLimaMenit = 0;
        let padamKurangLimaMenit = 0;

        // Menghitung gangguan per sumber
        dataSumberGangguan.forEach((data) => {
          if (data.fasilitasPadam === "GI/PLTD") {
            giCount++;
          } else if (data.fasilitasPadam === "RECLOSER") {
            recloserCount++;
          }
        });
        dataSumberGangguan.forEach((data) => {
          const durasiInSeconds = convertToSeconds(data.durasi);
          const fiveMinutesInSeconds = 5 * 60; // 5 menit dalam detik

          if (durasiInSeconds > fiveMinutesInSeconds) {
            padamLebihLimaMenit++;
          } else if (durasiInSeconds <= fiveMinutesInSeconds) {
            padamKurangLimaMenit++;
          }
        });

        // Set data chart dengan nilai GI dan Recloser
        setChartData([giCount, recloserCount]);
        setChartDurasi([padamLebihLimaMenit, padamKurangLimaMenit]);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]); // Empty dependency array untuk menjalankan sekali saat mount

  const data = {
    labels: ["GI/PLTD", "RECLOSER"],
    datasets: [
      {
        data: chartData,
        backgroundColor: ["#7FBC8C", "#DC79AF"],
      },
    ],
  };
  const durasi = {
    labels: ["> 5 Menit", "< 5 Menit"],
    datasets: [
      {
        data: chartDurasi,
        backgroundColor: ["#7FBC8C", "#DC79AF"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to resize dynamically
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        // display: true,
        // text: "Fasilitas Padam",
      },
      datalabels: {
        anchor: "center", // Position label at the end of each point
        align: "top", // Align label above the point
        offset: 1, // Adds spacing between the point and label
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
    <>
      <div className="h-32 pb-2">
        <Pie data={data} options={options} />
      </div>
      <div className="h-32">
        <Pie data={durasi} options={options} />
      </div>
    </>
  );
};
DiagramSumberGangguan.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};
export default DiagramSumberGangguan;
