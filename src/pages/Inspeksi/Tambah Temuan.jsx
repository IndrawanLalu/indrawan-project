import { useEffect, useState } from "react";
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
import Layouts from "../admin/Layouts";

const TambahTemuan = () => {
  const [image, setImage] = useState(null);
  const [temuan, setTemuan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [noGardu, setNoGardu] = useState("");
  const [inspektor, setInspektor] = useState("");
  const [penyulang, setPenyulang] = useState("");
  const [category, setCategory] = useState("");
  const [tglInspeksi, setTglInspeksi] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [error, setError] = useState(null);

  const [data, setData] = useState([]);
  const [dataGardu, setDataGardu] = useState([]);
  const [filteredGardu, setFilteredGardu] = useState([]);

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
  useEffect(() => {
    // Fetch data dari public folder
    fetch("/db/amg.json")
      .then((response) => response.json())
      .then((data) => setDataGardu(data));
  }, []);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (noGardu) {
        setFilteredGardu(
          dataGardu.filter((item) =>
            item.nama.toLowerCase().includes(noGardu.toLowerCase())
          )
        );
      } else {
        setFilteredGardu([]);
      }
    }, 2000); // Delay selama 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [noGardu, dataGardu]);

  // Mengambil koordinat lokasi pengguna secara otomatis
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
          setError(err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendWhatsAppMessage = (message, imageUrl) => {
    const groupId = "120363277434509822"; // Ganti dengan ID grup WhatsApp Anda
    const encodedMessage = encodeURIComponent(
      `${message}\n\n📸 Foto: ${imageUrl}`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=&text=${encodedMessage}&group_id=${groupId}`;

    window.open(whatsappUrl, "_blank");
  };
  const handleSubmitTemuan = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debugging log
    if (
      !temuan ||
      !image ||
      !lokasi ||
      !inspektor ||
      !penyulang ||
      !category ||
      !tglInspeksi
    ) {
      alert("Please fill all fields.");
      return;
    }
    if (!location.lat || !location.lng) {
      alert("Could not fetch location.");
      return;
    }

    try {
      setIsLoading(true);
      const imageRef = ref(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(imageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progressPercentage =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercentage);
        },
        (error) => {
          console.error("Error uploading file: ", error);
          setIsLoading(false);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, "inspeksi"), {
            imageUrl,
            temuan,
            lokasi,
            noGardu,
            inspektor,
            penyulang,
            category,
            tglInspeksi,
            status: "Temuan",
            imageEksekusiURL: "",
            eksekutor: "",
            tglEksekusi: "",
            keterangan: "",
            location: `${location.lat}, ${location.lng}`,
          });

          // Buat pesan yang akan dikirim ke WhatsApp
          const message = `📢 Temuan Baru 📢
        🔹 Temuan: ${temuan}
        📍 Lokasi: ${lokasi}
        📅 Tgl Inspeksi: ${tglInspeksi}
        👷‍♂️ Inspektor: ${inspektor}
        🔌 Penyulang: ${penyulang}
        🏗️ Kategori: ${category}
        🌍 Koordinat: ${location.lat}, ${location.lng}`;

          sendWhatsAppMessage(message, imageUrl);

          setTemuan("");
          setLokasi("");
          setNoGardu("");
          setInspektor("");
          setPenyulang("");
          setCategory("");
          setTglInspeksi("");
          setImage(null);
          setProgress(0);
          setPreview(null);
          setIsLoading(false);
          nav("/inspeksi");
        }
      );
    } catch (error) {
      console.error("Error uploading file: ", error);
      setIsLoading(false);
    }
  };

  return (
    <Layouts className="px-2">
      <div className="fixed top-0 right-0 bg-main text-white px-4 py-2 h-16 w-full z-10 flex items-center justify-center bg-gradient-to-r from-main to-blue-500 font-semibold">
        <div className="text-center w-full">INPUT TEMUAN</div>
      </div>
      <form onSubmit={handleSubmitTemuan}>
        <div className="grid gap-4 py-4 pt-20">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Foto
            </Label>
            <Input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="col-span-3"
            />
          </div>
          {preview && (
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="imagePreview" className="text-right"></Label>
              <div className="col-span-3">
                <img
                  src={preview}
                  id="imagePreview"
                  alt="Selected Preview"
                  className="h-32 w-32 object-cover"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="temuan" className="text-right">
              Temuan
            </Label>
            <Input
              id="temuan"
              value={temuan}
              className="col-span-3"
              onChange={(e) => setTemuan(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lokasi" className="text-right">
              Lokasi
            </Label>
            <Input
              id="lokasi"
              value={lokasi}
              className="col-span-3"
              onChange={(e) => setLokasi(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Gardu</Label>
            <input
              type="text"
              name="noGardu"
              id="noGardu"
              placeholder="Cari Gardu..."
              onChange={(e) => setNoGardu(e.target.value)}
              className="col-span-3 border rounded p-2 w-[180px]"
              required
            />
            <div className="col-start-2">
              {filteredGardu.map((item) => (
                <div key={item.nama} onClick={() => setNoGardu(item.nama)}>
                  {item.nama}-{item.alamat}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lokasi" className="text-right">
              location
            </Label>
            <input
              type="text"
              name="location"
              id="location"
              value={
                location.lat && location.lng
                  ? `${location.lat}, ${location.lng}`
                  : "Fetching location..."
              }
              className="col-span-3 border border-gray-300 p-2"
            />
            {error && (
              <div className="text-red-500 col-span-4">Error: {error}</div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inspektor" className="text-right">
              Map
            </Label>
            <div className="col-span-2 z-50">
              <MapContainer
                key={location.lat + location.lng}
                center={[location.lat, location.lng]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "200px", width: "100%" }} // Ukuran map
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[location.lat, location.lng]}>
                  <Popup>You are here</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inspektor" className="text-right">
              Inspektor
            </Label>
            <Input
              id="inspektor"
              value={inspektor}
              className="col-span-3"
              onChange={(e) => setInspektor(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Penyulang</Label>
            <Select
              name="penyulang"
              id="penyulang"
              onValueChange={(value) => setPenyulang(value)}
              className="col-span-3"
              required
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Penyulang ..." />
              </SelectTrigger>
              <SelectContent key={penyulang.id}>
                {data.map((penyulang) => (
                  <SelectItem key={penyulang.id} value={penyulang.penyulang}>
                    {penyulang.penyulang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Kategory</Label>
            <Select
              name="category"
              id="category"
              onValueChange={(value) => setCategory(value)}
              className="col-span-3"
              required
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="...." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JTM">JTM</SelectItem>
                <SelectItem value="JTR">JTR</SelectItem>
                <SelectItem value="Gardu">Gardu</SelectItem>
                <SelectItem value="Preventive">Preventive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tanggalInspeksi" className="text-right">
              Tgl Inspeksi
            </Label>
            <Input
              type="date"
              name="tanggalInspeksi"
              id="tanggalInspeksi"
              value={tglInspeksi}
              className="col-span-3"
              onChange={(e) => setTglInspeksi(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full mt-10">
          {isLoading ? "Uploading..." : "Simpan"}
        </Button>
        {progress > 0 && (
          <progress value={progress} max="100" className="w-full mt-4" />
        )}
      </form>
      <div className="h-[100px]"></div>
    </Layouts>
  );
};

export default TambahTemuan;
