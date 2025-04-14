import { useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import Layouts from "../admin/Layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaBolt, FaCalendar, FaClock, FaUser, FaSearch } from "react-icons/fa";

const GarduDetailPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, setSelectedGarduId] = useState("");
  const [selectedGarduInfo, setSelectedGarduInfo] = useState(null);
  const [measurementHistory, setMeasurementHistory] = useState([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length >= 2) {
      setIsSearching(true);
      searchGardu(e.target.value);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Fungsi pencarian gardu
  const searchGardu = async (term) => {
    try {
      setLoading(true);

      // Query berdasarkan nama gardu (case insensitive jika memungkinkan)
      const garduQuery = query(
        collection(db, "Pengukuran"),
        where("nama", ">=", term),
        where("nama", "<=", term + "\uf8ff"),
        limit(10)
      );

      const garduSnapshot = await getDocs(garduQuery);

      // Mengumpulkan hasil unik berdasarkan nama gardu
      const uniqueResults = {};
      garduSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!uniqueResults[data.nama]) {
          uniqueResults[data.nama] = {
            id: doc.id,
            garduId: data.garduId,
            nama: data.nama,
            alamat: data.alamat,
            kva: data.kva,
          };
        }
      });

      setSearchResults(Object.values(uniqueResults));
    } catch (error) {
      console.error("Error searching for gardu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle ketika gardu dipilih dari hasil pencarian
  const handleGarduSelect = async (garduId, garduNama) => {
    setSelectedGarduId(garduId);
    setIsSearching(false);
    setSearchTerm(garduNama);

    // Ambil data gardu dan riwayat pengukuran
    await fetchGarduDetails(garduId, garduNama);
  };

  // Ambil detail gardu dan riwayat pengukuran
  const fetchGarduDetails = async (garduId, garduNama) => {
    try {
      setLoading(true);

      // Query untuk mendapatkan riwayat pengukuran untuk gardu tertentu
      let historyQuery;

      if (garduId) {
        historyQuery = query(
          collection(db, "Pengukuran"),
          where("garduId", "==", garduId),
          orderBy("tanggalUkur", "desc"),
          orderBy("jamUkur", "desc")
        );
      } else {
        historyQuery = query(
          collection(db, "Pengukuran"),
          where("nama", "==", garduNama),
          orderBy("tanggalUkur", "desc"),
          orderBy("jamUkur", "desc")
        );
      }

      const historySnapshot = await getDocs(historyQuery);

      if (!historySnapshot.empty) {
        const historyData = historySnapshot.docs.map((doc) => ({
          id: doc.id,
          petugas:
            typeof doc.data().petugas === "string"
              ? doc.data().petugas
              : doc.data().petugas?.nama || "Unknown",
          ...doc.data(),
        }));

        setMeasurementHistory(historyData);

        // Set pengukuran terbaru sebagai tampilan default
        const latestMeasurement = historyData[0];
        setSelectedMeasurement(latestMeasurement);

        // Set info gardu
        setSelectedGarduInfo({
          id: historyData[0].garduId,
          nama: historyData[0].nama,
          alamat: historyData[0].alamat,
          kva: historyData[0].kva,
        });
      } else {
        setMeasurementHistory([]);
        setSelectedMeasurement(null);
        setSelectedGarduInfo(null);
      }
    } catch (error) {
      console.error("Error fetching gardu details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memilih pengukuran tertentu dari riwayat
  const selectMeasurement = (measurement) => {
    setSelectedMeasurement(measurement);
  };

  // Fungsi untuk mendapatkan kelas warna berdasarkan nilai persentase
  const getPercentageColorClass = (percentage) => {
    if (percentage >= 80) return "text-red-500";
    if (percentage >= 60) return "text-orange-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  // Fungsi untuk mendapatkan kelas warna berdasarkan nilai unbalance
  const getUnbalanceColorClass = (unbalance) => {
    if (unbalance > 20) return "text-red-500";
    if (unbalance > 10) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <Layouts>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Pengukuran Gardu</h1>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cari Gardu</CardTitle>
            <CardDescription>
              Masukkan nama gardu untuk melihat data pengukuran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari berdasarkan nama gardu..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />

                {/* Search Results Dropdown */}
                {isSearching && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                        onClick={() =>
                          handleGarduSelect(result.garduId, result.nama)
                        }
                      >
                        <div className="font-medium">{result.nama}</div>
                        <div className="text-sm text-gray-600">
                          {result.alamat}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isSearching && searchResults.length === 0 && !loading && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2">
                    <p className="text-gray-500">
                      Tidak ada hasil yang ditemukan
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => searchGardu(searchTerm)}
                disabled={searchTerm.length < 2 || loading}
              >
                {loading ? "Mencari..." : "Cari"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedGarduInfo && selectedMeasurement && (
          <>
            {/* Gardu Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Gardu Basic Info Card */}
              <Card>
                <CardHeader className="bg-main text-white rounded-t-lg">
                  <CardTitle className="flex justify-between items-center">
                    <span>{selectedGarduInfo.nama}</span>
                    <span className="text-sm bg-white text-main px-2 py-1 rounded-full">
                      {selectedGarduInfo.kva} KVA
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white opacity-90">
                    {selectedGarduInfo.alamat}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <FaCalendar className="mr-2 text-gray-500" />
                    <span>
                      Tanggal Pengukuran: {selectedMeasurement.tanggalUkur}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <FaClock className="mr-2 text-gray-500" />
                    <span>Jam Pengukuran: {selectedMeasurement.jamUkur}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-gray-500" />
                    <span>Petugas: {selectedMeasurement.petugas}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Load Info Card */}
              <Card>
                <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                  <CardTitle>Beban Gardu</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Beban KVA</span>
                        <span className="text-sm font-bold">
                          {parseFloat(
                            selectedMeasurement.bebanKva || 0
                          ).toFixed(2)}{" "}
                          KVA
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            selectedMeasurement.persenKva >= 80
                              ? "bg-red-500"
                              : selectedMeasurement.persenKva >= 60
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              selectedMeasurement.persenKva,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="mt-1 text-right">
                        <span
                          className={`font-bold text-sm ${getPercentageColorClass(
                            selectedMeasurement.persenKva
                          )}`}
                        >
                          {parseFloat(
                            selectedMeasurement.persenKva || 0
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Unbalance</span>
                        <span
                          className={`text-sm font-bold ${getUnbalanceColorClass(
                            selectedMeasurement.unbalance
                          )}`}
                        >
                          {parseFloat(
                            selectedMeasurement.unbalance || 0
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Measurements Card */}
              <Card>
                <CardHeader className="bg-purple-600 text-white rounded-t-lg">
                  <CardTitle>Pengukuran Arus (A)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-500">
                        {selectedMeasurement.R || 0}
                      </div>
                      <div className="text-sm text-gray-500">Phase R</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-500">
                        {selectedMeasurement.S || 0}
                      </div>
                      <div className="text-sm text-gray-500">Phase S</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500">
                        {selectedMeasurement.T || 0}
                      </div>
                      <div className="text-sm text-gray-500">Phase T</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-500">
                        {selectedMeasurement.N || 0}
                      </div>
                      <div className="text-sm text-gray-500">Netral</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Measurement Tabs */}
            <Tabs defaultValue="history" className="mb-8">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="history">Riwayat Pengukuran</TabsTrigger>
                <TabsTrigger value="phase">Arus Per Jurusan</TabsTrigger>
                <TabsTrigger value="voltage">Tegangan</TabsTrigger>
              </TabsList>

              {/* Phase Current Per Line Tab */}
              <TabsContent value="phase">
                <Card>
                  <CardHeader>
                    <CardTitle>Arus Per Jurusan (A)</CardTitle>
                    <CardDescription>
                      Detail pengukuran arus pada setiap jurusan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jurusan</TableHead>
                          <TableHead className="text-center text-red-500">
                            R
                          </TableHead>
                          <TableHead className="text-center text-yellow-500">
                            S
                          </TableHead>
                          <TableHead className="text-center text-blue-500">
                            T
                          </TableHead>
                          <TableHead className="text-center text-gray-500">
                            N
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {["A", "B", "C", "D", "K"].map((jurusan) => (
                          <TableRow key={jurusan}>
                            <TableCell className="font-medium">
                              Jurusan {jurusan}
                            </TableCell>
                            <TableCell className="text-center">
                              {selectedMeasurement.perJurusan?.R?.[jurusan] ||
                                0}
                            </TableCell>
                            <TableCell className="text-center">
                              {selectedMeasurement.perJurusan?.S?.[jurusan] ||
                                0}
                            </TableCell>
                            <TableCell className="text-center">
                              {selectedMeasurement.perJurusan?.T?.[jurusan] ||
                                0}
                            </TableCell>
                            <TableCell className="text-center">
                              {selectedMeasurement.perJurusan?.N?.[jurusan] ||
                                0}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voltage Measurements Tab */}
              <TabsContent value="voltage">
                <Card>
                  <CardHeader>
                    <CardTitle>Pengukuran Tegangan (V)</CardTitle>
                    <CardDescription>
                      Detail pengukuran tegangan antar phase dan phase ke netral
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Phase - Netral
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-red-500">
                              R - N
                            </span>
                            <span className="font-bold">
                              {selectedMeasurement.tegangan?.R_N || 0} V
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-yellow-500">
                              S - N
                            </span>
                            <span className="font-bold">
                              {selectedMeasurement.tegangan?.S_N || 0} V
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-blue-500">
                              T - N
                            </span>
                            <span className="font-bold">
                              {selectedMeasurement.tegangan?.T_N || 0} V
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Phase - Phase
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">
                              <span className="text-red-500">R</span> -{" "}
                              <span className="text-yellow-500">S</span>
                            </span>
                            <span className="font-bold">
                              {selectedMeasurement.tegangan?.R_S || 0} V
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">
                              <span className="text-yellow-500">S</span> -{" "}
                              <span className="text-blue-500">T</span>
                            </span>
                            <span className="font-bold">
                              {selectedMeasurement.tegangan?.S_T || 0} V
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">
                              <span className="text-blue-500">T</span> -{" "}
                              <span className="text-red-500">R</span>
                            </span>
                            <span className="font-bold">
                              {selectedMeasurement.tegangan?.R_T || 0} V
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Measurement History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Riwayat Pengukuran</CardTitle>
                    <CardDescription>
                      Daftar seluruh pengukuran yang pernah dilakukan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {measurementHistory.map((measurement, index) => (
                        <div
                          key={measurement.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedMeasurement.id === measurement.id
                              ? "border-main border-2 bg-main/5"
                              : "border-gray-200 hover:border-main"
                          }`}
                          onClick={() => selectMeasurement(measurement)}
                        >
                          <div className="flex justify-between">
                            <div className="flex items-center space-x-2">
                              <FaCalendar className="text-gray-500" />
                              <span>{measurement.tanggalUkur}</span>
                              <FaClock className="ml-2 text-gray-500" />
                              <span>{measurement.jamUkur}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <FaBolt className="mr-1 text-orange-500" />
                                <span className="font-medium">
                                  {parseFloat(
                                    measurement.persenKva || 0
                                  ).toFixed(2)}
                                  %
                                </span>
                              </div>
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  index === 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {index === 0 ? "Terbaru" : `#${index + 1}`}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Petugas: {measurement.petugas}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Empty State when no gardu is selected */}
        {!selectedGarduInfo && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="text-5xl mb-4">🔎</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Belum ada gardu yang dipilih
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Silakan cari dan pilih gardu untuk melihat detail pengukurannya
            </p>
          </div>
        )}
      </div>
    </Layouts>
  );
};

export default GarduDetailPage;
