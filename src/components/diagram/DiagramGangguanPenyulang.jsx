import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Sesuaikan dengan konfigurasi Firebase Anda

const DiagramGangguanPenyulang = () => {
  const [targetGangguan2024, setTargetGangguan2024] = useState([]);
  const [gangguan2024, setGangguan2024] = useState([]);

  // Fetch data from Firebase
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

        // Misalnya Anda ingin menampilkan jumlah gangguan per bulan:
        const gangguanByMonth = Array(12).fill(0);
        dataGangguan.forEach((item) => {
          const bulan = new Date(item.tanggalGangguan).getMonth();
          gangguanByMonth[bulan] += 1; // Misalnya menghitung jumlah gangguan
        });

        setGangguan2024(gangguanByMonth); // Simpan data gangguan

        // Ambil juga target gangguan, misalnya dari static JSON atau koleksi lain
        setTargetGangguan2024([8, 7, 8, 4, 3, 4, 5, 5, 4, 7, 14, 12]);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchData();
  }, []);

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
        label: "Gangguan",
        data: gangguan2024, // Data gangguan per bulan
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Target",
        data: targetGangguan2024, // Data target per bulan
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
        text: "Gangguan Penyulang 2024",
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

export default DiagramGangguanPenyulang;
