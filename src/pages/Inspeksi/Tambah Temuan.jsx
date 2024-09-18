import { useState } from "react";
import { db, storage } from "@/firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
    if (!temuan || !image || !lokasi || !inspektor || !penyulang || !category || !tglInspeksi) {
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
          const progressPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
    
    <Dialog>
      <DialogTrigger>
        <div className='flex flex-col items-center gap-2'>
          <FaPlusCircle />
          
        </div>
      </DialogTrigger>
      
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detail Temuan</DialogTitle>
            <DialogDescription>Pastikan Detail Temuan anda Benar</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTemuan}>
          <div className="grid gap-4 py-4 bo">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">Foto</Label>
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
                  <img src={preview} id="imagePreview" alt="Selected Preview" className="h-32 w-32 object-cover" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temuan" className="text-right">Temuan</Label>
              <Input id="temuan" value={temuan} className="col-span-3" onChange={(e) => setTemuan(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lokasi" className="text-right">Lokasi</Label>
              <Input id="lokasi" value={lokasi} className="col-span-3" onChange={(e) => setLokasi(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inspektor" className="text-right">Inspektor</Label>
              <Input id="inspektor" value={inspektor} className="col-span-3" onChange={(e) => setInspektor(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="penyulang" className="text-right">Penyulang</Label>
              <Input id="penyulang" value={penyulang} className="col-span-3" onChange={(e) => setPenyulang(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Kategory</Label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3">
                <option value="">-</option>
                <option value="JTM">JTM</option>
                <option value="JTR">JTR</option>
                <option value="Gardu">Gardu</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggalInspeksi" className="text-right">Tgl Inspeksi</Label>
              <Input type="date" id="tanggalInspeksi" value={tglInspeksi} className="col-span-3" onChange={(e) => setTglInspeksi(e.target.value)} />
            </div>
            
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Simpan"}
            </Button>
            {progress > 0 && <progress value={progress} max="100" className="w-full mt-4" />}
          </DialogFooter>
          </form>
        </DialogContent>
        
      
    </Dialog>
    
  );
};

export default TambahTemuan;
