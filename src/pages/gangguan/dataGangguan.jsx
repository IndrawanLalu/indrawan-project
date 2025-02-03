import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { format } from "date-fns";

const TotalGangguan = () => {
  const [totalGangguan, setTotalGangguan] = useState(0);
  const startDate = new Date(new Date().getFullYear(), 0, 1); // Default awal tahun ini
  const endDate = new Date(); // Hari ini // Default hari ini

  useEffect(() => {
    const fetchTotalGangguan = async () => {
      try {
        const q = query(
          collection(db, "gangguanPenyulang"), // Sesuaikan dengan nama koleksi Firebase
          where("tanggalGangguan", ">=", format(startDate, "yyyy-MM-dd")),
          where("tanggalGangguan", "<=", format(endDate, "yyyy-MM-dd"))
        );

        const querySnapshot = await getDocs(q);
        const total = querySnapshot.size; // Menghitung jumlah dokumen (gangguan)

        setTotalGangguan(total); // Set jumlah total gangguan
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchTotalGangguan();
  });
  return (
    <div className="flex gap-4">
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              <span className="text-sm">Total Gangguan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <span className="text-4xl text-center">{totalGangguan}</span>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              <span className="text-sm">Target Gangguan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <span className="text-4xl">{81}</span>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              <span className="text-sm">Persentase Gangguan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <span className="text-4xl animate-pulse text-red-500">
              {(totalGangguan / 81).toFixed(2) * 100}%
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { TotalGangguan };
