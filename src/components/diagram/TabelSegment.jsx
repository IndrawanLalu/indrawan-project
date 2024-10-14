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
        // Ambil data dari koleksi "segment"
        const segmentQuery = query(
          collection(db, "segment"),
          orderBy("idSegment", "asc")
        );
        const segmentSnapshot = await getDocs(segmentQuery);
        const fetchedSegmentData = segmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Ambil data dari koleksi "inspeksi" untuk menghitung temuan per penyulang
        const inspeksiQuery = query(collection(db, "inspeksi"));
        const inspeksiSnapshot = await getDocs(inspeksiQuery);
        const fetchedInspeksiData = inspeksiSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Mengelompokkan inspeksi berdasarkan penyulang dan status
        const inspeksiByPenyulang = fetchedInspeksiData.reduce(
          (acc, inspeksi) => {
            const { penyulang, status } = inspeksi;
            if (!acc[penyulang]) {
              acc[penyulang] = { temuan: 0, pending: 0, selesai: 0 };
            }
            if (status === "Temuan") {
              acc[penyulang].temuan += 1;
            } else if (status === "Pending") {
              acc[penyulang].pending += 1;
            } else if (status === "Selesai") {
              acc[penyulang].selesai += 1;
            }
            return acc;
          },
          {}
        );

        // Menghitung total panjang, total segmen, dan segmen sudah dicek per penyulang
        const penyulangStats = fetchedSegmentData.reduce((acc, item) => {
          if (!acc[item.penyulang]) {
            acc[item.penyulang] = {
              totalPanjang: 0,
              totalSegmen: 0,
              segmenSudahDicek: 0,
              temuan: inspeksiByPenyulang[item.penyulang]?.temuan || 0,
              pending: inspeksiByPenyulang[item.penyulang]?.pending || 0,
              selesai: inspeksiByPenyulang[item.penyulang]?.selesai || 0,
            };
          }

          // Tambahkan panjang segmen dan total segmen
          acc[item.penyulang].totalPanjang +=
            parseFloat(item.panjangSegment) || 0;
          acc[item.penyulang].totalSegmen += 1;

          // Hitung segmen yang sudah dicek bulan ini
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
            <TableHead>Sudah Dicek bulan ini</TableHead>
            <TableHead>Persentase (%)</TableHead>
            <TableHead>Temuan</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead>Selesai</TableHead>
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
                <ProgressBar percentage={item.persentase} />
              </TableCell>
              <TableCell>{item.temuan}</TableCell>
              <TableCell>{item.pending}</TableCell>
              <TableCell>{item.selesai}</TableCell>
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
