import { useState } from "react";
import { db, storage } from "@/firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Layouts from "../admin/Layouts";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

const TambahSuratMasuk = () => {
  const [image, setImage] = useState(null);
  const [noSurat, setNoSurat] = useState("");
  const [pengirim, setPengirim] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noTelpon, setNoTelpon] = useState("");
  const [perihal, setPerihal] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState("");
  const [status, setStatus] = useState("");
  const [tindakan, setTindakan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

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
      !image ||
      !noSurat ||
      !pengirim ||
      !alamat ||
      !noTelpon ||
      !perihal ||
      !tanggalSurat ||
      !status ||
      !tindakan ||
      !keterangan
    ) {
      alert("Please fill all fields.");
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

          await addDoc(collection(db, "SuratMasuk"), {
            imageUrl,
            noSurat,
            pengirim,
            alamat,
            noTelpon,
            perihal,
            tanggalSurat,
            status,
            tindakan,
            keterangan,
          });

          setNoSurat("");
          setPengirim("");
          setAlamat("");
          setNoTelpon("");
          setPerihal("");
          setTanggalSurat("");
          setStatus("");
          setTindakan("");
          setKeterangan("");
          setImage(null);
          setProgress(0);
          setPreview(null);
          setIsLoading(false);
          nav("/admin/surat-masuk");
        }
      );
    } catch (error) {
      console.error("Error uploading file: ", error);
      setIsLoading(false);
    }
  };

  return (
    <Layouts>
      <div className=" border-main border-b pb-2 flex left-2 right-0 top-0 md:left-40 md:top-12">
        <h2 className="font-semibold text-start md:text-2xl md:pt-12">
          Tambah Surat
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
            <Label htmlFor="noSurat" className="text-right">
              noSurat
            </Label>
            <Input
              id="noSurat"
              value={noSurat}
              className="col-span-3"
              onChange={(e) => setNoSurat(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pengirim" className="text-right">
              pengirim
            </Label>
            <Input
              id="pengirim"
              value={pengirim}
              className="col-span-3"
              onChange={(e) => setPengirim(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="alamat" className="text-right">
              alamat
            </Label>
            <Input
              id="alamat"
              value={alamat}
              className="col-span-3"
              onChange={(e) => setAlamat(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="noTelpon" className="text-right">
              noTelpon
            </Label>
            <Input
              type="number"
              id="noTelpon"
              value={noTelpon}
              className="col-span-3"
              onChange={(e) => setNoTelpon(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="perihal" className="text-right">
              perihal
            </Label>
            <Input
              id="perihal"
              value={perihal}
              className="col-span-3"
              onChange={(e) => setPerihal(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tanggalSurat" className="text-right">
              Tgl Surat
            </Label>
            <Input
              type="date"
              name="tanggalSurat"
              id="tanggalSurat"
              value={tanggalSurat}
              className="col-span-3"
              onChange={(e) => setTanggalSurat(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Input
              type="text"
              name="status"
              id="status"
              value={status}
              className="col-span-3"
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tindakan" className="text-right">
              Tindakan
            </Label>
            <Input
              type="text"
              name="tindakan"
              id="tindakan"
              value={tindakan}
              className="col-span-3"
              onChange={(e) => setTindakan(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="keterangan" className="text-right">
              Keterangan
            </Label>
            <Input
              type="text"
              name="keterangan"
              id="keterangan"
              value={keterangan}
              className="col-span-3"
              onChange={(e) => setKeterangan(e.target.value)}
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
    </Layouts>
  );
};

export default TambahSuratMasuk;
