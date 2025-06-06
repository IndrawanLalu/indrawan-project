import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Layouts from "@/pages/admin/Layouts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Save,
  ArrowLeft,
  Zap,
  Clock,
  AlertTriangle,
  Activity,
  CheckCircle,
  Loader2,
  Database,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TambahGangguan = () => {
  const nav = useNavigate();
  const [noGangguanAPKT, setNoGangguanAPKT] = useState("");
  const [keypoint, setKeypoint] = useState("");
  const [penyulang, setPenyulang] = useState("");
  const [fasilitasPadam, setFasilitasPadam] = useState("");
  const [jamPadam, setJamPadam] = useState("");
  const [jamNyala, setJamNyala] = useState("");
  const [durasi, setDurasi] = useState("");
  const [tanggalGangguan, setTanggalGangguan] = useState("");
  const [indikasi, setIndikasi] = useState("");
  const [kodeGangguan, setKodeGangguan] = useState("");
  const [arusR, setArusR] = useState("");
  const [arusS, setArusS] = useState("");
  const [arusT, setArusT] = useState("");
  const [arusN, setArusN] = useState("");
  const [penyebab, setPenyebab] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [data, setData] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "penyulang"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!keypoint) newErrors.keypoint = "Key Point harus diisi";
    if (!penyulang) newErrors.penyulang = "Penyulang harus dipilih";
    if (!fasilitasPadam)
      newErrors.fasilitasPadam = "Fasilitas Padam harus diisi";
    if (!jamPadam) newErrors.jamPadam = "Jam Padam harus diisi";
    if (!jamNyala) newErrors.jamNyala = "Jam Nyala harus diisi";
    if (!durasi) newErrors.durasi = "Durasi harus diisi";
    if (!tanggalGangguan)
      newErrors.tanggalGangguan = "Tanggal Gangguan harus diisi";
    if (!indikasi) newErrors.indikasi = "Indikasi harus diisi";
    if (!kodeGangguan) newErrors.kodeGangguan = "Kode Gangguan harus diisi";
    if (!arusR) newErrors.arusR = "Arus R harus diisi";
    if (!arusS) newErrors.arusS = "Arus S harus diisi";
    if (!arusT) newErrors.arusT = "Arus T harus diisi";
    if (!arusN) newErrors.arusN = "Arus N harus diisi";
    if (!penyebab) newErrors.penyebab = "Penyebab harus diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitGangguan = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Mohon lengkapi semua field yang diperlukan",
      });
      return;
    }

    try {
      setIsLoading(true);

      await addDoc(collection(db, "gangguanPenyulang"), {
        noGangguanAPKT,
        keypoint,
        penyulang,
        fasilitasPadam,
        jamPadam,
        jamNyala,
        durasi,
        tanggalGangguan,
        indikasi,
        kodeGangguan,
        arusR,
        arusS,
        arusT,
        arusN,
        penyebab,
      });

      // Reset form
      setKeypoint("");
      setNoGangguanAPKT("");
      setPenyulang("");
      setFasilitasPadam("");
      setJamPadam("");
      setJamNyala("");
      setDurasi("");
      setTanggalGangguan("");
      setIndikasi("");
      setKodeGangguan("");
      setArusR("");
      setArusS("");
      setArusT("");
      setArusN("");
      setPenyebab("");
      setErrors({});
      setIsLoading(false);

      toast({
        variant: "success",
        title: "Success",
        description: "Data Berhasil disimpan",
      });

      setShowSuccess(true);
      // nav("/admin/gangguanPenyulang"); // Redirect would happen here in real app
    } catch (error) {
      console.error("Error uploading data: ", error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan data. Silakan coba lagi.",
      });
    }
  };

  const getFieldCount = () => {
    const fields = [
      noGangguanAPKT,
      keypoint,
      penyulang,
      fasilitasPadam,
      jamPadam,
      jamNyala,
      durasi,
      tanggalGangguan,
      indikasi,
      kodeGangguan,
      arusR,
      arusS,
      arusT,
      arusN,
      penyebab,
    ];
    return fields.filter((field) => field && field.toString().trim() !== "")
      .length;
  };

  const totalFields = 15;
  const completedFields = getFieldCount();
  const progressPercentage = (completedFields / totalFields) * 100;

  return (
    <Layouts>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-700 via-purple-950 to-slate-700">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
          </div>
        </div>

        <div className="relative z-10 p-6 space-y-6">
          {/* Modern Header */}
          <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/25">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

            <CardHeader className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Input Gangguan Penyulang
                    </h1>
                    <p className="text-white/60 text-sm flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span>Tambah data gangguan baru</span>
                      <span className="text-white/40">•</span>
                      <span>
                        {completedFields}/{totalFields} field terisi
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => nav("/admin/gangguanPenyulang")}
                    variant="ghost"
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/20"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Progress Bar */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">
                  Progress Pengisian
                </span>
                <span className="text-sm text-white/70">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {showSuccess && (
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-green-300 font-semibold">
                      Data Berhasil Disimpan!
                    </h3>
                    <p className="text-green-200/80 text-sm">
                      Data gangguan penyulang telah berhasil ditambahkan ke
                      database.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Form */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* General Information */}
              <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Informasi Umum</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      No. Gangguan APKT
                    </Label>
                    <Input
                      value={noGangguanAPKT}
                      onChange={(e) => setNoGangguanAPKT(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50"
                      placeholder="Masukkan nomor gangguan APKT"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      Key Point *
                    </Label>
                    <Input
                      value={keypoint}
                      onChange={(e) => setKeypoint(e.target.value)}
                      className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                        errors.keypoint ? "border-red-500/50" : ""
                      }`}
                      placeholder="Masukkan key point"
                    />
                    {errors.keypoint && (
                      <p className="text-red-400 text-sm">{errors.keypoint}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      Penyulang *
                    </Label>
                    <Select
                      onValueChange={(value) => setPenyulang(value)}
                      value={penyulang}
                    >
                      <SelectTrigger
                        className={`bg-white/5 border-white/20 text-white focus:border-orange-500/50 focus:ring-orange-500/50 ${
                          errors.penyulang ? "border-red-500/50" : ""
                        }`}
                      >
                        <SelectValue placeholder="Pilih Penyulang..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20">
                        {data.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.penyulang}
                            className="text-white hover:bg-white/10"
                          >
                            {item.penyulang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.penyulang && (
                      <p className="text-red-400 text-sm">{errors.penyulang}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      Fasilitas Padam *
                    </Label>
                    <Input
                      value={fasilitasPadam}
                      onChange={(e) => setFasilitasPadam(e.target.value)}
                      className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                        errors.fasilitasPadam ? "border-red-500/50" : ""
                      }`}
                      placeholder="Masukkan fasilitas padam"
                    />
                    {errors.fasilitasPadam && (
                      <p className="text-red-400 text-sm">
                        {errors.fasilitasPadam}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Time Information */}
              <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Informasi Waktu</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      Tanggal Gangguan *
                    </Label>
                    <Input
                      type="date"
                      value={tanggalGangguan}
                      onChange={(e) => setTanggalGangguan(e.target.value)}
                      className={`bg-white/5 border-white/20 text-white focus:border-orange-500/50 focus:ring-orange-500/50 ${
                        errors.tanggalGangguan ? "border-red-500/50" : ""
                      }`}
                    />
                    {errors.tanggalGangguan && (
                      <p className="text-red-400 text-sm">
                        {errors.tanggalGangguan}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium">
                        Jam Padam *
                      </Label>
                      <Input
                        type="time"
                        step="1"
                        value={jamPadam}
                        onChange={(e) => setJamPadam(e.target.value)}
                        className={`bg-white/5 border-white/20 text-white focus:border-orange-500/50 focus:ring-orange-500/50 ${
                          errors.jamPadam ? "border-red-500/50" : ""
                        }`}
                      />
                      {errors.jamPadam && (
                        <p className="text-red-400 text-sm">
                          {errors.jamPadam}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium">
                        Jam Nyala *
                      </Label>
                      <Input
                        type="time"
                        step="1"
                        value={jamNyala}
                        onChange={(e) => setJamNyala(e.target.value)}
                        className={`bg-white/5 border-white/20 text-white focus:border-orange-500/50 focus:ring-orange-500/50 ${
                          errors.jamNyala ? "border-red-500/50" : ""
                        }`}
                      />
                      {errors.jamNyala && (
                        <p className="text-red-400 text-sm">
                          {errors.jamNyala}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      Durasi *
                    </Label>
                    <Input
                      type="time"
                      step="1"
                      value={durasi}
                      onChange={(e) => setDurasi(e.target.value)}
                      className={`bg-white/5 border-white/20 text-white focus:border-orange-500/50 focus:ring-orange-500/50 ${
                        errors.durasi ? "border-red-500/50" : ""
                      }`}
                    />
                    {errors.durasi && (
                      <p className="text-red-400 text-sm">{errors.durasi}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Technical Details */}
              <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Detail Teknis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      Indikasi *
                    </Label>
                    <Input
                      value={indikasi}
                      onChange={(e) => setIndikasi(e.target.value)}
                      className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                        errors.indikasi ? "border-red-500/50" : ""
                      }`}
                      placeholder="Masukkan indikasi gangguan"
                    />
                    {errors.indikasi && (
                      <p className="text-red-400 text-sm">{errors.indikasi}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      Kode Gangguan *
                    </Label>
                    <Input
                      value={kodeGangguan}
                      onChange={(e) => setKodeGangguan(e.target.value)}
                      className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                        errors.kodeGangguan ? "border-red-500/50" : ""
                      }`}
                      placeholder="Masukkan kode gangguan"
                    />
                    {errors.kodeGangguan && (
                      <p className="text-red-400 text-sm">
                        {errors.kodeGangguan}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">
                      Penyebab *
                    </Label>
                    <Input
                      value={penyebab}
                      onChange={(e) => setPenyebab(e.target.value)}
                      className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                        errors.penyebab ? "border-red-500/50" : ""
                      }`}
                      placeholder="Masukkan penyebab gangguan"
                    />
                    {errors.penyebab && (
                      <p className="text-red-400 text-sm">{errors.penyebab}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Current Information */}
              <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Data Arus (A)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium">
                        Arus R *
                      </Label>
                      <Input
                        type="number"
                        value={arusR}
                        onChange={(e) => setArusR(e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                          errors.arusR ? "border-red-500/50" : ""
                        }`}
                        placeholder="0"
                      />
                      {errors.arusR && (
                        <p className="text-red-400 text-sm">{errors.arusR}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium">
                        Arus S *
                      </Label>
                      <Input
                        type="number"
                        value={arusS}
                        onChange={(e) => setArusS(e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                          errors.arusS ? "border-red-500/50" : ""
                        }`}
                        placeholder="0"
                      />
                      {errors.arusS && (
                        <p className="text-red-400 text-sm">{errors.arusS}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium">
                        Arus T *
                      </Label>
                      <Input
                        type="number"
                        value={arusT}
                        onChange={(e) => setArusT(e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                          errors.arusT ? "border-red-500/50" : ""
                        }`}
                        placeholder="0"
                      />
                      {errors.arusT && (
                        <p className="text-red-400 text-sm">{errors.arusT}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium">
                        Arus N *
                      </Label>
                      <Input
                        type="number"
                        value={arusN}
                        onChange={(e) => setArusN(e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-orange-500/50 focus:ring-orange-500/50 ${
                          errors.arusN ? "border-red-500/50" : ""
                        }`}
                        placeholder="0"
                      />
                      {errors.arusN && (
                        <p className="text-red-400 text-sm">{errors.arusN}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Section */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle
                      className={`w-5 h-5 ${
                        completedFields === totalFields
                          ? "text-green-400"
                          : "text-white/40"
                      }`}
                    />
                    <span className="text-white/70">
                      {completedFields === totalFields
                        ? "Siap untuk disimpan"
                        : `${totalFields - completedFields} field belum diisi`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => console.log("Navigate back to list")}
                    variant="ghost"
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/20"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Batal
                  </Button>

                  <Button
                    onClick={handleSubmitGangguan}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none min-w-[120px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span>Form Input Active</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span>Progress: {Math.round(progressPercentage)}%</span>
                  <span className="text-white/40">•</span>
                  <span>{data.length} penyulang tersedia</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-white/60">
                  <span>* Field wajib diisi</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layouts>
  );
};

export default TambahGangguan;
