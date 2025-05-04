import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search as SearchIcon,
  Barcode,
  ArrowUpDown,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "./components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchBy, setSearchBy] = useState("name"); // "name" atau "barcode"
  const [sortBy, setSortBy] = useState("name-asc");
  const [searchMode, setSearchMode] = useState("instant"); // "instant" atau "manual"
  const searchInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/db/data.json");

        if (!response.ok) {
          throw new Error(
            "Gagal memuat data. Silakan coba beberapa saat lagi."
          );
        }

        const jsonData = await response.json();
        setData(jsonData);
        toast.success("Data berhasil dimuat");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        toast.error("Terjadi kesalahan: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi pencarian yang dioptimasi dengan useCallback
  const handleSearch = useCallback(
    (value = query) => {
      if (!value.trim()) {
        setResults([]);
        setFilteredResults([]);
        return;
      }

      try {
        let filtered;

        if (searchBy === "name") {
          filtered = data.filter((item) =>
            item.name.toLowerCase().includes(value.toLowerCase())
          );
        } else if (searchBy === "barcode") {
          filtered = data.filter(
            (item) => item.barcode && item.barcode.includes(value)
          );
        }

        setResults(filtered);
        // Tidak memanggil applySorting di sini karena akan ditangani oleh useEffect
      } catch (err) {
        console.error("Error during search:", err);
        toast.error("Terjadi kesalahan saat pencarian");
      }
    },
    [data, query, searchBy]
  );

  // Handler perubahan input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (searchMode === "instant") {
      // Hapus timeout sebelumnya jika ada
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout baru untuk debounce pencarian
      typingTimeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, 1000); // Lebih responsif - 500ms
    }
  };

  // Handler untuk tombol pencarian manual
  const handleManualSearch = () => {
    handleSearch();
  };

  // Handler untuk tombol reset
  const handleReset = () => {
    setQuery("");
    setResults([]);
    setFilteredResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Fungsi sorting yang dioptimasi
  const applySorting = useCallback(
    (items) => {
      if (!items || !items.length) return;

      let sorted;

      switch (sortBy) {
        case "name-asc":
          sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          sorted = [...items].sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "price-asc":
          sorted = [...items].sort((a, b) => {
            const priceA =
              typeof a.Harga === "string"
                ? parseInt(a.Harga.replace(/\D/g, ""))
                : a.Harga;
            const priceB =
              typeof b.Harga === "string"
                ? parseInt(b.Harga.replace(/\D/g, ""))
                : b.Harga;
            return priceA - priceB;
          });
          break;
        case "price-desc":
          sorted = [...items].sort((a, b) => {
            const priceA =
              typeof a.Harga === "string"
                ? parseInt(a.Harga.replace(/\D/g, ""))
                : a.Harga;
            const priceB =
              typeof b.Harga === "string"
                ? parseInt(b.Harga.replace(/\D/g, ""))
                : b.Harga;
            return priceB - priceA;
          });
          break;
        default:
          sorted = items;
      }

      setFilteredResults(sorted);
    },
    [sortBy]
  );

  // Efek untuk menerapkan sorting saat hasil berubah
  useEffect(() => {
    if (results.length > 0) {
      applySorting(results);
    }
  }, [results, applySorting]);

  // Efek untuk menerapkan sorting saat mode sorting berubah
  useEffect(() => {
    if (results.length > 0) {
      applySorting(results);
    }
  }, [sortBy, applySorting, results]);

  return (
    <div className="container mx-auto p-4">
      <Tabs
        defaultValue="instant"
        className="w-full"
        onValueChange={(value) => setSearchMode(value)}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <TabsList className="mb-2 md:mb-0">
            <TabsTrigger value="instant">Pencarian Instan</TabsTrigger>
            <TabsTrigger value="manual">Pencarian Manual</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchBy("name")}
              className={`flex items-center gap-1 ${
                searchBy === "name" ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <SearchIcon size={16} />
              Nama
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchBy("barcode")}
              className={`flex items-center gap-1 ${
                searchBy === "barcode"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              <Barcode size={16} />
              Barcode
            </Button>
          </div>

          <div className="flex-1"></div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
              <SelectItem value="price-asc">Harga (Rendah-Tinggi)</SelectItem>
              <SelectItem value="price-desc">Harga (Tinggi-Rendah)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder={
                  searchBy === "name"
                    ? "Cari nama produk..."
                    : "Scan atau masukkan barcode..."
                }
                className="pr-10 h-12"
                disabled={isLoading}
              />
              {query && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={handleReset}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <TabsContent value="manual" className="m-0">
              <Button
                onClick={handleManualSearch}
                disabled={isLoading || query.trim() === ""}
                className="h-12"
              >
                <SearchIcon className="mr-2" size={18} />
                Cari
              </Button>
            </TabsContent>
          </div>

          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loader2
                className="animate-spin text-muted-foreground"
                size={18}
              />
            </div>
          )}
        </div>
      </Tabs>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 flex items-center">
          <div className="mr-2">⚠️</div>
          <div>{error}</div>
        </div>
      )}

      {!isLoading && query && filteredResults.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <SearchIcon size={48} />
          </div>
          <h3 className="text-lg font-medium">Produk tidak ditemukan</h3>
          <p className="text-gray-500 mt-2">
            Tidak ada produk yang cocok dengan pencarian {query}.
            <br />
            Coba kata kunci lain atau periksa kesalahan penulisan.
          </p>
        </div>
      )}

      <AnimatePresence>
        {filteredResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                Menampilkan {filteredResults.length} hasil
              </h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <ArrowUpDown size={14} />
                {sortBy.includes("name")
                  ? `Nama (${sortBy.includes("asc") ? "A-Z" : "Z-A"})`
                  : `Harga (${
                      sortBy.includes("asc") ? "Rendah-Tinggi" : "Tinggi-Rendah"
                    })`}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResults.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <Badge>{item.varian}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Barcode:
                          </span>
                          <div className="flex items-center">
                            <Barcode size={16} className="text-gray-400 mr-1" />
                            <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">
                              {item.barcode || "N/A"}
                            </code>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between pt-2">
                      <span className="text-sm text-gray-500">Harga:</span>
                      <span className="font-bold text-lg text-green-600">
                        {typeof item.Harga === "number"
                          ? formatRupiah(item.Harga)
                          : item.Harga}
                      </span>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-40"></div>
    </div>
  );
};

export default Search;
