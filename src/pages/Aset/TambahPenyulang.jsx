import { useState, useCallback } from "react";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Users,
  MapPin,
  TrendingUp,
  Calendar,
  Save,
  ArrowLeft,
  Building,
} from "lucide-react";
import Layouts from "@/pages/admin/Layouts";

const TambahPenyulang = () => {
  // State untuk form inputs
  const [ulp, setUlp] = useState("");
  const [penyulang, setPenyulang] = useState("");
  const [sumber, setSumber] = useState("");
  const [panjang, setPanjang] = useState("");
  const [beban, setBeban] = useState("");
  const [bebanSiang, setBebanSiang] = useState("");
  const [tglUpdate, setTglUpdate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Form validation
  const validateForm = useCallback(() => {
    const requiredFields = {
      ulp: "ULP",
      penyulang: "Penyulang",
      sumber: "Sumber GI/PLTD",
      panjang: "Panjang",
      beban: "Beban Malam",
      bebanSiang: "Beban Siang",
      tglUpdate: "Tanggal Update",
    };

    const formData = {
      ulp: ulp.trim(),
      penyulang: penyulang.trim(),
      sumber: sumber.trim(),
      panjang,
      beban,
      bebanSiang,
      tglUpdate,
    };

    // Check required fields
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field] === "") {
        toast({
          variant: "destructive",
          title: "Validasi Error",
          description: `${label} harus diisi`,
        });
        return false;
      }
    }

    // Validate numeric fields
    const numericFields = ["panjang", "beban", "bebanSiang"];
    for (const field of numericFields) {
      const value = parseFloat(formData[field]);
      if (isNaN(value) || value < 0) {
        toast({
          variant: "destructive",
          title: "Validasi Error",
          description: `${requiredFields[field]} harus berupa angka positif`,
        });
        return false;
      }
    }

    // Validate date
    const selectedDate = new Date(tglUpdate);
    const today = new Date();
    if (selectedDate > today) {
      toast({
        variant: "destructive",
        title: "Validasi Error",
        description: "Tanggal update tidak boleh melebihi hari ini",
      });
      return false;
    }

    return true;
  }, [ulp, penyulang, sumber, panjang, beban, bebanSiang, tglUpdate, toast]);

  // Handle form submission
  const handleSubmitPenyulang = useCallback(
    async (e) => {
      e.preventDefault();
      console.log("=== FORM SUBMISSION STARTED ===");

      if (!validateForm()) {
        return;
      }

      try {
        setIsLoading(true);

        const penyulangData = {
          ulp: ulp.trim(),
          penyulang: penyulang.trim(),
          sumber: sumber.trim(),
          Panjang: parseFloat(panjang),
          beban: parseFloat(beban),
          bebanSiang: parseFloat(bebanSiang),
          tglUpdate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log("Saving penyulang data:", penyulangData);

        await addDoc(collection(db, "penyulang"), penyulangData);
        console.log("Penyulang data saved successfully");

        // Reset form
        setUlp("");
        setPenyulang("");
        setSumber("");
        setPanjang("");
        setBeban("");
        setBebanSiang("");
        setTglUpdate("");

        toast({
          variant: "default",
          title: "Berhasil",
          description: `Penyulang ${penyulang} berhasil ditambahkan`,
        });

        // Navigate back to penyulang list
        navigate("/admin/aset/penyulang");
      } catch (error) {
        console.error("Error saving penyulang data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menyimpan data penyulang",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      validateForm,
      ulp,
      penyulang,
      sumber,
      panjang,
      beban,
      bebanSiang,
      tglUpdate,
      toast,
      navigate,
    ]
  );

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate("/admin/aset/penyulang");
  }, [navigate]);

  // Set today's date as default
  const setTodayAsDefault = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setTglUpdate(today);
  }, []);

  return (
    <Layouts className="px-2">
      <div className="fixed top-0 right-0 bg-main text-white px-4 py-2 h-16 w-full z-10 flex items-center justify-between bg-gradient-to-r from-main to-blue-500 font-semibold">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div className="text-center flex-1">TAMBAH PENYULANG</div>
        <div className="w-20"></div> {/* Spacer for balance */}
      </div>

      <div className="pt-20 max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-main/10 to-blue-500/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-main to-blue-500">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-main">
                  Tambah Penyulang Baru
                </CardTitle>
                <p className="text-gray-600">
                  Masukkan informasi penyulang dan data beban listrik
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form Card */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
          <CardContent className="p-6">
            <form onSubmit={handleSubmitPenyulang} className="space-y-6">
              {/* ULP */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="ulp"
                  className="md:text-right flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  ULP
                </Label>
                <div className="md:col-span-3">
                  <Input
                    id="ulp"
                    value={ulp}
                    onChange={(e) => setUlp(e.target.value)}
                    placeholder="Contoh: SELONG, PRAYA, PRINGGABAYA, KOPANG"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unit Layanan Pelanggan tempat penyulang berada
                  </p>
                </div>
              </div>

              {/* Penyulang */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="penyulang"
                  className="md:text-right flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Penyulang
                </Label>
                <div className="md:col-span-3">
                  <Input
                    id="penyulang"
                    value={penyulang}
                    onChange={(e) => setPenyulang(e.target.value)}
                    placeholder="Nama penyulang..."
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sesuaikan dengan data Aset UIW
                  </p>
                </div>
              </div>

              {/* Sumber GI/PLTD */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="sumber"
                  className="md:text-right flex items-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  Sumber GI/PLTD
                </Label>
                <div className="md:col-span-3">
                  <Input
                    id="sumber"
                    value={sumber}
                    onChange={(e) => setSumber(e.target.value)}
                    placeholder="Contoh: GI Mataram, PLTD Lombok"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Gardu Induk atau Pembangkit Listrik sumber tenaga
                  </p>
                </div>
              </div>

              {/* Panjang */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="panjang"
                  className="md:text-right flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Panjang
                </Label>
                <div className="md:col-span-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="panjang"
                      type="number"
                      step="0.01"
                      min="0"
                      value={panjang}
                      onChange={(e) => setPanjang(e.target.value)}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 font-medium min-w-[40px]">
                      kMS
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Panjang saluran dalam kilo Meter Saluran
                  </p>
                </div>
              </div>

              {/* Beban Malam */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="beban"
                  className="md:text-right flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Beban Malam
                </Label>
                <div className="md:col-span-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="beban"
                      type="number"
                      step="0.01"
                      min="0"
                      value={beban}
                      onChange={(e) => setBeban(e.target.value)}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 font-medium min-w-[40px]">
                      MW
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Beban puncak malam hari dalam Megawatt
                  </p>
                </div>
              </div>

              {/* Beban Siang */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="bebanSiang"
                  className="md:text-right flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Beban Siang
                </Label>
                <div className="md:col-span-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="bebanSiang"
                      type="number"
                      step="0.01"
                      min="0"
                      value={bebanSiang}
                      onChange={(e) => setBebanSiang(e.target.value)}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 font-medium min-w-[40px]">
                      MW
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Beban puncak siang hari dalam Megawatt
                  </p>
                </div>
              </div>

              {/* Tanggal Update */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="tglUpdate"
                  className="md:text-right flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Tanggal Update
                </Label>
                <div className="md:col-span-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="tglUpdate"
                      type="date"
                      value={tglUpdate}
                      onChange={(e) => setTglUpdate(e.target.value)}
                      className="flex-1"
                      max={new Date().toISOString().split("T")[0]}
                    />
                    <Button
                      type="button"
                      onClick={setTodayAsDefault}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      Hari Ini
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tanggal pembaruan data penyulang
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-main hover:bg-main/80 text-white py-3 text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-5 h-5" />
                      <span>Simpan Penyulang</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50/50 backdrop-blur-lg border border-blue-200/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 flex items-center gap-2">
                <span>💡</span>
                Tips Pengisian Data:
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>
                    Pastikan nama penyulang unik dan mudah diidentifikasi
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>
                    Beban malam biasanya lebih tinggi dari beban siang
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Gunakan data terbaru untuk akurasi yang optimal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>
                    ULP harus konsisten dengan penyulang lain di area yang sama
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Spacer */}
        <div className="h-24"></div>
      </div>
    </Layouts>
  );
};

export default TambahPenyulang;
