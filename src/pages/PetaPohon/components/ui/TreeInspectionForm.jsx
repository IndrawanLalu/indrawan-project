import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
import {
  TreePine,
  Camera,
  MapPin,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  Ruler,
  FileText,
  Clipboard,
  Settings,
} from "lucide-react";
import { predictionDaysOptions } from "@/utils/treePrediction";
import PropTypes from "prop-types";

const TreeInspectionForm = ({
  onSubmit,
  loading = false,
  ulpOptions = [],
  location = { lat: 0, lng: 0 },
}) => {
  const [formData, setFormData] = useState({
    // Basic Info
    ulp: "",
    petugas: "",
    tglInspeksi: new Date().toISOString().split("T")[0],

    // Tree Info
    jenisPohon: "",
    lokasi: "",
    deskripsi: "",
    koordinat: "",

    // Measurements
    tinggiPohon: "",
    diameterBatang: "",
    jarakKeJaringan: "",
    jarakKeTiang: "",

    // Risk Assessment
    prediksiInspektur: "", // NEW: Prediksi langsung dari inspektur
    tingkatRisiko: "",
    kondisiPohon: "",
    kondisiTanah: "",
    kondisiCuaca: "",

    // Recommendations
    tindakanRekomendasi: "",
    prioritas: "",
    estimasiBiaya: "",
    peralatanDiperlukan: "",

    // Photos
    fotoSebelum: null,
    fotoSesudah: null,
    fotoTambahan: null,

    // Status
    status: "Temuan",

    // Additional Info
    catatanTambahan: "",
    referensiLaporan: "",
  });

  const [previewImages, setPreviewImages] = useState({
    sebelum: null,
    sesudah: null,
    tambahan: null,
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Update koordinat saat location berubah
  useEffect(() => {
    if (location.lat !== 0 && location.lng !== 0) {
      setFormData((prev) => ({
        ...prev,
        koordinat: `${location.lat}, ${location.lng}`,
      }));
    }
  }, [location]);

  // Options untuk dropdown
  const jenisPohonOptions = [
    "Kelapa",
    "Mangga",
    "Rambutan",
    "Jambu",
    "Pisang",
    "Bambu",
    "Mahoni",
    "Jati",
    "Beringin",
    "Flamboyan",
    "Angsana",
    "Lainnya",
  ];

  const tingkatRisikoOptions = ["Rendah", "Sedang", "Tinggi", "Sangat Tinggi"];

  const kondisiPohonOptions = [
    "Sehat",
    "Sedikit Rusak",
    "Rusak Sedang",
    "Rusak Berat",
    "Mati",
  ];

  const kondisiTanahOptions = [
    "Stabil",
    "Agak Longsor",
    "Rawan Longsor",
    "Tergenang Air",
  ];

  const kondisiCuacaOptions = [
    "Cerah",
    "Berawan",
    "Hujan Ringan",
    "Hujan Lebat",
    "Angin Kencang",
  ];

  const prioritasOptions = [
    "Sangat Urgent",
    "Urgent",
    "Normal",
    "Bisa Ditunda",
  ];

  const prediksiOptions = Object.keys(predictionDaysOptions);

  const peralatanOptions = [
    "Gergaji Mesin",
    "Tangga",
    "Safety Harness",
    "Crane",
    "Pemotong Dahan",
    "Chipper",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleImageChange = (field, file) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages((prev) => ({
          ...prev,
          [field]: e.target.result,
        }));
      };
      reader.readAsDataURL(file);

      const fieldMap = {
        sebelum: "fotoSebelum",
        sesudah: "fotoSesudah",
        tambahan: "fotoTambahan",
      };

      setFormData((prev) => ({
        ...prev,
        [fieldMap[field]]: file,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    const requiredFields = [
      { field: "ulp", message: "ULP wajib dipilih" },
      { field: "petugas", message: "Nama petugas wajib diisi" },
      { field: "jenisPohon", message: "Jenis pohon wajib dipilih" },
      { field: "lokasi", message: "Lokasi wajib diisi" },
      { field: "tinggiPohon", message: "Tinggi pohon wajib diisi" },
      { field: "jarakKeJaringan", message: "Jarak ke jaringan wajib diisi" },
      {
        field: "prediksiInspektur",
        message: "Prediksi inspektur wajib dipilih",
      },
      { field: "tingkatRisiko", message: "Tingkat risiko wajib dipilih" },
      { field: "kondisiPohon", message: "Kondisi pohon wajib dipilih" },
      {
        field: "tindakanRekomendasi",
        message: "Tindakan rekomendasi wajib diisi",
      },
      { field: "tglInspeksi", message: "Tanggal inspeksi wajib diisi" },
    ];

    requiredFields.forEach(({ field, message }) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        errors[field] = message;
      }
    });

    // Numeric validations
    if (
      formData.tinggiPohon &&
      (parseFloat(formData.tinggiPohon) <= 0 ||
        parseFloat(formData.tinggiPohon) > 100)
    ) {
      errors.tinggiPohon = "Tinggi pohon harus antara 0.1 - 100 meter";
    }

    if (
      formData.jarakKeJaringan &&
      (parseFloat(formData.jarakKeJaringan) < 0 ||
        parseFloat(formData.jarakKeJaringan) > 50)
    ) {
      errors.jarakKeJaringan = "Jarak ke jaringan harus antara 0 - 50 meter";
    }

    if (
      formData.diameterBatang &&
      (parseFloat(formData.diameterBatang) <= 0 ||
        parseFloat(formData.diameterBatang) > 10)
    ) {
      errors.diameterBatang = "Diameter batang harus antara 0.1 - 10 meter";
    }

    // Photo validation
    if (!formData.fotoSebelum) {
      errors.fotoSebelum = "Foto sebelum wajib diupload";
    }

    // Date validation
    if (formData.tglInspeksi && new Date(formData.tglInspeksi) > new Date()) {
      errors.tglInspeksi = "Tanggal inspeksi tidak boleh di masa depan";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      return;
    }

    // Tambahkan timestamp
    const submitData = {
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(submitData);

    // Reset form setelah submit
    setFormData({
      ulp: "",
      petugas: "",
      tglInspeksi: new Date().toISOString().split("T")[0],
      jenisPohon: "",
      lokasi: "",
      deskripsi: "",
      koordinat: `${location.lat}, ${location.lng}`,
      tinggiPohon: "",
      diameterBatang: "",
      jarakKeJaringan: "",
      jarakKeTiang: "",
      prediksiInspektur: "",
      tingkatRisiko: "",
      kondisiPohon: "",
      kondisiTanah: "",
      kondisiCuaca: "",
      tindakanRekomendasi: "",
      prioritas: "",
      estimasiBiaya: "",
      peralatanDiperlukan: "",
      fotoSebelum: null,
      fotoSesudah: null,
      fotoTambahan: null,
      status: "Temuan",
      catatanTambahan: "",
      referensiLaporan: "",
    });

    setPreviewImages({
      sebelum: null,
      sesudah: null,
      tambahan: null,
    });

    setValidationErrors({});
  };

  const renderInput = (
    field,
    label,
    icon,
    type = "text",
    placeholder = "",
    options = null,
    isTextarea = false,
    required = false
  ) => {
    const hasError = validationErrors[field];

    return (
      <div className="space-y-2">
        <Label htmlFor={field} className="flex items-center gap-2">
          {icon && <icon className="w-4 h-4" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>

        {options ? (
          <select
            id={field}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              hasError ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Pilih {label}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <Textarea
            id={field}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={hasError ? "border-red-500" : ""}
          />
        ) : (
          <Input
            id={field}
            type={type}
            step={type === "number" ? "0.1" : undefined}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={hasError ? "border-red-500" : ""}
          />
        )}

        {hasError && <p className="text-red-500 text-sm">{hasError}</p>}
      </div>
    );
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="w-5 h-5" />
          Form Inspeksi Pohon Lengkap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Section 1: Basic Information */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ulp" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    ULP <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="ulp"
                    value={formData.ulp}
                    onChange={(e) => handleInputChange("ulp", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      validationErrors.ulp
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Pilih ULP</option>
                    {ulpOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.ulp && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.ulp}
                    </p>
                  )}
                </div>

                {renderInput(
                  "petugas",
                  "Nama Petugas",
                  Users,
                  "text",
                  "Masukkan nama petugas",
                  null,
                  false,
                  true
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "tglInspeksi",
                  "Tanggal Inspeksi",
                  Calendar,
                  "date",
                  "",
                  null,
                  false,
                  true
                )}
                {renderInput(
                  "referensiLaporan",
                  "Referensi Laporan",
                  FileText,
                  "text",
                  "Nomor laporan atau referensi"
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Tree Information */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Informasi Pohon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "jenisPohon",
                  "Jenis Pohon",
                  TreePine,
                  "text",
                  "",
                  jenisPohonOptions,
                  false,
                  true
                )}
                {renderInput(
                  "kondisiPohon",
                  "Kondisi Pohon",
                  AlertTriangle,
                  "text",
                  "",
                  kondisiPohonOptions,
                  false,
                  true
                )}
              </div>

              {renderInput(
                "lokasi",
                "Lokasi Detail",
                MapPin,
                "text",
                "Contoh: Jl. Raya Mataram No.123, Desa ABC",
                null,
                false,
                true
              )}
              {renderInput(
                "deskripsi",
                "Deskripsi Pohon",
                Clipboard,
                "text",
                "Deskripsi detail kondisi pohon...",
                null,
                true
              )}
            </CardContent>
          </Card>

          {/* Section 3: Measurements */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Pengukuran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "tinggiPohon",
                  "Tinggi Pohon (meter)",
                  Ruler,
                  "number",
                  "Contoh: 8.5",
                  null,
                  false,
                  true
                )}
                {renderInput(
                  "diameterBatang",
                  "Diameter Batang (meter)",
                  Ruler,
                  "number",
                  "Contoh: 0.8"
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "jarakKeJaringan",
                  "Jarak ke Jaringan (meter)",
                  Ruler,
                  "number",
                  "Contoh: 2.5",
                  null,
                  false,
                  true
                )}
                {renderInput(
                  "jarakKeTiang",
                  "Jarak ke Tiang (meter)",
                  Ruler,
                  "number",
                  "Contoh: 5.0"
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Risk Assessment & Prediction */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Penilaian Risiko & Prediksi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "prediksiInspektur",
                  "Prediksi Kapan Pohon Menyentuh Kabel",
                  Clock,
                  "text",
                  "",
                  prediksiOptions,
                  false,
                  true
                )}
                {renderInput(
                  "tingkatRisiko",
                  "Tingkat Risiko Saat Ini",
                  AlertTriangle,
                  "text",
                  "",
                  tingkatRisikoOptions,
                  false,
                  true
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "kondisiTanah",
                  "Kondisi Tanah",
                  Settings,
                  "text",
                  "",
                  kondisiTanahOptions
                )}
                {renderInput(
                  "kondisiCuaca",
                  "Kondisi Cuaca Saat Inspeksi",
                  Settings,
                  "text",
                  "",
                  kondisiCuacaOptions
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Catatan:</strong> Berdasarkan pengamatan di lapangan,
                  perkirakan kapan pohon ini akan menyentuh kabel listrik.
                  Sistem akan menghitung sisa hari dan memberikan peringatan
                  otomatis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Recommendations */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Rekomendasi & Tindakan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderInput(
                "tindakanRekomendasi",
                "Tindakan Rekomendasi",
                Settings,
                "text",
                "Deskripsikan tindakan yang perlu dilakukan...",
                null,
                true,
                true
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "prioritas",
                  "Prioritas Tindakan",
                  AlertTriangle,
                  "text",
                  "",
                  prioritasOptions
                )}
                {renderInput(
                  "estimasiBiaya",
                  "Estimasi Biaya (Rp)",
                  "",
                  "number",
                  "Contoh: 500000"
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="peralatanDiperlukan"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Peralatan Diperlukan
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {peralatanOptions.map((alat) => (
                    <label key={alat} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.peralatanDiperlukan.includes(alat)}
                        onChange={(e) => {
                          const currentTools = formData.peralatanDiperlukan
                            .split(", ")
                            .filter((t) => t);
                          if (e.target.checked) {
                            currentTools.push(alat);
                          } else {
                            const index = currentTools.indexOf(alat);
                            if (index > -1) currentTools.splice(index, 1);
                          }
                          handleInputChange(
                            "peralatanDiperlukan",
                            currentTools.join(", ")
                          );
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{alat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Photos */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Dokumentasi Foto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Foto Sebelum */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fotoSebelum"
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Foto Sebelum <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fotoSebelum"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange("sebelum", e.target.files[0])
                    }
                    className={
                      validationErrors.fotoSebelum ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.fotoSebelum && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.fotoSebelum}
                    </p>
                  )}
                  {previewImages.sebelum && (
                    <img
                      src={previewImages.sebelum}
                      alt="Preview sebelum"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                  )}
                </div>

                {/* Foto Sesudah */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fotoSesudah"
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Foto Sesudah (Opsional)
                  </Label>
                  <Input
                    id="fotoSesudah"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange("sesudah", e.target.files[0])
                    }
                  />
                  {previewImages.sesudah && (
                    <img
                      src={previewImages.sesudah}
                      alt="Preview sesudah"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                  )}
                </div>

                {/* Foto Tambahan */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fotoTambahan"
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Foto Tambahan (Opsional)
                  </Label>
                  <Input
                    id="fotoTambahan"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange("tambahan", e.target.files[0])
                    }
                  />
                  {previewImages.tambahan && (
                    <img
                      src={previewImages.tambahan}
                      alt="Preview tambahan"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Tips:</strong> Ambil foto dari berbagai sudut yang
                  menunjukkan jarak pohon ke kabel, kondisi pohon secara
                  keseluruhan, dan area sekitar untuk dokumentasi yang lengkap.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Additional Information */}
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informasi Tambahan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderInput(
                "koordinat",
                "Koordinat GPS",
                MapPin,
                "text",
                "Akan terisi otomatis dari GPS"
              )}

              {renderInput(
                "catatanTambahan",
                "Catatan Tambahan",
                FileText,
                "text",
                "Catatan penting lainnya...",
                null,
                true
              )}

              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Status
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Temuan">Temuan</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Koordinat GPS:</strong> Akan terdeteksi otomatis dari
                  lokasi Anda. Pastikan GPS aktif untuk mendapatkan koordinat
                  yang akurat.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">
                    Form belum lengkap
                  </h3>
                </div>
                <p className="text-red-700 text-sm mb-2">
                  Harap lengkapi field berikut sebelum submit:
                </p>
                <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Menyimpan...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Simpan Inspeksi Pohon
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
TreeInspectionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  ulpOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  location: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

export default TreeInspectionForm;
