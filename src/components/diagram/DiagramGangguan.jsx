
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useState, useEffect } from 'react';

// Register necessary components with ChartJS
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

const DiagramGangguan = () => {
  const [targetGangguan2024, setTargetGangguan2024] = useState([]);
  const [gangguan2024, setGangguan2024] = useState([]);

  // Fetch data from the JSON file in public folder
  useEffect(() => {
    fetch('/db/gangguan.json') // Path to the JSON file in the public folder
      .then((response) => response.json())
      .then((data) => {
        setTargetGangguan2024(data.targetGangguan2024); // Store target data in state
        setGangguan2024(data.gangguan2024); // Store gangguan data in state
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
  const data = {
    labels: gangguan2024.length > 0 ? gangguan2024.map(item => item.bulan) : [], // Pastikan data ada sebelum melakukan map
    datasets: [
      {
        label: 'Gangguan',
        data: gangguan2024.length > 0 ? gangguan2024.map(item => item.jumlah) : [], // Sama dengan label, cek dulu datanya ada
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'Target',
        data: targetGangguan2024.length > 0 ? targetGangguan2024.map(item => item.jumlah) : [], // Sama dengan label, cek dulu datanya ada
        borderColor: 'rgba(234, 63, 151, 0.8)',
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
        position: 'top',
      },
      title: {
        display: true,
        text: 'Gangguan Penyulang 2024',
      },
      datalabels: {
        anchor: 'end', // Position label at the end of each point
        align: 'top', // Align label above the point
        offset: 0, // Adds spacing between the point and label
        formatter: (value) => value, // Show the exact value
        color: 'black', // Text color for the labels
        font: {
          size: 12,
          weight: 'bold',
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

export default DiagramGangguan;
