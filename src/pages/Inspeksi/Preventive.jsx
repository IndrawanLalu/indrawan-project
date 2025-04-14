import { useState, useEffect, useRef, useCallback } from "react";
import { redirect, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { db, storage } from "@/firebase/firebaseConfig";
import PropTypes from "prop-types";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  orderBy,
  Timestamp,
  limit,
  startAfter,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import Leaflet directly for custom marker icons

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarMobile from "../admin/SidebarMobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
// Popover dihapus karena belum diinstall

// Icons
import {
  LuMapPin,
  LuCamera,
  LuCheckCircle,
  LuPlus,
  LuSearch,
  LuAlertTriangle,
  LuLoader2,
  LuImage,
  LuMoreVertical,
  LuPaperclip,
  LuUsers,
  LuCheck,
  LuFolderOpen,
  LuMap,
} from "react-icons/lu";

// Fungsi helper untuk mendapatkan tanggal lokal dalam format YYYY-MM-DD
const getTodayLocal = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-11
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Fungsi untuk format waktu chat
const formatChatTime = (date) => {
  if (!date) return "";
  const options = { hour: "2-digit", minute: "2-digit" };
  return new Date(date).toLocaleTimeString("id-ID", options);
};

// Fungsi untuk format tanggal lengkap
const formatFullDate = (date) => {
  if (!date) return "-";
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString("id-ID", options);
};

// Fungsi untuk mendapatkan inisial nama
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Fungsi untuk mendapatkan warna avatar berdasarkan nama
const getAvatarColor = (name) => {
  if (!name) return "bg-gray-400";
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

// Custom marker icon for map
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-pin-marker",
    html: '<div class="custom-pin bg-red-500 animate-pulse w-4 h-4 rounded-full border-2 border-white shadow-md"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Komponen ChatMessage dengan parameter default langsung di destructuring
const ChatMessage = ({ item, isSameDay = false, onClick }) => {
  const isCompleted = item.status === "Selesai";

  return (
    <>
      {!isSameDay && (
        <div className="flex justify-center my-3">
          <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {formatFullDate(item.tglInspeksi).split(", ")[0]}
          </div>
        </div>
      )}

      <div
        className={`flex mb-3 ${isCompleted ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`relative max-w-[80%] p-3 rounded-lg ${
            isCompleted
              ? "bg-green-50 rounded-tr-none"
              : "bg-white rounded-tl-none"
          } shadow-sm`}
          onClick={() => onClick(item)}
        >
          {!isCompleted && (
            <div className="flex items-center mb-1">
              <Avatar
                className={`w-6 h-6 mr-2 ${getAvatarColor(item.inspektor)}`}
              >
                <AvatarFallback>{getInitials(item.inspektor)}</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium text-blue-600">
                {item.inspektor}
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center mb-1">
              <Avatar
                className={`w-6 h-6 mr-2 ${getAvatarColor(item.eksekutor)}`}
              >
                <AvatarFallback>{getInitials(item.eksekutor)}</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium text-green-600">
                {item.eksekutor}
              </div>
            </div>
          )}

          <div className="mb-1 font-medium">{item.temuan}</div>
          <div className="flex items-center mb-1 text-xs text-gray-500">
            <LuMapPin className="mr-1" size={12} />
            <span>{item.lokasi}</span>
            {item.noGardu && (
              <span className="ml-1">• Gardu: {item.noGardu}</span>
            )}
          </div>

          <div className="mt-1 rounded-md overflow-hidden">
            <img
              src={isCompleted ? item.imageEksekusiURL : item.imageUrl}
              alt={item.temuan}
              className="w-full object-cover rounded"
            />
          </div>

          {isCompleted && (
            <div className="mt-2 text-sm text-gray-700">{item.keterangan}</div>
          )}

          <div className="flex justify-between items-center mt-1">
            <Badge
              className={`${
                isCompleted
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              } text-xs`}
            >
              {isCompleted ? (
                <span className="flex items-center">
                  <LuCheckCircle className="mr-1" size={12} />
                  Selesai
                </span>
              ) : (
                "Perlu Tindakan"
              )}
            </Badge>
            <div className="text-xs text-gray-500 flex items-center">
              {formatChatTime(
                isCompleted ? item.tglEksekusi : item.tglInspeksi
              )}
              {isCompleted && (
                <LuCheck className="ml-1 text-green-500" size={14} />
              )}
            </div>
          </div>

          {/* Tombol aksi untuk temuan yang belum selesai */}
          {!isCompleted && (
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(item);
                }}
                className="bg-green-500 hover:bg-green-600 text-xs py-1 h-8"
              >
                <LuCheckCircle className="mr-1" size={14} /> Eksekusi Temuan
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// PropTypes untuk ChatMessage
ChatMessage.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.string,
    temuan: PropTypes.string,
    lokasi: PropTypes.string,
    noGardu: PropTypes.string,
    inspektor: PropTypes.string,
    eksekutor: PropTypes.string,
    imageUrl: PropTypes.string,
    imageEksekusiURL: PropTypes.string,
    tglInspeksi: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.instanceOf(Date),
    ]),
    tglEksekusi: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.instanceOf(Date),
    ]),
    keterangan: PropTypes.string,
    penyulang: PropTypes.string,
  }).isRequired,
  isSameDay: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

// Custom Marker untuk Peta dengan Popup
const MapMarker = ({ item, onExecFromMap }) => {
  // Parse string coordinates to numbers
  const getCoordinates = () => {
    if (item.location && item.location.includes(",")) {
      const coords = item.location.split(",").map((coord) => coord.trim());
      // Ensure we have valid numbers, not NaN
      if (!isNaN(parseFloat(coords[0])) && !isNaN(parseFloat(coords[1]))) {
        return coords.map(Number);
      }
    }
    // Default coordinates for Jakarta if location is invalid
    return [-6.2088, 106.8456];
  };

  const coordinates = getCoordinates();

  return (
    <Marker position={coordinates} icon={createCustomIcon()}>
      <Popup className="temuan-popup">
        <div className="p-1">
          <h3 className="font-semibold text-md mb-1">{item.temuan}</h3>
          <div className="flex items-center mb-1 text-xs text-gray-500">
            <LuMapPin className="mr-1" size={12} />
            <span>{item.lokasi}</span>
            {item.noGardu && (
              <span className="ml-1">• Gardu: {item.noGardu}</span>
            )}
          </div>

          <div className="rounded-md overflow-hidden my-2">
            <img
              src={item.imageUrl}
              alt={item.temuan}
              className="w-full h-32 object-cover"
            />
          </div>

          <div className="flex justify-between items-center text-xs mb-1">
            <Badge className="bg-red-100 text-red-800">Perlu Tindakan</Badge>
            <span className="text-gray-500">
              {formatChatTime(item.tglInspeksi)}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => onExecFromMap(item)}
            className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white text-xs h-8"
          >
            <LuCheckCircle className="mr-1" size={14} /> Eksekusi Temuan
          </Button>
        </div>
      </Popup>
    </Marker>
  );
};

MapMarker.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    temuan: PropTypes.string,
    lokasi: PropTypes.string,
    noGardu: PropTypes.string,
    imageUrl: PropTypes.string,
    tglInspeksi: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.instanceOf(Date),
    ]),
    location: PropTypes.string,
  }).isRequired,
  onExecClick: PropTypes.func,
  onExecFromMap: PropTypes.func.isRequired,
};

const Preventive = () => {
  const user = useSelector((state) => state.auth.user);
  const selectedPetugasFromRedux = useSelector(
    (state) => state.petugas?.selectedPetugas || []
  );
  const [selectedPetugas, setSelectedPetugas] = useState([]);
  const allowedServicesForYantek = ["/pengukuran-form", "/", "/preventive"];
  const chatEndRef = useRef(null);
  const scrollTopRef = useRef(null); // Referensi untuk elemen di bagian atas

  // State
  const [temuanList, setTemuanList] = useState([]);
  const [filteredTemuanList, setFilteredTemuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Temuan");
  const [selectedTemuan, setSelectedTemuan] = useState(null);
  const [execDialogOpen, setExecDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [firstVisible, setFirstVisible] = useState(null);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const ITEMS_PER_PAGE = 10;

  // Tabs state
  const [activeTab, setActiveTab] = useState("chat");

  // Map state
  const [mapCenter, setMapCenter] = useState([-6.2088, 106.8456]); // Default to Jakarta
  const [mapZoom, setMapZoom] = useState(12);
  const [allPendingTemuanForMap, setAllPendingTemuanForMap] = useState([]); // New state for all pending items
  const [mapLoading, setMapLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false); // New state to track data readiness

  // Execution state
  const [afterImage, setAfterImage] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);
  const [keterangan, setKeterangan] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingExecution, setProcessingExecution] = useState(false);
  const [execDate, setExecDate] = useState(getTodayLocal()); // Format: YYYY-MM-DD

  // Manual execution state
  const [manualExecution, setManualExecution] = useState({
    temuan: "",
    penyulang: "",
    beforeImage: null,
    afterImage: null,
  });
  const [beforeImagePreview, setBeforeImagePreview] = useState(null);
  const [manualAfterImagePreview, setManualAfterImagePreview] = useState(null);
  const [penyulangList, setPenyulangList] = useState([]);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [locationError, setLocationError] = useState(null);
  const [processingManual, setProcessingManual] = useState(false);
  const [manualExecDate, setManualExecDate] = useState(getTodayLocal()); // Format: YYYY-MM-DD
  // State untuk popover dihapus karena menggunakan pendekatan langsung

  const routerLocation = useLocation();

  // Scroll to bottom of chat view
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredTemuanList]);

  // Fetch all pending items for map (separate from pagination)
  useEffect(() => {
    const fetchAllPendingForMap = async () => {
      setMapLoading(true);
      try {
        // Query all items with status not "Selesai" (without limit)
        const q = query(
          collection(db, "inspeksi"),
          where("category", "==", "Preventive"),
          where("status", "!=", "Selesai")
        );
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          tglInspeksi: doc.data().tglInspeksi
            ? new Date(doc.data().tglInspeksi)
            : null,
          tglEksekusi: doc.data().tglEksekusi
            ? new Date(doc.data().tglEksekusi)
            : null,
        }));

        // Filter only for items with valid location
        const validLocationItems = fetchedData.filter(
          (item) => item.location && item.location.includes(",")
        );

        setAllPendingTemuanForMap(validLocationItems);

        // Set map center to the first valid temuan location if available
        if (validLocationItems.length > 0) {
          const firstItemWithValidLocation = validLocationItems[0];
          try {
            const coords = firstItemWithValidLocation.location
              .split(",")
              .map(Number);
            if (!isNaN(coords[0]) && !isNaN(coords[1])) {
              setMapCenter(coords);
            }
          } catch (error) {
            console.error("Error parsing coordinates:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching map data: ", error);
      } finally {
        setMapLoading(false);
      }
    };

    fetchAllPendingForMap();
  }, []); // Execute once on component mount

  // Load data yang lebih lama (tanggal lebih awal) ketika scrolling ke atas
  const loadOlderData = useCallback(async () => {
    if (!hasMoreOlder || loadingMore) return;

    setLoadingMore(true);

    // Tangkap elemen chat container dan simpan informasi scrollnya
    const chatContainer = document.querySelector(".overflow-y-auto");
    let scrollInfo = null;

    if (chatContainer) {
      scrollInfo = {
        scrollHeight: chatContainer.scrollHeight,
        scrollTop: chatContainer.scrollTop,
        clientHeight: chatContainer.clientHeight,
        scrollBottom: chatContainer.scrollHeight - chatContainer.scrollTop,
      };
    }

    try {
      const q = query(
        collection(db, "inspeksi"),
        where("category", "==", "Preventive"),
        orderBy("tglEksekusi", "desc"),
        startAfter(firstVisible),
        limit(ITEMS_PER_PAGE)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setHasMoreOlder(false);
        setLoadingMore(false);
        return;
      }

      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        tglInspeksi: doc.data().tglInspeksi
          ? new Date(doc.data().tglInspeksi)
          : null,
        tglEksekusi: doc.data().tglEksekusi
          ? new Date(doc.data().tglEksekusi)
          : null,
      }));

      // Update firstVisible for next pagination
      setFirstVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

      // Update states in batch
      const updateStates = () => {
        setTemuanList((prevData) => {
          const existingIds = new Set(prevData.map((item) => item.id));
          const uniqueNewData = fetchedData.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...prevData, ...uniqueNewData];
        });

        // Apply filters to new data
        setFilteredTemuanList((prevData) => {
          const existingIds = new Set(prevData.map((item) => item.id));
          let uniqueNewData = fetchedData.filter(
            (item) => !existingIds.has(item.id)
          );

          if (searchQuery) {
            uniqueNewData = uniqueNewData.filter(
              (item) =>
                item.temuan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.noGardu &&
                  item.noGardu
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()))
            );
          }

          if (filterCategory !== "all") {
            uniqueNewData = uniqueNewData.filter(
              (item) => item.status === filterCategory
            );
          }

          return [...prevData, ...uniqueNewData];
        });
      };

      // Update states
      updateStates();

      // Restore scroll position properly
      if (scrollInfo) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            if (chatContainer) {
              chatContainer.scrollTop =
                chatContainer.scrollHeight - scrollInfo.scrollBottom;
            }
          });
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching older data: ", error);
    } finally {
      setLoadingMore(false);
    }
  }, [firstVisible, hasMoreOlder, loadingMore, searchQuery, filterCategory]);

  // Setup IntersectionObserver untuk infinite scrolling ke atas
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMoreOlder && !loadingMore) {
        const debounceTimer = setTimeout(() => {
          loadOlderData();
        }, 100);

        return () => clearTimeout(debounceTimer);
      }
    }, options);

    const currentRef = scrollTopRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [scrollTopRef, hasMoreOlder, loadingMore, loadOlderData]);

  // Effect untuk membuka modal saat parameter URL terdeteksi
  useEffect(() => {
    // Cek apakah ada parameter 'action=openManualDialog' di URL
    const searchParams = new URLSearchParams(routerLocation.search);
    const action = searchParams.get("action");

    if (action === "openManualDialog") {
      // Buka dialog eksekusi manual
      setManualDialogOpen(true);

      // Clear URL parameter setelah modal dibuka
      const url = new URL(window.location);
      url.searchParams.delete("action");
      window.history.pushState({}, "", url);
    }
  }, [routerLocation]);

  useEffect(() => {
    // Cek jika data dari Redux tersedia
    if (selectedPetugasFromRedux && selectedPetugasFromRedux.length > 0) {
      setSelectedPetugas(selectedPetugasFromRedux);
      // Backup ke localStorage
      localStorage.setItem(
        "selectedPetugas",
        JSON.stringify(selectedPetugasFromRedux)
      );
    } else {
      // Jika tidak ada di Redux, coba ambil dari localStorage
      const storedPetugas = localStorage.getItem("selectedPetugas");
      if (storedPetugas) {
        try {
          const parsedPetugas = JSON.parse(storedPetugas);
          setSelectedPetugas(parsedPetugas);
        } catch (error) {
          console.error("Error parsing stored petugas:", error);
        }
      }
    }
  }, [selectedPetugasFromRedux]);

  // Tambahkan log untuk debugging
  useEffect(() => {
    console.log("Current petugas data:", selectedPetugas);

    // Setup interval untuk memeriksa data petugas setiap menit
    const checkInterval = setInterval(() => {
      if (!selectedPetugas || selectedPetugas.length === 0) {
        // Coba ambil dari localStorage jika data hilang
        const storedPetugas = localStorage.getItem("selectedPetugas");
        if (storedPetugas) {
          try {
            const parsedPetugas = JSON.parse(storedPetugas);
            if (parsedPetugas && parsedPetugas.length > 0) {
              console.log("Restoring petugas data from localStorage");
              setSelectedPetugas(parsedPetugas);
            }
          } catch (error) {
            console.error("Error parsing stored petugas:", error);
          }
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [selectedPetugas]);

  // Tambahkan ping session untuk memastikan session tetap aktif
  useEffect(() => {
    const pingInterval = setInterval(() => {
      // Ping untuk menjaga session aktif
      console.log("Pinging to keep session alive", new Date().toISOString());
    }, 60000); // Ping every minute

    return () => clearInterval(pingInterval);
  }, []);

  // Fetch location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setLocationError(err.message);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Fetch penyulang list for dropdown
  useEffect(() => {
    const fetchPenyulang = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "penyulang"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPenyulangList(fetchedData);
      } catch (error) {
        console.error("Error fetching penyulang data: ", error);
      }
    };
    fetchPenyulang();
  }, []);

  // Fetch temuan with preventive category with pagination
  useEffect(() => {
    const fetchTemuan = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "inspeksi"),
          where("category", "==", "Preventive"),
          orderBy("tglInspeksi", "desc"), // Desc = data terbaru terlebih dahulu
          limit(ITEMS_PER_PAGE)
        );
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          tglInspeksi: doc.data().tglInspeksi
            ? new Date(doc.data().tglInspeksi)
            : null,
          tglEksekusi: doc.data().tglEksekusi
            ? new Date(doc.data().tglEksekusi)
            : null,
        }));

        // Simpan referensi dokumen terakhir untuk pagination
        if (querySnapshot.docs.length > 0) {
          setFirstVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        } else {
          setHasMoreOlder(false);
        }

        setTemuanList(fetchedData);
        setFilteredTemuanList(fetchedData);

        // Tandai data sudah siap untuk filter
        setIsDataReady(true);
      } catch (error) {
        console.error("Error fetching temuan data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemuan();
  }, []);

  // Filter temuan based on search and filter AFTER data is ready
  useEffect(() => {
    // Only apply filters when data is ready
    if (isDataReady) {
      let filtered = [...temuanList];

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (item) =>
            item.temuan.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.noGardu &&
              item.noGardu.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Apply status filter
      if (filterCategory !== "all") {
        filtered = filtered.filter((item) => item.status === filterCategory);
      }

      setFilteredTemuanList(filtered);
    }
  }, [searchQuery, filterCategory, temuanList, isDataReady]);

  // Handle image change for execution
  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi camera dan gallery diimplementasikan langsung dalam tombol

  // Handle manual execution image changes
  const handleManualImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setManualExecution({
        ...manualExecution,
        [type]: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "beforeImage") {
          setBeforeImagePreview(reader.result);
        } else {
          setManualAfterImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Check if two dates are same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // Handle submit execution dengan tanggal yang dipilih
  const handleSubmitExecution = async () => {
    if (!afterImage) {
      alert("Silakan upload foto setelah pengerjaan");
      return;
    }

    if (!keterangan) {
      alert("Silakan isi keterangan pengerjaan");
      return;
    }

    if (selectedPetugas.length === 0) {
      alert("Data petugas tidak ditemukan. Silakan login kembali.");
      return;
    }

    setProcessingExecution(true);

    try {
      // Upload after image
      const afterImageRef = ref(
        storage,
        `execution/${Date.now()}_${afterImage.name}`
      );
      const uploadTask = uploadBytesResumable(afterImageRef, afterImage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error uploading image: ", error);
          setProcessingExecution(false);
        },
        async () => {
          // Get download URL
          const afterImageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Update temuan document dengan tanggal yang dipilih
          const temuanRef = doc(db, "inspeksi", selectedTemuan.id);
          await updateDoc(temuanRef, {
            status: "Selesai",
            imageEksekusiURL: afterImageUrl,
            eksekutor: selectedPetugas.map((p) => p.nama).join(", "),
            petugasIds: selectedPetugas.map((p) => p.id),
            tglEksekusi: execDate,
            keterangan,
          });

          // Update local state
          const updatedTemuanList = temuanList.map((item) => {
            if (item.id === selectedTemuan.id) {
              return {
                ...item,
                status: "Selesai",
                imageEksekusiURL: afterImageUrl,
                eksekutor: selectedPetugas.map((p) => p.nama).join(", "),
                petugasIds: selectedPetugas.map((p) => p.id),
                tglEksekusi: new Date(execDate),
                keterangan,
              };
            }
            return item;
          });

          setTemuanList(updatedTemuanList);
          setFilteredTemuanList(updatedTemuanList);

          // Update map data (remove this item from map)
          setAllPendingTemuanForMap((prevMapData) =>
            prevMapData.filter((item) => item.id !== selectedTemuan.id)
          );

          // Reset state
          setAfterImage(null);
          setAfterImagePreview(null);
          setKeterangan("");
          setUploadProgress(0);
          setExecDialogOpen(false);
          setProcessingExecution(false);
          setExecDate(getTodayLocal()); // Reset tanggal ke hari ini lokal

          // Show success message
          alert("Eksekusi temuan berhasil disimpan!");
        }
      );
    } catch (error) {
      console.error("Error submitting execution: ", error);
      setProcessingExecution(false);
      alert("Gagal menyimpan eksekusi. Silakan coba lagi.");
    }
  };

  // Handle manual execution submit dengan tanggal yang dipilih
  const handleSubmitManualExecution = async () => {
    const { temuan, penyulang, beforeImage, afterImage } = manualExecution;

    if (!temuan || !penyulang || !beforeImage || !afterImage) {
      alert("Silakan lengkapi semua field yang diperlukan");
      return;
    }

    if (selectedPetugas.length === 0) {
      alert("Data petugas tidak ditemukan. Silakan login kembali.");
      return;
    }

    setProcessingManual(true);

    try {
      // Upload before image
      const beforeImageRef = ref(
        storage,
        `manual/${Date.now()}_before_${beforeImage.name}`
      );
      const beforeUploadTask = uploadBytesResumable(
        beforeImageRef,
        beforeImage
      );

      beforeUploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress / 2); // First half of progress
        },
        (error) => {
          console.error("Error uploading before image: ", error);
          setProcessingManual(false);
        },
        async () => {
          // Get before image download URL
          const beforeImageUrl = await getDownloadURL(
            beforeUploadTask.snapshot.ref
          );

          // Upload after image
          const afterImageRef = ref(
            storage,
            `manual/${Date.now()}_after_${afterImage.name}`
          );
          const afterUploadTask = uploadBytesResumable(
            afterImageRef,
            afterImage
          );

          afterUploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(50 + progress / 2); // Second half of progress
            },
            (error) => {
              console.error("Error uploading after image: ", error);
              setProcessingManual(false);
            },
            async () => {
              // Get after image download URL
              const afterImageUrl = await getDownloadURL(
                afterUploadTask.snapshot.ref
              );

              // Dapatkan alamat/lokasi dari koordinat
              const lokasi =
                location.lat && location.lng
                  ? `Lokasi Koordinat: ${location.lat.toFixed(
                      6
                    )}, ${location.lng.toFixed(6)}`
                  : "Lokasi tidak tersedia";

              // Add new document dengan tanggal yang dipilih
              await addDoc(collection(db, "inspeksi"), {
                imageUrl: beforeImageUrl,
                imageEksekusiURL: afterImageUrl,
                temuan,
                lokasi: lokasi,
                noGardu: "",
                inspektor: selectedPetugas.map((p) => p.nama).join(", "),
                eksekutor: selectedPetugas.map((p) => p.nama).join(", "),
                petugasIds: selectedPetugas.map((p) => p.id),
                penyulang,
                category: "Preventive",
                tglInspeksi: getTodayLocal(),
                tglEksekusi: manualExecDate,
                status: "Selesai",
                keterangan: "Eksekusi langsung oleh petugas",
                location:
                  location.lat && location.lng
                    ? `${location.lat}, ${location.lng}`
                    : "",
                manualExecution: true,
                createdAt: Timestamp.now(),
              });

              // Reset state
              setManualExecution({
                temuan: "",
                penyulang: "",
                beforeImage: null,
                afterImage: null,
              });
              setBeforeImagePreview(null);
              setManualAfterImagePreview(null);
              setUploadProgress(0);
              setManualDialogOpen(false);
              setProcessingManual(false);
              setManualExecDate(getTodayLocal()); // Reset tanggal ke hari ini lokal

              // Fetch temuan baru di halaman pertama
              const q = query(
                collection(db, "inspeksi"),
                where("category", "==", "Preventive"),
                orderBy("tglInspeksi", "desc"),
                limit(ITEMS_PER_PAGE)
              );
              const querySnapshot = await getDocs(q);
              const fetchedData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                tglInspeksi: doc.data().tglInspeksi
                  ? new Date(doc.data().tglInspeksi)
                  : null,
                tglEksekusi: doc.data().tglEksekusi
                  ? new Date(doc.data().tglEksekusi)
                  : null,
              }));

              if (querySnapshot.docs.length > 0) {
                setFirstVisible(
                  querySnapshot.docs[querySnapshot.docs.length - 1]
                );
                setHasMoreOlder(true);
              }

              setTemuanList(fetchedData);
              setFilteredTemuanList(fetchedData);

              // Show success message
              alert("Eksekusi manual berhasil disimpan!");
              redirect("/preventive");
            }
          );
        }
      );
    } catch (error) {
      console.error("Error submitting manual execution: ", error);
      setProcessingManual(false);
      alert("Gagal menyimpan eksekusi manual. Silakan coba lagi.");
    }
  };

  // Buka dialog eksekusi dengan temuan yang dipilih
  const handleChatItemClick = (item) => {
    if (item.status !== "Selesai") {
      setSelectedTemuan(item);
      setExecDialogOpen(true);
    } else {
      setSelectedTemuan(item);
      setDetailDialogOpen(true);
    }
  };

  // Handler khusus untuk eksekusi dari map
  const handleExecFromMap = (item) => {
    // Beralih ke tab chat terlebih dahulu
    setActiveTab("chat");

    // Setelah beralih tab, baru buka dialog eksekusi
    setTimeout(() => {
      setSelectedTemuan(item);
      setExecDialogOpen(true);
    }, 100); // Delay kecil untuk memastikan tab beralih dulu
  };

  // Render WhatsApp-style chat interface
  const renderChatView = () => {
    if (loading && temuanList.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <LuLoader2 className="animate-spin text-main mr-2" size={24} />
          <span>Memuat percakapan...</span>
        </div>
      );
    }

    if (filteredTemuanList.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-full">
          <div className="bg-gray-50 p-8 rounded-full mb-4">
            <LuAlertTriangle className="text-gray-400" size={48} />
          </div>
          <p className="text-gray-500">
            {searchQuery || filterCategory !== "all"
              ? "Tidak ada temuan yang sesuai dengan pencarian"
              : "Belum ada temuan preventive yang tercatat"}
          </p>
          <Button
            onClick={() => setManualDialogOpen(true)}
            className="mt-4 bg-main hover:bg-blue-700"
          >
            <LuPlus size={16} className="mr-2" /> Tambah Temuan Baru
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#e5e5e5]">
          {/* Loading indicator di atas untuk data yang lebih lama */}
          {hasMoreOlder && (
            <div
              ref={scrollTopRef}
              className="flex justify-center items-center py-4"
            >
              {loadingMore ? (
                <div className="flex items-center">
                  <LuLoader2
                    className="animate-spin text-main mr-2"
                    size={20}
                  />
                  <span className="text-sm text-gray-500">
                    Memuat data lama...
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Scroll ke atas untuk melihat data lebih lama
                </div>
              )}
            </div>
          )}

          {filteredTemuanList.map((item, index) => (
            <ChatMessage
              key={item.id}
              item={item}
              isSameDay={
                index > 0 &&
                isSameDay(
                  item.status === "Selesai"
                    ? item.tglEksekusi
                    : item.tglInspeksi,
                  filteredTemuanList[index - 1].status === "Selesai"
                    ? filteredTemuanList[index - 1].tglEksekusi
                    : filteredTemuanList[index - 1].tglInspeksi
                )
              }
              onClick={handleChatItemClick}
            />
          ))}

          <div ref={chatEndRef} />
        </div>

        {/* Chat input area */}
        <div className="bg-[#f0f0f0] p-3 flex items-center space-x-2 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:bg-gray-200 rounded-full"
                  onClick={() => setManualDialogOpen(true)}
                >
                  <LuPaperclip size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tambah temuan baru</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik untuk mencari temuan..."
              className="flex-1 outline-none"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500"
              onClick={() => setSearchQuery(newMessage)}
            >
              <LuSearch size={20} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full"
            onClick={() => setManualDialogOpen(true)}
          >
            <LuPlus size={24} />
          </Button>
        </div>
      </div>
    );
  };

  // Render Map view (now using allPendingTemuanForMap)
  const renderMapView = () => {
    if (mapLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <LuLoader2 className="animate-spin text-main mr-2" size={24} />
          <span>Memuat peta temuan...</span>
        </div>
      );
    }

    if (allPendingTemuanForMap.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-full">
          <div className="bg-gray-50 p-8 rounded-full mb-4">
            <LuMap className="text-gray-400" size={48} />
          </div>
          <p className="text-gray-500">
            Tidak ada temuan yang perlu ditindaklanjuti saat ini
          </p>
          <Button
            onClick={() => setManualDialogOpen(true)}
            className="mt-4 bg-main hover:bg-blue-700"
          >
            <LuPlus size={16} className="mr-2" /> Tambah Temuan Baru
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Map container */}
        <div className="flex-1 relative">
          {/* Map info panel */}
          <div className="absolute top-2 left-2 right-2 z-10 bg-white bg-opacity-90 rounded-lg p-3 shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                Peta Temuan Preventif
              </h3>
              <Badge className="bg-red-100 text-red-800">
                {allPendingTemuanForMap.length} Perlu Tindakan
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Klik pada titik merah untuk melihat detail temuan
            </p>
          </div>

          {/* Map view */}
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {allPendingTemuanForMap.map((item) => (
              <MapMarker
                key={item.id}
                item={item}
                onExecClick={handleChatItemClick}
                onExecFromMap={handleExecFromMap}
              />
            ))}
          </MapContainer>

          {/* Map controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white shadow-md hover:bg-gray-100 h-10 w-10 p-0 rounded-full"
              onClick={() => setMapZoom((prev) => Math.min(prev + 1, 18))}
            >
              <span className="text-xl">+</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white shadow-md hover:bg-gray-100 h-10 w-10 p-0 rounded-full"
              onClick={() => setMapZoom((prev) => Math.max(prev - 1, 5))}
            >
              <span className="text-xl">-</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white shadow-md hover:bg-gray-100 h-10 w-10 p-0 rounded-full"
              onClick={() => {
                // Get user's current location if available
                if (location.lat && location.lng) {
                  setMapCenter([location.lat, location.lng]);
                  setMapZoom(15);
                }
              }}
            >
              <LuMapPin size={18} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* WhatsApp-style header */}
      <div className="fixed top-0 right-0 bg-[#128C7E] text-white h-16 w-full z-10 flex items-center px-4 shadow-md">
        <div className="flex items-center">
          <div>{/* Header content */}</div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[130px] border-0 bg-green-600 text-white text-xs h-8">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Temuan">Belum Dikerjakan</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="text-white">
            <LuSearch size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <LuMoreVertical size={20} />
          </Button>
        </div>
      </div>

      {/* SidebarMobile untuk navigasi */}
      <SidebarMobile pengguna={user} ruteDisetujui={allowedServicesForYantek} />

      {/* Main content - WhatsApp chat style atau Traditional tabs */}
      <div className="mt-16 flex-1 flex flex-col h-[calc(100vh-4rem)]">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3 mb-1">
            <TabsTrigger value="chat" className="text-sm flex items-center">
              <LuUsers className="mr-2" /> Chat Group
            </TabsTrigger>
            <TabsTrigger value="map" className="text-sm flex items-center">
              <LuMap className="mr-2" /> Peta Temuan
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-sm flex items-center">
              <LuPlus className="mr-2" /> Tambah Eksekusi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 overflow-hidden">
            {renderChatView()}
          </TabsContent>

          <TabsContent value="map" className="flex-1 overflow-hidden">
            {renderMapView()}
          </TabsContent>

          <TabsContent value="manual" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Eksekusi Manual Preventive</CardTitle>
                <CardDescription>
                  Rekam dan laporkan pekerjaan preventive yang ditemukan dan
                  dikerjakan langsung di lapangan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setManualDialogOpen(true)}
                  className="w-full bg-main hover:bg-blue-700 flex items-center justify-center gap-2 py-8"
                >
                  <LuPlus size={20} />
                  <span className="text-lg">Tambah Eksekusi Manual</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Tambahkan CSS untuk animasi peta */}
      <style>{`
        .custom-pin {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(255, 0, 0, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          }
        }
        
        .temuan-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          overflow: hidden;
        }
        
        /* Dialog di atas map */
        .dialog-overlay {
          z-index: 1001 !important;
        }
        
        /* Pastikan modal dialog selalu tampil di atas peta */
        [data-radix-popper-content-wrapper] {
          z-index: 1100 !important;
        }
      `}</style>

      {/* Modal Detail Temuan */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Temuan Preventive</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang temuan preventive
            </DialogDescription>
          </DialogHeader>

          {selectedTemuan && (
            <ScrollArea className="pr-3">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-gray-500 text-sm">Temuan</Label>
                    <p className="font-medium">{selectedTemuan.temuan}</p>
                  </div>

                  <div>
                    <Label className="text-gray-500 text-sm">Lokasi</Label>
                    <p>{selectedTemuan.lokasi}</p>
                  </div>

                  <div>
                    <Label className="text-gray-500 text-sm">No. Gardu</Label>
                    <p>{selectedTemuan.noGardu || "-"}</p>
                  </div>

                  <div>
                    <Label className="text-gray-500 text-sm">Penyulang</Label>
                    <p>{selectedTemuan.penyulang}</p>
                  </div>

                  <div>
                    <Label className="text-gray-500 text-sm">Status</Label>
                    <Badge
                      className={`${
                        selectedTemuan.status === "Selesai"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      } mt-1`}
                    >
                      {selectedTemuan.status === "Selesai"
                        ? "Selesai"
                        : "Belum Dikerjakan"}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-gray-500 text-sm">
                      Tanggal Inspeksi
                    </Label>
                    <p>{formatDate(selectedTemuan.tglInspeksi)}</p>
                  </div>

                  <div>
                    <Label className="text-gray-500 text-sm">Inspektor</Label>
                    <p>{selectedTemuan.inspektor}</p>
                  </div>

                  {selectedTemuan.status === "Selesai" && (
                    <>
                      <div>
                        <Label className="text-gray-500 text-sm">
                          Tanggal Eksekusi
                        </Label>
                        <p>{formatDate(selectedTemuan.tglEksekusi)}</p>
                      </div>

                      <div>
                        <Label className="text-gray-500 text-sm">
                          Eksekutor
                        </Label>
                        <p>{selectedTemuan.eksekutor}</p>
                      </div>

                      <div className="col-span-2">
                        <Label className="text-gray-500 text-sm">
                          Keterangan
                        </Label>
                        <p>{selectedTemuan.keterangan}</p>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <Label className="text-gray-500 text-sm">Foto Temuan</Label>
                  <div className="mt-1 rounded-md overflow-hidden border">
                    <img
                      src={selectedTemuan.imageUrl}
                      alt="Foto Temuan"
                      className="w-full object-contain"
                    />
                  </div>
                </div>

                {selectedTemuan.status === "Selesai" &&
                  selectedTemuan.imageEksekusiURL && (
                    <div>
                      <Label className="text-gray-500 text-sm">
                        Foto Setelah Eksekusi
                      </Label>
                      <div className="mt-1 rounded-md overflow-hidden border">
                        <img
                          src={selectedTemuan.imageEksekusiURL}
                          alt="Foto Eksekusi"
                          className="w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                {selectedTemuan.location && (
                  <div>
                    <Label className="text-gray-500 text-sm">
                      Lokasi di Peta
                    </Label>
                    <div className="mt-1 h-48 rounded-md overflow-hidden border">
                      {selectedTemuan.location.includes(",") && (
                        <MapContainer
                          center={selectedTemuan.location
                            .split(",")
                            .map(Number)}
                          zoom={15}
                          scrollWheelZoom={false}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker
                            position={selectedTemuan.location
                              .split(",")
                              .map(Number)}
                          >
                            <Popup>{selectedTemuan.lokasi}</Popup>
                          </Marker>
                        </MapContainer>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Tutup
            </Button>

            {selectedTemuan && selectedTemuan.status !== "Selesai" && (
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  setExecDialogOpen(true);
                }}
              >
                Eksekusi Temuan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eksekusi Temuan */}
      <Dialog
        open={execDialogOpen}
        onOpenChange={(open) => {
          setExecDialogOpen(open);
          // Jika dialog ditutup, pastikan tab map tidak aktif untuk menghindari konflik UI
          if (!open && activeTab === "map") {
            setActiveTab("chat");
          }
        }}
      >
        <DialogContent className="sm:max-w-xl z-50">
          <DialogHeader>
            <DialogTitle>Eksekusi Temuan</DialogTitle>
            <DialogDescription>
              Rekam hasil pengerjaan temuan preventive
            </DialogDescription>
          </DialogHeader>

          {selectedTemuan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Temuan</Label>
                  <p className="mt-1 p-2 border rounded-md bg-gray-50">
                    {selectedTemuan.temuan}
                  </p>
                </div>

                <div>
                  <Label>Lokasi</Label>
                  <p className="mt-1 p-2 border rounded-md bg-gray-50">
                    {selectedTemuan.lokasi}
                  </p>
                </div>

                <div>
                  <Label>Penyulang</Label>
                  <p className="mt-1 p-2 border rounded-md bg-gray-50">
                    {selectedTemuan.penyulang}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Foto Temuan</Label>
                  <div className="mt-1 aspect-video rounded-md overflow-hidden border">
                    <img
                      src={selectedTemuan.imageUrl}
                      alt="Foto Temuan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="afterImage">Foto Setelah Eksekusi</Label>
                  <div className="mt-1 aspect-video rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center">
                    {afterImagePreview ? (
                      <img
                        src={afterImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <LuImage
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={() => {
                              const input =
                                document.getElementById("afterImage");
                              input.setAttribute("capture", "environment");
                              input.click();
                            }}
                          >
                            <LuCamera className="mr-1" size={16} />
                            <span>Kamera</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={() => {
                              const input =
                                document.getElementById("afterImage");
                              input.removeAttribute("capture");
                              input.click();
                            }}
                          >
                            <LuFolderOpen className="mr-1" size={16} />
                            <span>Galeri</span>
                          </Button>
                        </div>

                        <Input
                          id="afterImage"
                          type="file"
                          accept="image/*"
                          onChange={handleAfterImageChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="keterangan">Keterangan Pengerjaan</Label>
                <Textarea
                  id="keterangan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Isiakan keterangan pengerjaan.."
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Gunakan input tanggal standar HTML - disabled */}
              <div>
                <Label htmlFor="tglEksekusi">Tanggal Eksekusi</Label>
                <Input
                  id="tglEksekusi"
                  type="date"
                  value={execDate}
                  onChange={(e) => setExecDate(e.target.value)}
                  className="mt-1"
                  disabled={true}
                />
              </div>

              <div>
                <Label>Petugas</Label>
                <p className="mt-1 p-2 border rounded-md bg-gray-50">
                  {selectedPetugas.length > 0
                    ? selectedPetugas.map((p) => p.nama).join(", ")
                    : "Tidak ada petugas yang dipilih"}
                </p>
              </div>

              {uploadProgress > 0 && (
                <div>
                  <Label>Progress Upload</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExecDialogOpen(false);
                setAfterImage(null);
                setAfterImagePreview(null);
                setKeterangan("");
                setUploadProgress(0);
                setExecDate(getTodayLocal());
              }}
              disabled={processingExecution}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitExecution}
              disabled={!afterImage || !keterangan || processingExecution}
              className="bg-main hover:bg-blue-700"
            >
              {processingExecution ? (
                <>
                  <LuLoader2 className="mr-2 animate-spin" /> Memproses...
                </>
              ) : (
                "Simpan Eksekusi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eksekusi Manual */}
      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Eksekusi Manual Preventive</DialogTitle>
            <DialogDescription>
              Rekam pekerjaan preventive yang ditemukan dan dikerjakan langsung
              di lapangan
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="pr-3">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label
                    htmlFor="manual-temuan"
                    className="text-sm font-medium"
                  >
                    Temuan
                  </Label>
                  {/* Dropdown untuk temuan */}
                  <Select
                    value={manualExecution.temuan}
                    onValueChange={(value) =>
                      setManualExecution({
                        ...manualExecution,
                        temuan: value,
                      })
                    }
                  >
                    <SelectTrigger id="manual-temuan" className="mt-1">
                      <SelectValue placeholder="Pilih jenis temuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pohon">Pohon</SelectItem>
                      <SelectItem value="Layangan">Layangan</SelectItem>
                      <SelectItem value="Sarang burung">
                        Sarang burung
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label
                    htmlFor="manual-penyulang"
                    className="text-sm font-medium"
                  >
                    Penyulang
                  </Label>
                  <Select
                    value={manualExecution.penyulang}
                    onValueChange={(value) =>
                      setManualExecution({
                        ...manualExecution,
                        penyulang: value,
                      })
                    }
                  >
                    <SelectTrigger id="manual-penyulang" className="mt-1">
                      <SelectValue placeholder="Pilih penyulang" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <ScrollArea className="h-40">
                        {penyulangList.map((item) => (
                          <SelectItem key={item.id} value={item.penyulang}>
                            {item.penyulang}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="manual-before-image"
                    className="text-sm font-medium"
                  >
                    Foto Sebelum
                  </Label>
                  <div className="mt-1 aspect-video rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center">
                    {beforeImagePreview ? (
                      <img
                        src={beforeImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <LuCamera
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={() => {
                              const input = document.getElementById(
                                "manual-before-image"
                              );
                              input.setAttribute("capture", "environment");
                              input.click();
                            }}
                          >
                            <LuCamera className="mr-1" size={16} />
                            <span>Kamera</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={() => {
                              const input = document.getElementById(
                                "manual-before-image"
                              );
                              input.removeAttribute("capture");
                              input.click();
                            }}
                          >
                            <LuFolderOpen className="mr-1" size={16} />
                            <span>Galeri</span>
                          </Button>
                        </div>
                        <Input
                          id="manual-before-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleManualImageChange(e, "beforeImage")
                          }
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="manual-after-image"
                    className="text-sm font-medium"
                  >
                    Foto Setelah
                  </Label>
                  <div className="mt-1 aspect-video rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center">
                    {manualAfterImagePreview ? (
                      <img
                        src={manualAfterImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <LuCamera
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={() => {
                              const input =
                                document.getElementById("manual-after-image");
                              input.setAttribute("capture", "environment");
                              input.click();
                            }}
                          >
                            <LuCamera className="mr-1" size={16} />
                            <span>Kamera</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={() => {
                              const input =
                                document.getElementById("manual-after-image");
                              input.removeAttribute("capture");
                              input.click();
                            }}
                          >
                            <LuFolderOpen className="mr-1" size={16} />
                            <span>Galeri</span>
                          </Button>
                        </div>
                        <Input
                          id="manual-after-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleManualImageChange(e, "afterImage")
                          }
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tanggal Eksekusi - disabled */}
                <div className="col-span-2">
                  <Label
                    htmlFor="manual-tglEksekusi"
                    className="text-sm font-medium"
                  >
                    Tanggal Eksekusi
                  </Label>
                  <Input
                    id="manual-tglEksekusi"
                    type="date"
                    value={manualExecDate}
                    onChange={(e) => setManualExecDate(e.target.value)}
                    className="mt-1"
                    disabled={true}
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-sm font-medium">Lokasi di Peta</Label>
                  <div className="mt-1 h-48 rounded-md overflow-hidden border">
                    {location.lat && location.lng ? (
                      <MapContainer
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
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Mengambil lokasi...</p>
                      </div>
                    )}
                  </div>
                  {locationError && (
                    <p className="text-red-500 text-sm mt-1">{locationError}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label className="text-sm font-medium">Petugas</Label>
                  <p className="mt-1 p-2 border rounded-md bg-gray-50">
                    {selectedPetugas.length > 0
                      ? selectedPetugas.map((p) => p.nama).join(", ")
                      : "Tidak ada petugas yang dipilih"}
                  </p>
                </div>

                {uploadProgress > 0 && (
                  <div className="col-span-2">
                    <Label>Progress Upload</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setManualDialogOpen(false);
                setManualExecution({
                  temuan: "",
                  penyulang: "",
                  beforeImage: null,
                  afterImage: null,
                });
                setBeforeImagePreview(null);
                setManualAfterImagePreview(null);
                setUploadProgress(0);
                setManualExecDate(getTodayLocal());
              }}
              disabled={processingManual}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitManualExecution}
              disabled={
                !manualExecution.temuan ||
                !manualExecution.penyulang ||
                !manualExecution.beforeImage ||
                !manualExecution.afterImage ||
                processingManual
              }
              className="bg-main hover:bg-blue-700"
            >
              {processingManual ? (
                <>
                  <LuLoader2 className="mr-2 animate-spin" /> Memproses...
                </>
              ) : (
                "Simpan Eksekusi Manual"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Preventive;
