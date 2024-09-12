import Body from "@/components/body";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";

const Padam = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah item per halaman

  useEffect(() => {
    // Fetch data dari public folder
    fetch("/db/padam.json")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  // Hitung index item yang akan ditampilkan berdasarkan halaman
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  // Menghitung jumlah halaman
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Fungsi untuk mengubah halaman
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Body>
      <h1 className="text-2xl font-semibold py-2">Event Padam ULP Selong</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Penyulang</TableHead>
            <TableHead>Beban</TableHead>
            <TableHead>Jam Padam</TableHead>
            <TableHead>Jam Nyala</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ket</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="w-10">{indexOfFirstItem + index + 1}</TableCell>
              <TableCell>{item.tanggal}</TableCell>
              <TableCell>{item.penyulang}</TableCell>
              <TableCell>{item.beban}</TableCell>
              <TableCell>{item.jamPadam}</TableCell>
              <TableCell>{item.jamNyala}</TableCell>
              <TableCell>
                {item.status === "HAR" ? (
                  <span className="bg-yellow-500 px-2 rounded-md">HAR</span>
                ) : (
                  <span className="bg-red-500 px-2 rounded-md">{item.status}</span>
                )}
              </TableCell>
              {item.Keterangan === "On Progress" ? (
                <TableCell className="text-red-500 animate-pulse">{item.Keterangan}</TableCell>
              ) : (
                <TableCell className="text-green-500  ">{item.Keterangan}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Kontrol Pagination */}
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </Body>
  );
};

export default Padam;
