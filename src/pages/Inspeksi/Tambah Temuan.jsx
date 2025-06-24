import { useEffect, useState, useCallback, useMemo } from "react";
import { db, storage } from "@/firebase/firebaseConfig";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Upload, Camera, FileText, Users, Zap } from "lucide-react";
import Layouts from "../admin/Layouts";

const TambahTemuan = () => {
  // State untuk form inputs
  const [image, setImage] = useState(null);
  const [temuan, setTemuan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [noGardu, setNoGardu] = useState("");
  const [inspektor, setInspektor] = useState("");
  const [selectedUlp, setSelectedUlp] = useState("");
  const [penyulang, setPenyulang] = useState("");
  const [category, setCategory] = useState("");
  const [tglInspeksi, setTglInspeksi] = useState("");

  // State untuk UI dan loading
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [error, setError] = useState(null);

  // State untuk data collections
  const [dataPenyulang, setDataPenyulang] = useState([]);
  const [dataGardu, setDataGardu] = useState([]);
  const [filteredGardu, setFilteredGardu] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Memoized constants
  const availableUlp = useMemo(() => {
    const ulpSet = new Set();
    dataPenyulang.forEach((item) => {
      if (item.ulp && item.ulp.trim()) {
        ulpSet.add(item.ulp.trim());
      }
    });
    return Array.from(ulpSet).sort();
  }, [dataPenyulang]);

  // Filter penyulang berdasarkan ULP yang dipilih
  const filteredPenyulang = useMemo(() => {
    if (!selectedUlp) return [];
    return dataPenyulang.filter(
      (item) => item.ulp && item.ulp.trim() === selectedUlp
    );
  }, [dataPenyulang, selectedUlp]);

  // Fetch data penyulang dari Firestore
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

  // Fetch data gardu dari JSON
  const fetchGarduData = useCallback(async () => {
    try {
      console.log("=== FETCHING GARDU DATA ===");
      const response = await fetch("/db/amg.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched gardu data:", data.length, "items");
      setDataGardu(data);
    } catch (error) {
      console.error("Error fetching gardu data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data gardu",
      });
    }
  }, [toast]);

  // Initial data fetching
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingData(true);
      await Promise.all([fetchPenyulangData(), fetchGarduData()]);
      setIsLoadingData(false);
    };

    initializeData();
  }, [fetchPenyulangData, fetchGarduData]);

  // Debounced search untuk gardu
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (noGardu && noGardu.trim().length > 2) {
        const filtered = dataGardu.filter(
          (item) =>
            item.nama && item.nama.toLowerCase().includes(noGardu.toLowerCase())
        );
        setFilteredGardu(filtered.slice(0, 10)); // Limit to 10 results
      } else {
        setFilteredGardu([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [noGardu, dataGardu]);

  // Geolocation handling
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
            // Set default location (contoh: lokasi kantor)
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
        setLocation({ lat: -8.5069, lng: 116.3094 }); // Default location
      }
    };

    getCurrentLocation();
  }, []);

  // Handle image selection dan preview
  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validasi tipe file
        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "File harus berupa gambar",
          });
          return;
        }

        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Ukuran file maksimal 5MB",
          });
          return;
        }

        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [toast]
  );

  // Handle ULP selection
  const handleUlpChange = useCallback((value) => {
    console.log("ULP selected:", value);
    if (value === "no-ulp-available") return; // Ignore disabled option
    setSelectedUlp(value);
    setPenyulang(""); // Reset penyulang selection
  }, []);

  // Handle gardu selection
  const handleGarduSelect = useCallback((gardu) => {
    console.log("Gardu selected:", gardu);
    setNoGardu(gardu.nama);
    setFilteredGardu([]);
  }, []);

  // Send WhatsApp message
  const sendWhatsAppMessage = useCallback(
    (message, imageUrl) => {
      try {
        const groupId = "120363277434509822"; // Ganti dengan ID grup WhatsApp Anda
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

  // Form validation
  const validateForm = useCallback(() => {
    const requiredFields = {
      temuan: "Temuan",
      image: "Foto",
      lokasi: "Lokasi",
      inspektor: "Inspektor",
      selectedUlp: "ULP",
      penyulang: "Penyulang",
      category: "Kategori",
      tglInspeksi: "Tanggal Inspeksi",
    };

    const formData = {
      temuan,
      image,
      lokasi,
      inspektor,
      selectedUlp,
      penyulang,
      category,
      tglInspeksi,
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        toast({
          variant: "destructive",
          title: "Validasi Error",
          description: `${label} harus diisi`,
        });
        return false;
      }
    }

    if (!location.lat || !location.lng) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Lokasi belum diperoleh",
      });
      return false;
    }

    return true;
  }, [
    temuan,
    image,
    lokasi,
    inspektor,
    selectedUlp,
    penyulang,
    category,
    tglInspeksi,
    location,
    toast,
  ]);

  // Handle form submission
  const handleSubmitTemuan = useCallback(
    async (e) => {
      e.preventDefault();
      console.log("=== FORM SUBMISSION STARTED ===");

      if (!validateForm()) {
        return;
      }

      try {
        setIsLoading(true);
        setProgress(0);

        // Upload image ke Firebase Storage
        console.log("Uploading image...");
        const timestamp = Date.now();
        const imageRef = ref(storage, `temuan/${timestamp}_${image.name}`);
        const uploadTask = uploadBytesResumable(imageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progressPercentage =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progressPercentage);
            console.log(`Upload progress: ${progressPercentage.toFixed(1)}%`);
          },
          (error) => {
            console.error("Error uploading file:", error);
            setIsLoading(false);
            toast({
              variant: "destructive",
              title: "Error Upload",
              description: "Gagal mengupload gambar",
            });
          },
          async () => {
            try {
              // Get download URL
              const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("Image uploaded successfully:", imageUrl);

              // Save to Firestore
              console.log("Saving to Firestore...");
              const docData = {
                imageUrl,
                temuan,
                lokasi,
                noGardu,
                inspektor,
                ulp: selectedUlp,
                penyulang,
                category,
                tglInspeksi,
                status: "Temuan",
                imageEksekusiURL: "",
                eksekutor: "",
                tglEksekusi: "",
                keterangan: "",
                location: `${location.lat}, ${location.lng}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              await addDoc(collection(db, "inspeksi"), docData);
              console.log("Data saved to Firestore successfully");

              // Prepare WhatsApp message
              const message = `📢 TEMUAN BARU 📢
🔹 Temuan: ${temuan}
📍 Lokasi: ${lokasi}
🏢 ULP: ${selectedUlp}
🔌 Penyulang: ${penyulang}
🏗️ Kategori: ${category}
📅 Tgl Inspeksi: ${tglInspeksi}
👷‍♂️ Inspektor: ${inspektor}
📍 Koordinat: ${location.lat}, ${location.lng}`;

              // Send WhatsApp message
              sendWhatsAppMessage(message, imageUrl);

              // Reset form
              setTemuan("");
              setLokasi("");
              setNoGardu("");
              setInspektor("");
              setSelectedUlp("");
              setPenyulang("");
              setCategory("");
              setTglInspeksi("");
              setImage(null);
              setProgress(0);
              setPreview(null);

              toast({
                variant: "default",
                title: "Berhasil",
                description: "Temuan berhasil disimpan",
              });

              // Navigate back
              navigate("/tambahTemuan");
            } catch (firestoreError) {
              console.error("Error saving to Firestore:", firestoreError);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Gagal menyimpan data",
              });
            } finally {
              setIsLoading(false);
            }
          }
        );
      } catch (error) {
        console.error("Error in form submission:", error);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Terjadi kesalahan saat menyimpan",
        });
      }
    },
    [
      validateForm,
      image,
      temuan,
      lokasi,
      noGardu,
      inspektor,
      selectedUlp,
      penyulang,
      category,
      tglInspeksi,
      location,
      sendWhatsAppMessage,
      toast,
      navigate,
    ]
  );

  // Loading state untuk data initialization
  if (isLoadingData) {
    return (
      <Layouts className="px-2">
        <div className="fixed top-0 right-0 bg-main text-white px-4 py-2 h-16 w-full z-10 flex items-center justify-center bg-gradient-to-r from-main to-blue-500 font-semibold">
          <div className="text-center w-full">INPUT TEMUAN</div>
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
    <Layouts className="md:px-96 px-2">
      <div className="fixed top-0 right-0 bg-main text-white px-4 py-2 h-16 w-full z-10 flex items-center justify-center bg-gradient-to-r from-main to-blue-500 font-semibold">
        <div className="text-center w-full">INPUT TEMUAN</div>
      </div>

      <form onSubmit={handleSubmitTemuan} className="pt-20">
        <div className="grid gap-6 py-4 px-4 max-w-5xl mx-auto space-y-6">
          {/* Foto Upload */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="image"
                  className="text-right flex items-center gap-4"
                >
                  <Camera className="w-4 h-4" />
                  Foto
                </Label>
                <div className="col-span-3">
                  <Input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-main file:text-white hover:file:bg-main/80"
                  />
                </div>
              </div>
              {preview && (
                <div className="grid grid-cols-4 items-center mt-4">
                  <div className="text-right"></div>
                  <div className="col-span-3">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border border-white/20"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Fields */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-4 space-y-4">
              {/* Temuan */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="temuan"
                  className="text-right flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Temuan
                </Label>
                <Input
                  id="temuan"
                  value={temuan}
                  className="col-span-3"
                  placeholder="Deskripsikan temuan..."
                  onChange={(e) => setTemuan(e.target.value)}
                />
              </div>

              {/* Lokasi */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="lokasi"
                  className="text-right flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Lokasi
                </Label>
                <Input
                  id="lokasi"
                  value={lokasi}
                  className="col-span-3"
                  placeholder="Alamat lokasi temuan..."
                  onChange={(e) => setLokasi(e.target.value)}
                />
              </div>

              {/* ULP Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  ULP
                </Label>
                <Select value={selectedUlp} onValueChange={handleUlpChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih ULP..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUlp.length > 0 ? (
                      availableUlp.map((ulp) => (
                        <SelectItem key={ulp} value={ulp}>
                          {ulp}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-ulp-available" disabled>
                        Tidak ada ULP tersedia
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Penyulang Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Penyulang
                </Label>
                <Select
                  value={penyulang}
                  onValueChange={setPenyulang}
                  disabled={!selectedUlp}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue
                      placeholder={
                        selectedUlp
                          ? "Pilih Penyulang..."
                          : "Pilih ULP terlebih dahulu"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPenyulang.length > 0 ? (
                      filteredPenyulang.map((item) => (
                        <SelectItem key={item.id} value={item.penyulang}>
                          {item.penyulang}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-penyulang-available" disabled>
                        {selectedUlp
                          ? "Tidak ada penyulang tersedia"
                          : "Pilih ULP terlebih dahulu"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Gardu Search */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Gardu</Label>
                <div className="col-span-3 relative">
                  <Input
                    type="text"
                    placeholder="Cari Gardu..."
                    value={noGardu}
                    onChange={(e) => setNoGardu(e.target.value)}
                    className="w-full"
                  />
                  {filteredGardu.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                      {filteredGardu.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleGarduSelect(item)}
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                        >
                          <div className="font-semibold">{item.nama}</div>
                          <div className="text-sm text-gray-600">
                            {item.alamat}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location Display */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Koordinat</Label>
                <Input
                  type="text"
                  value={
                    location.lat && location.lng
                      ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                      : "Mengambil lokasi..."
                  }
                  className="col-span-3"
                  readOnly
                />
              </div>
              {error && (
                <div className="col-span-4 text-red-500 text-sm">{error}</div>
              )}

              {/* Map */}
              {location.lat && location.lng && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Map</Label>
                  <div className="col-span-3">
                    <div className="h-48 w-full rounded-lg overflow-hidden border border-white/20">
                      <MapContainer
                        key={`${location.lat}-${location.lng}`}
                        center={[location.lat, location.lng]}
                        zoom={15}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[location.lat, location.lng]}>
                          <Popup>Lokasi Anda</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Inspektor */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inspektor" className="text-right">
                  Inspektor
                </Label>
                <Input
                  id="inspektor"
                  value={inspektor}
                  className="col-span-3"
                  placeholder="Nama inspektor..."
                  onChange={(e) => setInspektor(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Kategori</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JTM">JTM</SelectItem>
                    <SelectItem value="JTR">JTR</SelectItem>
                    <SelectItem value="Gardu">Gardu</SelectItem>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Inspeksi */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tglInspeksi" className="text-right">
                  Tgl Inspeksi
                </Label>
                <Input
                  type="date"
                  id="tglInspeksi"
                  value={tglInspeksi}
                  className="col-span-3"
                  onChange={(e) => setTglInspeksi(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-main hover:bg-main/80 text-white py-3"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Simpan Temuan</span>
              </div>
            )}
          </Button>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-main h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </form>

      <div className="h-24"></div>
    </Layouts>
  );
};

export default TambahTemuan;
