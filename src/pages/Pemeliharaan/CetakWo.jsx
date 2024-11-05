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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImagePreview from "../ImagePreview";

const CetakWo = () => {
  const [data, setData] = useState([]);
  const [dataPenyulang, setDataPenyulang] = useState([]);
  const [filterPenyulang, setFilterPenyulang] = useState("KELAYU");

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
          (data) => data.statusValidasi === "valid" && data.status === "Temuan"
        );

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDataPenyulang = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "penyulang"));
        const fetchDataPenyulang = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDataPenyulang(fetchDataPenyulang);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchDataPenyulang();
  }, []);

  // Filter data berdasarkan category
  // Filter data berdasarkan category dan penyulang
  const filteredDataByPenyulang = () => {
    return data.filter(
      (item) => filterPenyulang === "all" || item.penyulang === filterPenyulang // Tambah filter penyulang
    );
  };

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
                <TableHead>
                  <Select onValueChange={setFilterPenyulang}>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Penyulang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {dataPenyulang.map((penyulang) => (
                        <SelectItem
                          key={penyulang.id}
                          value={penyulang.penyulang}
                        >
                          {penyulang.penyulang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead>Material</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDataByPenyulang().map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <ImagePreview
                      type="file"
                      src={item.imageUrl}
                      alt="foto"
                      description={
                        item.temuan ? (
                          <div className="grid grid-cols-2 justify-between text-start gap-10 pt-2">
                            <div>
                              <div>Temuan: {item.temuan}</div>
                              <div>Lokasi: {item.lokasi}</div>
                              <div>Penyulang: {item.penyulang}</div>
                            </div>
                            <div>
                              Material:{" "}
                              {item.materials && item.materials.length > 0 ? (
                                item.materials.map((material, index) => (
                                  <h2 key={index} className="">
                                    {material.namaMaterial} :{" "}
                                    {material.jumlahMaterial}
                                  </h2>
                                ))
                              ) : (
                                <p>Tidak ada material</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>Tidak ada temuan</div>
                        )
                      }
                      className="w-36 h-36 rounded-md md:w-36 md:h-36 object-cover"
                    />
                  </TableCell>
                  <TableCell>{item.temuan}</TableCell>
                  <TableCell>{item.lokasi}</TableCell>
                  <TableCell>{item.penyulang}</TableCell>
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
