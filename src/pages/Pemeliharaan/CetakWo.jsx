import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layouts from "@/pages/admin/Layouts";
import { Button } from "@/components/ui/button";

const CetakWo = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inspeksi"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Mengurutkan data berdasarkan tgl inspeksi dari yang terbaru ke terlama
        const sortedData = fetchedData.filter(
          (data) => data.statusValidasi === "valid"
        );

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const generatePDF = () => {
    const element = document.getElementById("pdf-content"); // Elemen yang ingin dijadikan PDF

    html2canvas(element, {
      useCORS: true, // Mengizinkan CORS
      allowTaint: false, // Mencegah kontaminasi dari gambar eksternal
      logging: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // Menambahkan gambar ke PDF
      const imgWidth = 210; // Lebar PDF A4 dalam mm
      const pageHeight = 295; // Tinggi halaman A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Menyesuaikan proporsi gambar
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Jika gambar lebih tinggi dari satu halaman, tambahkan halaman baru
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("report.pdf");
    });
  };

  return (
    <Layouts>
      <div id="pdf-content">
        <div className="text-2xl flex justify-center py-4">
          <h1>Work Order</h1>
        </div>
        <Button onClick={generatePDF}>Download PDF</Button>
        <div className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">#</TableHead>
                <TableHead></TableHead>
                <TableHead>Temuan</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Material</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={`Gambar ${index}`}
                        className="w-14 h-14 object-cover rounded-md"
                      />
                    )}
                  </TableCell>
                  <TableCell>{item.temuan}</TableCell>
                  <TableCell>{item.lokasi}</TableCell>
                  <TableCell>
                    {item.materials && item.materials.length > 0 ? (
                      item.materials.map((material, index) => (
                        <h2 key={index} className="">
                          {material.namaMaterial} : {material.jumlahMaterial}
                        </h2>
                      ))
                    ) : (
                      <p>Tidak ada material</p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layouts>
  );
};

export default CetakWo;
