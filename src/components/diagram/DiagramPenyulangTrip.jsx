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

const DiagramPenyulangTrip = () => {
  const [jsonData, setJsonData] = useState([]);

  // Fetch data from the JSON file in public folder
  useEffect(() => {
    fetch("/db/gangguan.json") // Path to the JSON file in the public folder
      .then((response) => response.json())
      .then((data) => setJsonData(data.top10gangguan)) // Store data in state
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  const data = {
    labels: jsonData.length > 0 ? jsonData.map((item) => item.penyulang) : [], // Pastikan data ada sebelum melakukan map
    datasets: [
      {
        label: "Kali Gangguan",
        data: jsonData.length > 0 ? jsonData.map((item) => item.jumlah) : [], // Sama dengan label, cek dulu datanya ada
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgb(127, 188, 140)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // Allows chart to resize dynamically
    indexAxis: "y", // Makes the bar chart horizontal
    barThickness: 16, // Controls bar thickness
    categoryPercentage: 0.7, // Controls spacing between categories
    barPercentage: 0.9, // Controls spacing between bars
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
            size: 12, // Adjust font size for better readability
          },
          padding: 20, // Increase space between labels and chart
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default DiagramPenyulangTrip;
