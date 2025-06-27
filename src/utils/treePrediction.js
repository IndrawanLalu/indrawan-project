// utils/treePrediction.js - UPDATED VERSION WITH INSPECTOR DIRECT INPUT

// Prediksi hari berdasarkan input inspektor
const predictionDaysOptions = {
  "1 hari": 1,
  "1 minggu": 7,
  "1 bulan": 30,
  "2 bulan": 60,
  "3 bulan": 90,
};

// Hitung hari sejak inspeksi atau eksekusi terakhir
const getDaysSinceLastAction = (tglInspeksi, tglEksekusi = null) => {
  // Gunakan tanggal eksekusi jika ada, kalau tidak pakai tanggal inspeksi
  const referenceDate = tglEksekusi || tglInspeksi;

  if (!referenceDate) return 0;

  const actionDate = new Date(referenceDate);
  const today = new Date();
  const diffTime = Math.abs(today - actionDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// UPDATED: Core calculation untuk sisa hari berdasarkan prediksi inspektor
const calculateRemainingDays = (
  prediksiInspektur,
  tglInspeksi,
  tglEksekusi = null,
  status = "Temuan"
) => {
  // Jika sudah selesai eksekusi, reset perhitungan dari tanggal eksekusi
  if (status === "Selesai" && tglEksekusi) {
    // Setelah dipotong, asumsi pohon butuh 3 bulan untuk tumbuh kembali berbahaya
    const hariSetelahPotong = 90; // 3 bulan default
    const hariSejakEksekusi = getDaysSinceLastAction(null, tglEksekusi);
    return Math.max(0, hariSetelahPotong - hariSejakEksekusi);
  }

  // Ambil prediksi hari dari input inspektor
  const prediksiHari = predictionDaysOptions[prediksiInspektur] || 30;

  // Hitung hari yang sudah berlalu sejak inspeksi
  const hariSejakInspeksi = getDaysSinceLastAction(tglInspeksi);

  // Sisa hari = prediksi - hari yang sudah berlalu
  const sisaHari = Math.max(0, prediksiHari - hariSejakInspeksi);

  return sisaHari;
};

// UPDATED: Get warning level berdasarkan sisa hari dengan threshold baru
const getWarningLevel = (sisaHari) => {
  if (sisaHari < 1) {
    return {
      level: "SANGAT_BERBAHAYA",
      color: "bg-red-700",
      textColor: "text-white",
      text: "🚨 SANGAT BERBAHAYA",
      badge: "destructive",
      priority: 5,
      needsUrgentAction: true,
    };
  }

  if (sisaHari < 5) {
    return {
      level: "WASPADA",
      color: "bg-orange-600",
      textColor: "text-white",
      text: "⚠️ WASPADA",
      badge: "destructive",
      priority: 4,
      needsUrgentAction: true,
    };
  }

  if (sisaHari <= 7) {
    return {
      level: "PERHATIAN",
      color: "bg-yellow-600",
      textColor: "text-black",
      text: "🔔 PERHATIAN",
      badge: "secondary",
      priority: 3,
      needsUrgentAction: false,
    };
  }

  if (sisaHari <= 30) {
    return {
      level: "MONITORING",
      color: "bg-blue-500",
      textColor: "text-white",
      text: "📊 MONITORING",
      badge: "default",
      priority: 2,
      needsUrgentAction: false,
    };
  }

  return {
    level: "AMAN",
    color: "bg-green-500",
    textColor: "text-white",
    text: "✅ AMAN",
    badge: "success",
    priority: 1,
    needsUrgentAction: false,
  };
};

// UPDATED: Format display prediksi
const formatPredictionDisplay = (sisaHari, warningLevel, prediksiInspektur) => {
  if (sisaHari < 1) {
    return {
      text: "HARI INI!",
      subtext: "Eksekusi sekarang",
      fullText: `Pohon diprediksi akan menyentuh kabel hari ini. Prediksi awal: ${prediksiInspektur}`,
    };
  }

  if (sisaHari === 1) {
    return {
      text: "1 HARI LAGI",
      subtext: "Besok berbahaya",
      fullText: `Pohon akan menyentuh kabel dalam 1 hari. Prediksi awal: ${prediksiInspektur}`,
    };
  }

  if (sisaHari <= 7) {
    return {
      text: `${sisaHari} HARI LAGI`,
      subtext: "Minggu ini",
      fullText: `Pohon akan menyentuh kabel dalam ${sisaHari} hari. Prediksi awal: ${prediksiInspektur}`,
    };
  }

  if (sisaHari <= 30) {
    const minggu = Math.ceil(sisaHari / 7);
    return {
      text: `~${minggu} MINGGU`,
      subtext: `${sisaHari} hari`,
      fullText: `Pohon akan menyentuh kabel dalam ${sisaHari} hari (${minggu} minggu). Prediksi awal: ${prediksiInspektur}`,
    };
  }

  const bulan = Math.ceil(sisaHari / 30);
  return {
    text: `~${bulan} BULAN`,
    subtext: `${sisaHari} hari`,
    fullText: `Pohon akan menyentuh kabel dalam ${sisaHari} hari (${bulan} bulan). Prediksi awal: ${prediksiInspektur}`,
  };
};

// UPDATED: Main function untuk mendapatkan prediksi lengkap
const getTreePrediction = (pohonData) => {
  const {
    prediksiInspektur,
    tglInspeksi,
    tglEksekusi,
    status = "Temuan",
  } = pohonData;

  const sisaHari = calculateRemainingDays(
    prediksiInspektur,
    tglInspeksi,
    tglEksekusi,
    status
  );

  const warningLevel = getWarningLevel(sisaHari);
  const displayFormat = formatPredictionDisplay(
    sisaHari,
    warningLevel,
    prediksiInspektur
  );

  return {
    sisaHari,
    warningLevel,
    displayFormat,
    prediksiAwal: prediksiInspektur,
    needsAction: warningLevel.needsUrgentAction,
    isUrgent: sisaHari < 5,
    isCritical: sisaHari < 1,
    shouldTriggerBot: sisaHari < 1, // Trigger bot untuk temuan baru < 1 hari
    shouldDailyNotify: sisaHari < 5, // Notifikasi harian untuk < 5 hari
  };
};

// UPDATED: Filter trees yang perlu notifikasi bot
const getTreesNeedingBotNotification = (dataArray) => {
  return dataArray
    .map((item) => ({
      ...item,
      prediction: getTreePrediction(item),
    }))
    .filter((item) => item.prediction.shouldTriggerBot);
};

// UPDATED: Filter trees yang perlu notifikasi harian
const getTreesNeedingDailyNotification = (dataArray) => {
  return dataArray
    .map((item) => ({
      ...item,
      prediction: getTreePrediction(item),
    }))
    .filter((item) => item.prediction.shouldDailyNotify);
};

// Filter dan sort data berdasarkan prioritas
const sortByPriority = (dataArray) => {
  return dataArray
    .map((item) => ({
      ...item,
      prediction: getTreePrediction(item),
    }))
    .sort((a, b) => {
      // Sort by priority (higher priority first)
      if (
        b.prediction.warningLevel.priority !==
        a.prediction.warningLevel.priority
      ) {
        return (
          b.prediction.warningLevel.priority -
          a.prediction.warningLevel.priority
        );
      }
      // If same priority, sort by days remaining (less days first)
      return a.prediction.sisaHari - b.prediction.sisaHari;
    });
};

// Get trees yang perlu action (waspada ke atas)
const getTreesNeedingAction = (dataArray) => {
  return dataArray
    .map((item) => ({
      ...item,
      prediction: getTreePrediction(item),
    }))
    .filter((item) => item.prediction.needsAction);
};

// UPDATED: Generate message untuk bot notification
const generateBotNotificationMessage = (pohonData) => {
  const prediction = getTreePrediction(pohonData);

  const message = `🚨 ALERT POHON SANGAT BERBAHAYA! 🚨

📍 Lokasi: ${pohonData.lokasi}
🌳 Jenis: ${pohonData.jenisPohon}
🏢 ULP: ${pohonData.ulp}
📅 Tgl Inspeksi: ${pohonData.tglInspeksi}
👷‍♂️ Petugas: ${pohonData.petugas}

⏰ PREDIKSI: ${prediction.displayFormat.fullText}
🚨 STATUS: ${prediction.warningLevel.text}

${sisaHari < 1 ? "🔴 EKSEKUSI SEKARANG JUGA!" : "🟠 PERSIAPAN EKSEKUSI SEGERA!"}

📞 Segera koordinasi dengan tim lapangan!
📍 Koordinat: ${pohonData.koordinat || "Tidak tersedia"}`;

  return message;
};

// UPDATED: Generate message untuk daily notification
const generateDailyNotificationMessage = (treesList) => {
  const sortedTrees = sortByPriority(treesList);

  let message = `🌅 LAPORAN HARIAN POHON BERBAHAYA
📅 ${new Date().toLocaleDateString("id-ID")}
⏰ 08:00 WITA

📊 RINGKASAN:
• Total Pohon Waspada: ${sortedTrees.length}
• Sangat Berbahaya (< 1 hari): ${
    sortedTrees.filter((t) => t.prediction.isCritical).length
  }
• Waspada (< 5 hari): ${sortedTrees.filter((t) => t.prediction.isUrgent).length}

🔴 PRIORITAS TINGGI:\n`;

  sortedTrees.slice(0, 5).forEach((tree, index) => {
    message += `${index + 1}. ${tree.lokasi} - ${tree.jenisPohon}
   ${tree.prediction.warningLevel.text} (${tree.prediction.displayFormat.text})
   ULP: ${tree.ulp}\n`;
  });

  if (sortedTrees.length > 5) {
    message += `\n... dan ${sortedTrees.length - 5} pohon lainnya`;
  }

  message += `\n\n🔧 Segera koordinasi dengan tim lapangan!`;

  return message;
};

// Export functions
export {
  predictionDaysOptions,
  calculateRemainingDays,
  getWarningLevel,
  formatPredictionDisplay,
  getTreePrediction,
  sortByPriority,
  getTreesNeedingAction,
  getTreesNeedingBotNotification,
  getTreesNeedingDailyNotification,
  generateBotNotificationMessage,
  generateDailyNotificationMessage,
  getDaysSinceLastAction,
};
