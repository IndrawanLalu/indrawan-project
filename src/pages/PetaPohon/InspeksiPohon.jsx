// pages/InspeksiPohon.jsx - UPDATED WITH NEW PREDICTION LOGIC
import { useEffect, useState, useCallback, useMemo } from "react";
import { db, storage } from "@/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedDataTable } from "@/pages/PetaPohon/components/ui/EnhancedDataTable";
import { MapComponent } from "@/pages/PetaPohon/components/ui/MapComponent";
import { FormCard } from "@/pages/PetaPohon/components/ui/FormCard";
import {
  getTreePrediction,
  getTreesNeedingAction,
  generateBotNotificationMessage,
  // predictionDaysOptions,
} from "@/utils/treePrediction";
import {
  // checkCriticalFindings,
  useNotificationSystem,
  // testNotification,
} from "@/utils/notificationSystem";
import {
  TreePine,
  Map,
  List,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  // Clock,
  Ruler,
  TrendingUp,
  Bell,
  BellRing,
  // TestTube,
} from "lucide-react";
import Layouts from "../admin/Layouts";
import TreeInspectionForm from "./components/ui/TreeInspectionForm";

const InspeksiPohon = () => {
  // State management
  const [activeTab, setActiveTab] = useState("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [error, setError] = useState(null);

  // Data states
  const [dataPenyulang, setDataPenyulang] = useState([]);
  const [dataInspeksi, setDataInspeksi] = useState([]);
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();
  const { sendCriticalNotification, sendTestNotification } =
    useNotificationSystem();

  // Memoized ULP options
  const availableUlp = useMemo(() => {
    const ulpSet = new Set();
    dataPenyulang.forEach((item) => {
      if (item.ulp && item.ulp.trim()) {
        ulpSet.add(item.ulp.trim());
      }
    });
    return Array.from(ulpSet)
      .sort()
      .map((ulp) => ({
        value: ulp,
        label: ulp,
      }));
  }, [dataPenyulang]);

  // Map markers untuk pohon dengan prediksi UPDATED
  const mapMarkers = useMemo(() => {
    return dataInspeksi
      .filter((item) => item.koordinat)
      .map((item) => {
        const [lat, lng] = item.koordinat
          .split(",")
          .map((coord) => parseFloat(coord.trim()));

        const prediction = getTreePrediction(item);

        return {
          position: [lat, lng],
          title: `${item.jenisPohon} - ${item.lokasi}`,
          description: `Prediksi Inspektur: ${item.prediksiInspektur} | Status: ${item.status} | Sisa: ${prediction.displayFormat.text}`,
          image: item.fotoSebelumURL,
          data: {
            ...item,
            prediction,
          },
        };
      });
  }, [dataInspeksi]);

  // Enhanced table columns dengan prediksi baru
  const tableColumns = [
    {
      key: "tglInspeksi",
      label: "Tanggal",
      icon: Calendar,
      type: "date",
      sortable: true,
    },
    {
      key: "ulp",
      label: "ULP",
      icon: Users,
      sortable: true,
    },
    {
      key: "jenisPohon",
      label: "Jenis Pohon",
      icon: TreePine,
      sortable: true,
    },
    {
      key: "lokasi",
      label: "Lokasi",
      icon: MapPin,
      sortable: true,
    },
    {
      key: "tinggiPohon",
      label: "Tinggi",
      icon: Ruler,
      sortable: true,
      render: (value) => `${value || "-"}m`,
    },
    {
      key: "jarakKeJaringan",
      label: "Jarak",
      icon: Ruler,
      sortable: true,
      render: (value) => `${value || "-"}m`,
    },
    {
      key: "tingkatRisiko",
      label: "Risiko Saat Ini",
      icon: AlertTriangle,
      sortable: true,
      render: (value) => {
        const colors = {
          Rendah: "bg-green-500",
          Sedang: "bg-yellow-500",
          Tinggi: "bg-orange-500",
          "Sangat Tinggi": "bg-red-500",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-white text-xs ${
              colors[value] || "bg-gray-500"
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "petugas",
      label: "Petugas",
      icon: Users,
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
    },
    {
      key: "fotoSebelumURL",
      label: "Foto",
      type: "image",
    },
  ];

  // Fetch data functions
  const fetchPenyulangData = useCallback(async () => {
    try {
      console.log("=== FETCHING PENYULANG DATA ===");
      const querySnapshot = await getDocs(collection(db, "penyulang"));
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched penyulang data:", fetchedData.length, "items");
      setDataPenyulang(fetchedData);
    } catch (error) {
      console.error("Error fetching penyulang data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data penyulang",
      });
    }
  }, [toast]);

  const fetchInspeksiData = useCallback(async () => {
    try {
      console.log("=== FETCHING INSPEKSI POHON DATA ===");
      const querySnapshot = await getDocs(collection(db, "inspeksi_pohon"));
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched inspeksi pohon data:", fetchedData.length, "items");
      setDataInspeksi(fetchedData);
    } catch (error) {
      console.error("Error fetching inspeksi pohon data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data inspeksi pohon",
      });
    }
  }, [toast]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingData(true);
      await Promise.all([fetchPenyulangData(), fetchInspeksiData()]);
      setIsLoadingData(false);
    };

    initializeData();
  }, [fetchPenyulangData, fetchInspeksiData]);

  // Geolocation
  useEffect(() => {
    const getCurrentLocation = () => {
      console.log("=== GETTING CURRENT LOCATION ===");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            console.log("Location obtained:", newLocation);
            setLocation(newLocation);
          },
          (err) => {
            console.error("Geolocation error:", err);
            setError(`Gagal mendapatkan lokasi: ${err.message}`);
            setLocation({ lat: -8.5069, lng: 116.3094 }); // Default ke Mataram
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      } else {
        const errorMsg = "Geolocation tidak didukung oleh browser ini";
        console.error(errorMsg);
        setError(errorMsg);
        setLocation({ lat: -8.5069, lng: 116.3094 });
      }
    };

    getCurrentLocation();
  }, []);

  // Upload image to Firebase Storage
  const uploadImage = useCallback(async (file, path) => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const imageRef = ref(storage, `${path}/${timestamp}_${file.name}`);
      const uploadTask = uploadBytesResumable(imageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progressPercentage =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercentage);
        },
        (error) => {
          console.error("Error uploading file:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }, []);

  // UPDATED: Send WhatsApp message dengan prediksi baru
  const sendWhatsAppMessage = useCallback(
    (message, imageUrl) => {
      try {
        const groupId = "120363277434509822"; // Ganti dengan ID grup WhatsApp
        const encodedMessage = encodeURIComponent(
          `${message}\n\n📸 Foto: ${imageUrl}`
        );
        const whatsappUrl = `https://api.whatsapp.com/send?phone=&text=${encodedMessage}&group_id=${groupId}`;
        window.open(whatsappUrl, "_blank");
      } catch (error) {
        console.error("Error opening WhatsApp:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal membuka WhatsApp",
        });
      }
    },
    [toast]
  );

  // UPDATED: Handle form submission dengan sistem notifikasi baru
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        setIsLoading(true);
        setProgress(0);

        console.log("=== UPLOADING INSPEKSI POHON ===");

        // Upload foto sebelum
        let fotoSebelumURL = "";
        if (formData.fotoSebelum) {
          console.log("Uploading foto sebelum...");
          fotoSebelumURL = await uploadImage(
            formData.fotoSebelum,
            "inspeksi_pohon/sebelum"
          );
        }

        // Upload foto sesudah (jika ada)
        let fotoSesudahURL = "";
        if (formData.fotoSesudah) {
          console.log("Uploading foto sesudah...");
          fotoSesudahURL = await uploadImage(
            formData.fotoSesudah,
            "inspeksi_pohon/sesudah"
          );
        }

        // Prepare document data dengan prediksi inspektur
        const docData = {
          ulp: formData.ulp,
          jenisPohon: formData.jenisPohon,
          lokasi: formData.lokasi,
          deskripsi: formData.deskripsi,
          tinggiPohon: formData.tinggiPohon,
          jarakKeJaringan: formData.jarakKeJaringan,
          prediksiInspektur: formData.prediksiInspektur, // NEW
          tingkatRisiko: formData.tingkatRisiko,
          tindakanRekomendasi: formData.tindakanRekomendasi,
          petugas: formData.petugas,
          tglInspeksi: formData.tglInspeksi,
          koordinat: formData.koordinat,
          fotoSebelumURL,
          fotoSesudahURL,
          status: formData.status,
          createdAt: formData.createdAt,
          updatedAt: new Date().toISOString(),
        };

        // Save to Firestore
        console.log("Saving to Firestore...");
        await addDoc(collection(db, "inspeksi_pohon"), docData);

        // Calculate prediction untuk notifikasi
        const prediction = getTreePrediction(docData);

        // UPDATED: Prepare WhatsApp message dengan prediksi baru
        const message = `🌳 INSPEKSI POHON BARU 🌳
🔹 Jenis: ${formData.jenisPohon}
📍 Lokasi: ${formData.lokasi}
🏢 ULP: ${formData.ulp}
⚠️ Risiko Saat Ini: ${formData.tingkatRisiko}
📏 Tinggi: ${formData.tinggiPohon}m
📐 Jarak ke Jaringan: ${formData.jarakKeJaringan}m
🔮 Prediksi Inspektur: ${formData.prediksiInspektur}
📅 Tgl Inspeksi: ${formData.tglInspeksi}
👷‍♂️ Petugas: ${formData.petugas}
📍 Koordinat: ${formData.koordinat}

📊 ANALISIS SISTEM:
⏰ Sisa Waktu: ${prediction.displayFormat.fullText}
🚨 Status Bahaya: ${prediction.warningLevel.text}
${prediction.needsAction ? "🔧 PERLU TINDAKAN SEGERA!" : "✅ Monitoring rutin"}

${prediction.isCritical ? "🚨 EKSEKUSI HARI INI!" : ""}`;

        // Send WhatsApp notification
        if (fotoSebelumURL) {
          sendWhatsAppMessage(message, fotoSebelumURL);
        }

        // UPDATED: Check for critical findings dan auto-trigger bot
        if (prediction.shouldTriggerBot) {
          console.log(
            "🚨 CRITICAL FINDING DETECTED - Triggering bot notification"
          );
          await sendCriticalNotification(docData);

          toast({
            variant: "destructive",
            title: "⚠️ Temuan Kritis!",
            description:
              "Notifikasi bot telah dikirim untuk temuan sangat berbahaya",
          });
        }

        // Refresh data and show success
        await fetchInspeksiData();
        setProgress(0);

        toast({
          variant: "default",
          title: "Berhasil",
          description: "Data inspeksi pohon berhasil disimpan",
        });

        // Switch to table tab
        setActiveTab("table");
      } catch (error) {
        console.error("Error saving inspeksi pohon:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menyimpan data inspeksi pohon",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      uploadImage,
      sendWhatsAppMessage,
      sendCriticalNotification,
      fetchInspeksiData,
      toast,
    ]
  );

  // UPDATED: Action handlers dengan prediksi baru
  const handleViewDetail = useCallback(
    (row) => {
      const prediction = getTreePrediction(row);

      const detailInfo = `
Detail Inspeksi Pohon:
- Lokasi: ${row.lokasi}
- Jenis: ${row.jenisPohon}
- Tinggi: ${row.tinggiPohon}m
- Jarak ke Jaringan: ${row.jarakKeJaringan}m
- Prediksi Inspektur: ${row.prediksiInspektur}
- Sisa Waktu: ${prediction.displayFormat.fullText}
- Status Bahaya: ${prediction.warningLevel.text}
- Rekomendasi: ${
        prediction.needsAction ? "Perlu tindakan segera" : "Monitoring rutin"
      }
    `;

      toast({
        title: "Detail Inspeksi Pohon",
        description: detailInfo,
      });
    },
    [toast]
  );

  const handleEdit = useCallback(
    (row) => {
      console.log("Edit:", row);
      toast({
        title: "Edit",
        description: "Fitur edit akan segera tersedia",
      });
    },
    [toast]
  );

  const handleDelete = useCallback(
    async (row) => {
      if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        return;
      }

      try {
        await deleteDoc(doc(db, "inspeksi_pohon", row.id));
        await fetchInspeksiData();

        toast({
          title: "Berhasil",
          description: "Data berhasil dihapus",
        });
      } catch (error) {
        console.error("Error deleting data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menghapus data",
        });
      }
    },
    [fetchInspeksiData, toast]
  );

  // UPDATED: Handle urgent action dengan sistem notifikasi baru
  const handleUrgentAction = useCallback(
    (row) => {
      // const prediction = getTreePrediction(row);

      const urgentMessage = generateBotNotificationMessage(row);

      // Send urgent WhatsApp notification
      sendWhatsAppMessage(urgentMessage, row.fotoSebelumURL);

      toast({
        title: "Notifikasi Urgent Terkirim",
        description: "Tim lapangan akan segera mengambil tindakan",
      });
    },
    [sendWhatsAppMessage, toast]
  );

  // NEW: Test notification handlers
  const handleTestDailyNotification = useCallback(async () => {
    const success = await sendTestNotification("daily");
    toast({
      title: success ? "Test Berhasil" : "Test Gagal",
      description: success
        ? "Test notifikasi harian berhasil dikirim"
        : "Gagal mengirim test notifikasi",
      variant: success ? "default" : "destructive",
    });
  }, [sendTestNotification, toast]);

  const handleTestCriticalNotification = useCallback(async () => {
    const success = await sendTestNotification("critical");
    toast({
      title: success ? "Test Berhasil" : "Test Gagal",
      description: success
        ? "Test notifikasi kritis berhasil dikirim"
        : "Gagal mengirim test notifikasi",
      variant: success ? "default" : "destructive",
    });
  }, [sendTestNotification, toast]);

  // Enhanced table actions dengan prediksi baru
  const tableActions = [
    {
      icon: Eye,
      label: "Detail",
      variant: "outline",
      onClick: (row) => handleViewDetail(row),
    },
    {
      icon: Edit,
      label: "Edit",
      variant: "default",
      onClick: (row) => handleEdit(row),
    },
    {
      icon: AlertTriangle,
      label: "Urgent",
      variant: "destructive",
      onClick: (row) => handleUrgentAction(row),
      show: (row) => {
        const prediction = getTreePrediction(row);
        return prediction.needsAction;
      },
    },
    {
      icon: Trash2,
      label: "Hapus",
      variant: "destructive",
      onClick: (row) => handleDelete(row),
    },
  ];

  // UPDATED: Enhanced export dengan prediksi baru
  const handleExportData = useCallback(() => {
    const dataWithPrediction = dataInspeksi.map((row) => {
      const prediction = getTreePrediction(row);
      return {
        ...row,
        prediksi_inspektur: row.prediksiInspektur,
        sisa_hari: prediction.sisaHari,
        status_prediksi: prediction.warningLevel.level,
        tingkat_bahaya: prediction.warningLevel.text,
        perlu_tindakan: prediction.needsAction ? "Ya" : "Tidak",
        kritis: prediction.isCritical ? "Ya" : "Tidak",
        rekomendasi: prediction.needsAction
          ? "Tindakan Segera"
          : "Monitoring Rutin",
      };
    });

    const headers = [
      "ID",
      "Tanggal Inspeksi",
      "ULP",
      "Jenis Pohon",
      "Lokasi",
      "Tinggi Pohon",
      "Jarak ke Jaringan",
      "Prediksi Inspektur",
      "Tingkat Risiko",
      "Petugas",
      "Status",
      "Sisa Hari",
      "Status Prediksi",
      "Tingkat Bahaya",
      "Perlu Tindakan",
      "Kritis",
      "Rekomendasi",
    ];

    const csv = [
      headers.join(","),
      ...dataWithPrediction.map((row) =>
        [
          row.id,
          row.tglInspeksi,
          row.ulp,
          row.jenisPohon,
          row.lokasi,
          row.tinggiPohon,
          row.jarakKeJaringan,
          row.prediksi_inspektur,
          row.tingkatRisiko,
          row.petugas,
          row.status,
          row.sisa_hari,
          row.status_prediksi,
          row.tingkat_bahaya,
          row.perlu_tindakan,
          row.kritis,
          row.rekomendasi,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inspeksi_pohon_dengan_prediksi_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [dataInspeksi]);

  // Get urgent trees yang perlu notifikasi
  const urgentTrees = useMemo(() => {
    return getTreesNeedingAction(dataInspeksi);
  }, [dataInspeksi]);

  // UPDATED: Auto-check untuk urgent notifications
  const checkUrgentNotifications = useCallback(() => {
    const criticalTrees = urgentTrees.filter(
      (tree) => tree.prediction.isCritical || tree.prediction.isUrgent
    );

    if (criticalTrees.length > 0) {
      const criticalCount = criticalTrees.filter(
        (t) => t.prediction.isCritical
      ).length;
      const urgentCount = criticalTrees.filter(
        (t) => t.prediction.isUrgent && !t.prediction.isCritical
      ).length;

      toast({
        variant: "destructive",
        title: `⚠️ ${criticalTrees.length} Pohon Perlu Tindakan Segera!`,
        description: `${criticalCount} Sangat Berbahaya (< 1 hari), ${urgentCount} Waspada (< 5 hari)`,
      });
    }
  }, [urgentTrees, toast]);

  // Check urgent notifications saat data berubah
  useEffect(() => {
    if (dataInspeksi.length > 0) {
      checkUrgentNotifications();
    }
  }, [dataInspeksi, checkUrgentNotifications]);

  // Loading state
  if (isLoadingData) {
    return (
      <Layouts className="px-2">
        <div className="fixed top-0 right-0 bg-main text-white px-4 py-2 h-16 w-full z-10 flex items-center justify-center bg-gradient-to-r from-main to-green-500 font-semibold">
          <div className="text-center w-full">INSPEKSI POHON</div>
        </div>
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 p-8">
            <CardContent className="text-center">
              <div className="w-12 h-12 border-4 border-main/20 border-t-main rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-main font-semibold">Memuat data...</p>
            </CardContent>
          </Card>
        </div>
      </Layouts>
    );
  }

  return (
    <Layouts className="md:px-96 px-4">
      <div className="fixed top-0 right-0 bg-main text-white px-4 py-2 h-16 w-full z-10 flex items-center justify-center bg-gradient-to-r from-main to-green-500 font-semibold">
        <div className="text-center w-full">INSPEKSI POHON</div>
      </div>

      <div className="pt-20 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Form Inspeksi
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Peta Pohon
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Data & Prediksi
              {urgentTrees.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {urgentTrees.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Form Tab */}
          <TabsContent value="form" className="space-y-6">
            <TreeInspectionForm
              onSubmit={handleFormSubmit}
              loading={isLoading}
              ulpOptions={availableUlp}
              location={location}
            />

            {/* Progress Bar */}
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-main h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <FormCard>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TreePine className="w-5 h-5" />
                    Peta Sebaran Pohon dengan Prediksi
                  </h3>
                  <div className="text-sm text-gray-600">
                    Total: {mapMarkers.length} titik | Urgent:{" "}
                    {urgentTrees.length}
                  </div>
                </div>

                {mapMarkers.length > 0 ? (
                  <MapComponent
                    center={
                      mapMarkers.length > 0
                        ? mapMarkers[0].position
                        : [location.lat, location.lng]
                    }
                    markers={mapMarkers}
                    height="800px"
                    scrollWheelZoom={true}
                  />
                ) : (
                  <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center text-gray-500">
                      <TreePine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada data inspeksi pohon</p>
                    </div>
                  </div>
                )}

                {/* UPDATED: Enhanced Legend dengan prediction colors baru */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-700 rounded"></div>
                    <span className="text-sm">
                      Sangat Berbahaya (&lt;1 hari)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-600 rounded"></div>
                    <span className="text-sm">Waspada (&lt;5 hari)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                    <span className="text-sm">Perhatian (5-7 hari)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm">Monitoring (7-30 hari)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm">Aman (&gt;30 hari)</span>
                  </div>
                </div>
              </div>
            </FormCard>
          </TabsContent>

          {/* UPDATED: Enhanced Table Tab dengan prediksi dan notification system */}
          <TabsContent value="table" className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Data Inspeksi dengan Prediksi Baru
                {urgentTrees.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {urgentTrees.length} Perlu Tindakan
                  </Badge>
                )}
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleTestDailyNotification}
                  variant="outline"
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Test Harian
                </Button>
                <Button
                  onClick={handleTestCriticalNotification}
                  variant="outline"
                  size="sm"
                >
                  <BellRing className="w-4 h-4 mr-2" />
                  Test Kritis
                </Button>
                <Button
                  onClick={checkUrgentNotifications}
                  variant="outline"
                  size="sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Cek Urgent
                </Button>
                <Button onClick={handleExportData} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <EnhancedDataTable
              data={dataInspeksi}
              columns={tableColumns}
              title="Hasil Inspeksi Pohon dengan Prediksi Baru"
              searchable={true}
              filterable={true}
              actions={tableActions}
              onRowClick={handleViewDetail}
              showPrediction={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layouts>
  );
};

export default InspeksiPohon;
