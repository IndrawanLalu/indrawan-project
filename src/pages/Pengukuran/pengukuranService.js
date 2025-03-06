import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { hitungBebanKva, hitungPersen, hitungUBL } from "./rumus"; // import rumus

export const tambahPengukuran = async (gardu, newData) => {
  try {
    const garduRef = collection(db, `gardu/${gardu.nama}/pengukuran`);

    // Ambil pengukuran terakhir (maksimal 5)
    const pengukuranQuery = query(
      garduRef,
      orderBy("tglUkur", "desc"),
      limit(5)
    );
    const snapshot = await getDocs(pengukuranQuery);

    let pengukuranList = [];
    snapshot.forEach((doc) => {
      pengukuranList.push({ id: doc.id, ...doc.data() });
    });

    // Hitung nilai baru
    const bebanKva = hitungBebanKva(
      newData.rTotal,
      newData.sTotal,
      newData.tTotal
    );
    const persen = hitungPersen(bebanKva, gardu.kva);
    const ubl = hitungUBL(newData.rTotal, newData.sTotal, newData.tTotal);

    // Data yang akan disimpan
    const newEntry = {
      ...gardu,
      ...newData,
      bebanKva,
      Persen: persen,
      UBL: ubl,
      tglUkur: newData.tglUkur,
      tglUpdate: new Date().toISOString(),
    };

    // Tambahkan pengukuran baru
    await addDoc(garduRef, newEntry);

    // Jika lebih dari 5, hapus yang tertua
    if (pengukuranList.length >= 5) {
      const oldest = pengukuranList[pengukuranList.length - 1];
      await deleteDoc(doc(db, `gardu/${gardu.nama}/pengukuran`, oldest.id));
    }

    return "✅ Pengukuran berhasil ditambahkan!";
  } catch (error) {
    console.error("❌ Error menambahkan pengukuran:", error);
    return "⚠️ Gagal menambahkan pengukuran.";
  }
};
