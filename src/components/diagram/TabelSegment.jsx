import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import PropTypes from "prop-types";

const TabelSegment = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const BulanIni = new Date().getMonth();
    const fetchData = async () => {
      try {
        const q = query(collection(db, "segment"), orderBy("idSegment", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Menghitung total panjang, total segmen, dan segmen sudah dicek per penyulang
        const penyulangStats = fetchedData.reduce((acc, item) => {
          if (!acc[item.penyulang]) {
            acc[item.penyulang] = {
              totalPanjang: 0,
              totalSegmen: 0,
              segmenSudahDicek: 0,
            };
          }
          acc[item.penyulang].totalPanjang +=
            parseFloat(item.panjangSegment) || 0;
          acc[item.penyulang].totalSegmen += 1;
          if (new Date(item.tglCek).getMonth() === BulanIni) {
            acc[item.penyulang].segmenSudahDicek += 1;
          }
          return acc;
        }, {});

        // Mengubah objek menjadi array untuk ditampilkan di tabel
        const result = Object.entries(penyulangStats).map(
          ([penyulang, stats]) => ({
            penyulang,
            ...stats,
            persentase: (stats.segmenSudahDicek / stats.totalSegmen) * 100,
          })
        );

        setData(result); // Menyimpan data hasil pengolahan ke state
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Penyulang</TableHead>
            <TableHead>Total Panjang (KMS)</TableHead>
            <TableHead>Total Segmen</TableHead>
            <TableHead>Segmen Sudah Dicek bulan ini</TableHead>
            <TableHead>Persentase (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.penyulang}</TableCell>
              <TableCell>{item.totalPanjang.toFixed(2)}</TableCell>
              <TableCell>{item.totalSegmen}</TableCell>
              <TableCell>{item.segmenSudahDicek}</TableCell>
              <TableCell>
                {" "}
                <ProgressBar percentage={item.persentase} />{" "}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ProgressBar = ({ percentage }) => {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#e0e0e0",
        borderRadius: "5px",
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          backgroundColor: "#76c7c0",
          height: "20px",
          borderRadius: "5px",
        }}
      >
        {percentage.toFixed(2)}%
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  percentage: PropTypes.number.isRequired,
};

export default TabelSegment;
