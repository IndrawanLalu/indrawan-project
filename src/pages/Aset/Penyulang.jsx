import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  EditIcon,
  PlusCircleIcon,
  TrashIcon,
  Zap,
  Users,
  TrendingUp,
  Filter,
  RefreshCw,
  Calendar,
  MapPin,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layouts from "@/pages/admin/Layouts";

const Penyulang = () => {
  // State untuk data dan UI
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUlpFilter, setSelectedUlpFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastFetch, setLastFetch] = useState(null);

  const { toast } = useToast();

  // Memoized list ULP yang tersedia
  const availableUlp = useMemo(() => {
    const ulpSet = new Set();
    data.forEach((item) => {
      if (item.ulp && item.ulp.trim()) {
        ulpSet.add(item.ulp.trim());
      }
    });
    return Array.from(ulpSet).sort();
  }, [data]);

  // Filter dan search data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter berdasarkan ULP
    if (selectedUlpFilter) {
      filtered = filtered.filter(
        (item) => item.ulp && item.ulp.trim() === selectedUlpFilter
      );
    }

    // Search berdasarkan nama penyulang
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.penyulang &&
          item.penyulang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [data, selectedUlpFilter, searchTerm]);

  // Computed totals untuk filtered data
  const computedTotals = useMemo(() => {
    const totalBeban = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.beban || 0),
      0
    );
    const totalBebanSiang = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.bebanSiang || 0),
      0
    );
    const totalPanjang = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.Panjang || 0),
      0
    );

    return {
      totalBeban: totalBeban.toFixed(2),
      totalBebanSiang: totalBebanSiang.toFixed(2),
      totalPanjang: totalPanjang.toFixed(2),
      totalPenyulang: filteredData.length,
    };
  }, [filteredData]);

  // Fetch data dari Firestore
  const fetchData = useCallback(async () => {
    try {
      console.log("=== FETCHING PENYULANG DATA ===");
      setIsLoading(true);
      setError("");

      const querySnapshot = await getDocs(collection(db, "penyulang"));
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched penyulang data:", fetchedData.length, "items");

      // Validasi data yang diperlukan
      const validatedData = fetchedData.map((item) => ({
        ...item,
        ulp: item.ulp || "Tidak Ditentukan",
        penyulang: item.penyulang || "Tidak Diketahui",
        sumber: item.sumber || "-",
        Panjang: item.Panjang || 0,
        beban: item.beban || 0,
        bebanSiang: item.bebanSiang || 0,
        tglUpdate: item.tglUpdate || "-",
      }));

      setData(validatedData);
      setLastFetch(new Date());
    } catch (error) {
      console.error("Error fetching penyulang data:", error);
      setError(`Gagal memuat data: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data penyulang",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle edit click
  const handleEditClick = useCallback((item) => {
    console.log("Editing item:", item);
    setEditItem({ ...item }); // Clone object untuk editing
    setError("");
  }, []);

  // Handle cancel edit
  const handleCancel = useCallback(() => {
    setEditItem(null);
    setError("");
  }, []);

  // Handle refresh data
  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Form validation untuk edit
  const validateEditForm = useCallback(() => {
    if (!editItem) return false;

    const requiredFields = {
      ulp: "ULP",
      penyulang: "Penyulang",
      sumber: "Sumber GI/PLTD",
      Panjang: "Panjang",
      beban: "Beban",
      bebanSiang: "Beban Siang",
      tglUpdate: "Tanggal Update",
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!editItem[field] || editItem[field].toString().trim() === "") {
        setError(`${label} harus diisi`);
        return false;
      }
    }

    // Validasi numeric fields
    const numericFields = ["Panjang", "beban", "bebanSiang"];
    for (const field of numericFields) {
      const value = parseFloat(editItem[field]);
      if (isNaN(value) || value < 0) {
        setError(`${requiredFields[field]} harus berupa angka positif`);
        return false;
      }
    }

    return true;
  }, [editItem]);

  // Handle update data
  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      console.log("=== UPDATING PENYULANG DATA ===");

      if (!validateEditForm()) {
        return;
      }

      try {
        setIsLoading(true);

        const itemDocRef = doc(db, "penyulang", editItem.id);
        const updateData = {
          ulp: editItem.ulp.trim(),
          penyulang: editItem.penyulang.trim(),
          sumber: editItem.sumber.trim(),
          Panjang: parseFloat(editItem.Panjang),
          beban: parseFloat(editItem.beban),
          bebanSiang: parseFloat(editItem.bebanSiang),
          tglUpdate: editItem.tglUpdate,
          updatedAt: new Date().toISOString(),
        };

        await updateDoc(itemDocRef, updateData);
        console.log("Penyulang data updated successfully");

        // Update local state
        setData((prevData) =>
          prevData.map((item) =>
            item.id === editItem.id ? { ...item, ...updateData } : item
          )
        );

        setEditItem(null);
        setError("");

        toast({
          variant: "default",
          title: "Berhasil",
          description: "Data penyulang berhasil diupdate",
        });
      } catch (error) {
        console.error("Error updating penyulang document:", error);
        setError(`Gagal mengupdate data: ${error.message}`);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal mengupdate data",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [editItem, validateEditForm, toast]
  );

  // Handle delete data
  const handleDelete = useCallback(
    async (itemId, itemName) => {
      try {
        console.log("=== DELETING PENYULANG DATA ===", itemId);
        setIsLoading(true);

        await deleteDoc(doc(db, "penyulang", itemId));
        console.log("Penyulang data deleted successfully");

        // Update local state
        setData((prevData) => prevData.filter((item) => item.id !== itemId));

        toast({
          variant: "default",
          title: "Berhasil",
          description: `Penyulang ${itemName} berhasil dihapus`,
        });
      } catch (error) {
        console.error("Error deleting penyulang document:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menghapus data",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSelectedUlpFilter("");
    setSearchTerm("");
  }, []);

  return (
    <Layouts>
      <div className="w-full mx-auto px-4 space-y-6">
        {/* Header */}
        <Card className="group bg-gradient-to-r from-main/10 to-blue-500/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-gradient-to-r from-main to-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold text-main">
                    Manajemen Penyulang
                  </CardTitle>
                  <p className="text-gray-600">
                    Kelola data penyulang dan informasi beban listrik
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="hover:bg-main/10"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
                <Link to="/aset/tambahPenyulang">
                  <Button
                    size="sm"
                    className="bg-main hover:bg-main/80 text-white"
                  >
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Tambah Penyulang
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-500/20">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Penyulang</p>
                  <p className="text-2xl font-bold text-main">
                    {isLoading ? "..." : computedTotals.totalPenyulang}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Beban Malam</p>
                  <p className="text-2xl font-bold text-green-600">
                    {isLoading ? "..." : `${computedTotals.totalBeban} MW`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-orange-500/20">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Beban Siang</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {isLoading ? "..." : `${computedTotals.totalBebanSiang} MW`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-purple-500/20">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Panjang</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {isLoading ? "..." : `${computedTotals.totalPanjang} kMS`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Filter:</span>
              </div>

              <Select
                value={selectedUlpFilter}
                onValueChange={setSelectedUlpFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Semua ULP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-data-available">Semua ULP</SelectItem>
                  {availableUlp.map((ulp) => (
                    <SelectItem key={ulp} value={ulp}>
                      ULP {ulp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Cari penyulang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />

              {(selectedUlpFilter || searchTerm) && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                  className="hover:bg-main/10"
                >
                  Reset Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div
          className={`grid transition-all duration-500 ease-in-out ${
            editItem ? "grid-cols-1 lg:grid-cols-3 gap-6" : "grid-cols-1"
          }`}
        >
          {/* Table */}
          <div className={editItem ? "lg:col-span-2" : "col-span-1"}>
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="w-8 h-8 border-4 border-main/20 border-t-main rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-600">Memuat data penyulang...</p>
                    </div>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <Zap className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">
                        {data.length === 0
                          ? "Belum ada data penyulang"
                          : "Tidak ada data yang sesuai dengan filter"}
                      </p>
                      {data.length === 0 && (
                        <Link to="/aset/tambahPenyulang">
                          <Button className="bg-main hover:bg-main/80 text-white">
                            <PlusCircleIcon className="w-4 h-4 mr-2" />
                            Tambah Penyulang Pertama
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-white/20">
                          <TableHead className="w-[50px] text-center">
                            #
                          </TableHead>
                          <TableHead>ULP</TableHead>
                          <TableHead>Penyulang</TableHead>
                          <TableHead>Sumber GI/PLTD</TableHead>
                          <TableHead className="text-center">
                            Panjang
                            <br />
                            <span className="text-xs text-gray-500">(kMS)</span>
                          </TableHead>
                          <TableHead className="text-center">
                            Beban Malam
                            <br />
                            <span className="text-xs text-green-600">
                              {computedTotals.totalBeban} MW
                            </span>
                          </TableHead>
                          <TableHead className="text-center">
                            Beban Siang
                            <br />
                            <span className="text-xs text-orange-600">
                              {computedTotals.totalBebanSiang} MW
                            </span>
                          </TableHead>
                          <TableHead className="text-center">
                            Tgl Update
                          </TableHead>
                          <TableHead className="w-[100px] text-center">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((item, index) => (
                          <TableRow
                            key={item.id}
                            className="hover:bg-white/5 border-b border-white/10 transition-colors duration-200"
                          >
                            <TableCell className="font-medium text-center">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-main/20 text-main rounded-md text-xs font-medium">
                                {item.ulp}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.penyulang}
                            </TableCell>
                            <TableCell>{item.sumber}</TableCell>
                            <TableCell className="text-center">
                              {parseFloat(item.Panjang).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center font-medium text-green-600">
                              {parseFloat(item.beban).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center font-medium text-orange-600">
                              {parseFloat(item.bebanSiang).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {item.tglUpdate}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  onClick={() => handleEditClick(item)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-100"
                                  title="Edit penyulang"
                                >
                                  <EditIcon className="h-4 w-4 text-blue-500" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-red-100"
                                      title="Hapus penyulang"
                                    >
                                      <TrashIcon className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Konfirmasi Hapus
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Yakin ingin menghapus penyulang &quot;
                                        {item.penyulang}&quot; dari ULP{" "}
                                        {item.ulp}? Tindakan ini tidak dapat
                                        dibatalkan dan akan menghapus semua data
                                        terkait.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Batal
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDelete(item.id, item.penyulang)
                                        }
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                      >
                                        Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          {editItem && (
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <EditIcon className="w-5 h-5 text-main" />
                    <span>Edit Penyulang</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Update informasi penyulang &quot;{editItem.penyulang}&quot;
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleUpdate} className="space-y-4">
                    {/* ULP */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        ULP
                      </Label>
                      <Input
                        value={editItem.ulp || ""}
                        onChange={(e) =>
                          setEditItem({ ...editItem, ulp: e.target.value })
                        }
                        placeholder="Nama ULP (contoh: Selong, Keruak)"
                        className="w-full"
                      />
                    </div>

                    {/* Penyulang */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Penyulang
                      </Label>
                      <Input
                        value={editItem.penyulang || ""}
                        onChange={(e) =>
                          setEditItem({
                            ...editItem,
                            penyulang: e.target.value,
                          })
                        }
                        placeholder="Nama penyulang..."
                        className="w-full"
                      />
                    </div>

                    {/* Sumber GI/PLTD */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Sumber GI/PLTD
                      </Label>
                      <Input
                        value={editItem.sumber || ""}
                        onChange={(e) =>
                          setEditItem({ ...editItem, sumber: e.target.value })
                        }
                        placeholder="Sumber listrik (contoh: GI Mataram)"
                        className="w-full"
                      />
                    </div>

                    {/* Panjang */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Panjang</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editItem.Panjang || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              Panjang: e.target.value,
                            })
                          }
                          className="flex-1"
                          placeholder="0.00"
                        />
                        <span className="text-sm text-gray-600 font-medium">
                          kMS
                        </span>
                      </div>
                    </div>

                    {/* Beban Malam */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Beban Malam</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editItem.beban || ""}
                          onChange={(e) =>
                            setEditItem({ ...editItem, beban: e.target.value })
                          }
                          className="flex-1"
                          placeholder="0.00"
                        />
                        <span className="text-sm text-gray-600 font-medium">
                          MW
                        </span>
                      </div>
                    </div>

                    {/* Beban Siang */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Beban Siang</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editItem.bebanSiang || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              bebanSiang: e.target.value,
                            })
                          }
                          className="flex-1"
                          placeholder="0.00"
                        />
                        <span className="text-sm text-gray-600 font-medium">
                          MW
                        </span>
                      </div>
                    </div>

                    {/* Tanggal Update */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Tanggal Update
                      </Label>
                      <Input
                        type="date"
                        value={editItem.tglUpdate || ""}
                        onChange={(e) =>
                          setEditItem({
                            ...editItem,
                            tglUpdate: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">⚠️ Error:</span>
                          <span>{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4">
                      <Button
                        type="button"
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Batal
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="flex-1 bg-main hover:bg-main/80 text-white"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Update...</span>
                              </div>
                            ) : (
                              "Update"
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Konfirmasi Update
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Yakin ingin mengupdate data penyulang &quot;
                              {editItem.penyulang}&quot; dari ULP {editItem.ulp}
                              ? Pastikan semua data sudah benar.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleUpdate}
                              className="bg-main hover:bg-main/80"
                            >
                              Update
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="mt-4 bg-blue-50/50 backdrop-blur-lg border border-blue-200/50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Tips:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ULP adalah Unit Layanan Pelanggan</li>
                    <li>• Beban dalam satuan Megawatt (MW)</li>
                    <li>• Panjang dalam satuan kilo Meter Saluran (kMS)</li>
                    <li>
                      • Pastikan tanggal update sesuai dengan data terbaru
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {lastFetch && (
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Data terakhir diperbarui:{" "}
                    {lastFetch.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {(selectedUlpFilter || searchTerm) && (
                  <span className="text-main font-medium">
                    Menampilkan {filteredData.length} dari {data.length}{" "}
                    penyulang
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Info */}
        {!editItem && data.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50/50 to-blue-50/50 backdrop-blur-lg border border-green-200/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <h4 className="font-semibold text-green-700">Total ULP</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {availableUlp.length}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700">
                    Rata-rata Beban
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.length > 0
                      ? (
                          data.reduce(
                            (sum, item) => sum + parseFloat(item.beban || 0),
                            0
                          ) / data.length
                        ).toFixed(2)
                      : "0.00"}{" "}
                    MW
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-700">
                    Efisiensi Beban
                  </h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {data.length > 0 &&
                    data.reduce(
                      (sum, item) => sum + parseFloat(item.beban || 0),
                      0
                    ) > 0 &&
                    data.reduce(
                      (sum, item) => sum + parseFloat(item.bebanSiang || 0),
                      0
                    ) > 0
                      ? (
                          (data.reduce(
                            (sum, item) =>
                              sum + parseFloat(item.bebanSiang || 0),
                            0
                          ) /
                            data.reduce(
                              (sum, item) => sum + parseFloat(item.beban || 0),
                              0
                            )) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layouts>
  );
};

export default Penyulang;
