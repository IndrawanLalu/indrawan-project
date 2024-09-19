import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const EksekusiTemuan = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const [data, setData] = useState({
    temuan: '',
    lokasi: '',
    tglInspeksi: '',
    status: '',
  });
  const navigate = useNavigate();

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
      await updateDoc(docRef, data);
      alert("Data berhasil diupdate!");
      navigate("/pemeliharaan"); // Arahkan kembali ke halaman pemeliharaan setelah update
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-semibold mb-4">Edit Temuan Inspeksi</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="foto" className="text-right">
                    Foto
                </Label>
                <img
                type="file"
                id="image"
                src={data.imageUrl}
                alt="foto"
                className="w-20 h-20 rounded-md md:w-36 md:h-36"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="temuan" className="text-right">Temuan</Label>
                <Input
                    type="text"
                    name="temuan"
                    value={data.temuan}
                    onChange={handleChange}
                    className="col-span-3"
                />
            </div>
            
        </div>
        <Button type="submit" >Update</Button>
      </form>
    </div>
  );
};

export default EksekusiTemuan;
