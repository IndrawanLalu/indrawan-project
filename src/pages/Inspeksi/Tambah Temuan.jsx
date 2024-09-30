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

const TambahTemuan = () => {
  const [image, setImage] = useState(null);
  const [temuan, setTemuan] = useState("");
  const [lokasi, setLokasi] = useState("");
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

          setTemuan("");
          setLokasi("");
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
    <div className="p-2 md:pt-20 md:px-80">
      <div className=" border-main border-b pb-2 flex left-2 right-0 top-0 md:left-40 md:top-12">
        <h2 className="font-semibold text-start md:text-2xl md:pt-12 pt-2">
          Input Temuan
        </h2>
      </div>
      <form onSubmit={handleSubmitTemuan}>
        <div className="grid gap-4 py-4">
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
              capture
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
            <Label htmlFor="lokasi" className="text-right">
              location
            </Label>
            <input
              id="location"
              value={
                location.lat && location.lng
                  ? `${location.lat}, ${location.lng}`
                  : "Fetching location..."
              }
              readOnly
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
            <div className="col-span-3">
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
            <Label htmlFor="penyulang" className="text-right">
              Penyulang
            </Label>
            <Select
              name="penyulang"
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
            <Label htmlFor="category" className="text-right">
              Kategory
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="col-span-3"
            >
              <option value="">-</option>
              <option value="JTM">JTM</option>
              <option value="JTR">JTR</option>
              <option value="Gardu">Gardu</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tanggalInspeksi" className="text-right">
              Tgl Inspeksi
            </Label>
            <Input
              type="date"
              id="tanggalInspeksi"
              value={tglInspeksi}
              className="col-span-3"
              onChange={(e) => setTglInspeksi(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Uploading..." : "Simpan"}
        </Button>
        {progress > 0 && (
          <progress value={progress} max="100" className="w-full mt-4" />
        )}
      </form>
      <div className="h-[100px]"></div>
    </div>
  );
};

export default TambahTemuan;
