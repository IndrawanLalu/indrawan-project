import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

const TotalGangguan = () => {
  const [totalGangguan, setTotalGangguan] = useState(0);

  useEffect(() => {
    const fetchTotalGangguan = async () => {
      try {
        const q = query(
          collection(db, "gangguanPenyulang"), // Sesuaikan dengan nama koleksi Firebase
          where("tanggalGangguan", ">=", "2024-01-01"),
          where("tanggalGangguan", "<=", "2024-12-31")
        );

        const querySnapshot = await getDocs(q);
        const total = querySnapshot.size; // Menghitung jumlah dokumen (gangguan)

        setTotalGangguan(total); // Set jumlah total gangguan
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchTotalGangguan();
  }, []);
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
              <span className="text-sm">Persentase</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <span className="text-4xl animate-pulse text-red-500">
              {(totalGangguan / 81).toFixed(2) * 100} %
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { TotalGangguan };
