import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import * as XLSX from "xlsx";

const downloadExcel = async () => {
  try {
    // Ambil data dari Firestore
    const querySnapshot = await getDocs(collection(db, "inspeksi")); // Ganti dengan nama koleksi Firestore-mu

    let data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    // Konversi data ke worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Buat file Excel dan unduh
    XLSX.writeFile(workbook, "data.xlsx");
  } catch (error) {
    console.error("Error downloading Excel:", error);
  }
};

export default downloadExcel;
