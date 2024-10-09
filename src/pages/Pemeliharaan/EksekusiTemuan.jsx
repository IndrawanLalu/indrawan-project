import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TbMapSearch } from "react-icons/tb";
import ImagePreview from "../ImagePreview";
import Layouts from "../admin/layouts";

const EksekusiTemuan = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const [data, setData] = useState({
    imageUrl: "",
    temuan: "",
    lokasi: "",
    inspektor: "",
    penyulang: "",
    category: "",
    tglInspeksi: "",
    imageEksekusiURL: "",
    eksekutor: "",
    tglEksekusi: "",
    keterangan: "",
    status: "",
  });
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [imageEksekusi, setImageEksekusi] = useState(null); // Simpan file gambar yang dipilih

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "inspeksi", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        console.error("Document not found!");
      }
    };

    fetchData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageEksekusi(file); // Simpan file gambar yang dipilih
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Tampilkan preview gambar
      };
      reader.readAsDataURL(file); // Buat preview dari file
    }
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docRef = doc(db, "inspeksi", id);

    try {
      let imageEksekusiURL = data.imageEksekusiURL; // Mulai dengan URL yang ada, jika tidak ada gambar baru diunggah

      if (imageEksekusi) {
        // Upload gambar ke Firebase Storage
        const storageRef = ref(
          storage,
          `images/eksekusi/${imageEksekusi.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, imageEksekusi);

        // Menunggu upload selesai dan mengambil URL gambar
        imageEksekusiURL = await new Promise((resolve, reject) => {
          uploadTask.on("state_changed", null, reject, async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          });
        });
      }

      // Update document dengan data baru, termasuk URL gambar jika ada
      await updateDoc(docRef, {
        ...data,
        imageEksekusiURL, // Masukkan URL gambar jika ada
      });

      setPreview(null);
      alert("Data berhasil diupdate!");
      navigate("/pemeliharaan"); // Arahkan kembali ke halaman pemeliharaan setelah update
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <Layouts>
      <div className="flex flex-col ">
        <div className="text-2xl font-semibold ">Eksekusi Hasil Temuan</div>
        <div className=" border-main border-b grid grid-cols-2 md:grid-cols-5 pt-1">
          <h2 className="font-semibold text-start md:text-2xl md:pt-10">
            Hasil Temuan
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Foto</Label>
              <ImagePreview
                type="file"
                src={data.imageUrl}
                alt="foto"
                className="w-36 h-36 rounded-md md:w-36 md:h-36 object-cover"
              />
              {data.imageEksekusiURL ? (
                <img
                  type="file"
                  src={data.imageEksekusiURL}
                  alt="foto"
                  className="w-36 h-36 rounded-md md:w-36 md:h-36 object-cover"
                />
              ) : (
                ""
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temuan" className="text-right">
                Temuan
              </Label>
              <Input
                type="text"
                id="temuan"
                name="temuan"
                value={data.temuan}
                onChange={handleChange}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lokasi" className="text-right">
                lokasi
              </Label>
              <Input
                type="text"
                id="lokasi"
                name="lokasi"
                value={data.lokasi}
                onChange={handleChange}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right"></Label>
              <Link
                to={"https://www.google.com/maps/place/" + data.location}
                target="_blank"
              >
                <span className="gap-2 flex bg-main text-white p-1 rounded items-center hover:bg-gray-600 md:w-20">
                  <TbMapSearch />
                  Maps
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="penyulang" className="text-right">
                Penyulang
              </Label>
              <Input
                type="text"
                id="penyulang"
                name="penyulang"
                value={data.penyulang}
                onChange={handleChange}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tglInspeksi" className="text-right">
                Tgl Inspeksi
              </Label>
              <Input
                type="date"
                id="tglInspeksi"
                name="tglInspeksi"
                value={data.tglInspeksi}
                onChange={handleChange}
                className="col-span-3"
                disabled
              />
            </div>
            {/* More form fields... */}

            <div className=" border-main border-b grid grid-cols-2 mt-2 py-2 md:grid-cols-5">
              <h2 className="font-semibold text-start md:text-2xl md:pt-12 pt-2">
                Eksekusi Temuan
              </h2>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tglEksekusi" className="text-right">
                Tgl Eksekusi
              </Label>
              <Input
                type="date"
                id="tglEksekusi"
                name="tglEksekusi"
                value={data.tglEksekusi}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eksekutor" className="text-right">
                Eksekutor
              </Label>
              <Input
                type="text"
                id="eksekutor"
                name="eksekutor"
                value={data.eksekutor}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keterangan" className="text-right">
                Keterangan
              </Label>
              <Input
                type="text"
                id="keterangan"
                name="keterangan"
                value={data.keterangan}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageEksekusiURL" className="text-right">
                Foto Eksekusi
              </Label>
              {data.imageEksekusiURL ? (
                <Input
                  type="file"
                  name="imageEksekusiURL"
                  id="imageEksekusiURL"
                  accept="image/*"
                  onChange={handleImageChange} // Handle perubahan gambar
                  className="col-span-3"
                />
              ) : (
                <Input
                  type="file"
                  name="imageEksekusiURL"
                  id="imageEksekusiURL"
                  accept="image/*"
                  onChange={handleImageChange} // Handle perubahan gambar
                  className="col-span-3"
                  required
                />
              )}
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
              <Label className="text-right">Status</Label>

              <Select
                name="status"
                onValueChange={(value) => setData({ ...data, status: value })}
                className="col-span-3"
                required
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={data.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="mt-14 mb-10 flex w-full ">
            Update
          </Button>
        </form>
        <div className="h-10"></div>
      </div>
    </Layouts>
  );
};

export default EksekusiTemuan;
