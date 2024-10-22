import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TbMapSearch, TbPlus, TbTrash } from "react-icons/tb";
import ImagePreview from "@/pages/ImagePreview";
import Layouts from "@/pages/admin/Layouts";

const UpdateDataTemuan = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const [materials, setMaterials] = useState([
    { namaMaterial: "", jumlahMaterial: "" },
  ]);
  const [data, setData] = useState({
    imageUrl: "",
    temuan: "",
    lokasi: "",
    inspektor: "",
    penyulang: "",
    category: "",
    tglInspeksi: "",
    namaMaterial: [],
    jumlahMaterial: [],
    statusValidasi: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "inspeksi", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setData(fetchedData);

        // Jika ada data materials, atur state materials
        if (fetchedData.materials) {
          setMaterials(fetchedData.materials);
        }
      } else {
        console.error("Document not found!");
      }
    };

    fetchData();
  }, [id]);

  // Fungsi untuk menambah material baru
  const handleAddMaterial = () => {
    setMaterials([...materials, { namaMaterial: "", jumlahMaterial: "" }]);
  };

  // Fungsi untuk menangani perubahan input
  const handleMaterialChange = (index, event) => {
    const { name, value } = event.target;
    const updatedMaterials = [...materials];
    updatedMaterials[index][name] = value;
    setMaterials(updatedMaterials);
  };

  // Fungsi untuk menghapus material
  const handleRemoveMaterial = (index) => {
    const updatedMaterials = materials.filter((_, i) => i !== index);
    setMaterials(updatedMaterials);
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
      const updatedData = {
        ...data,
        materials: materials, // Menyimpan array material (namaMaterial dan jumlahMaterial) ke dalam Firestore
      };
      // Update document dengan data baru, termasuk material
      await updateDoc(docRef, updatedData);

      alert("Data berhasil diupdate!");
      navigate("/admin/pemeliharaan/daftar-pemeliharaan"); // Arahkan kembali ke halaman pemeliharaan setelah update
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
              />
            </div>
            {/* More form fields... */}

            <div className=" border-main border-b grid grid-cols-2 mt-2 py-2 md:grid-cols-5">
              <h2 className="font-semibold text-start md:text-2xl md:pt-12 pt-2">
                Update Material
              </h2>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Material</Label>
              <div className="flex flex-col gap-2">
                <Button type="button" size="lg" onClick={handleAddMaterial}>
                  Tambah Material
                  <TbPlus />
                </Button>
                {materials.map((material, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      name="namaMaterial"
                      placeholder="Nama Material"
                      value={material.namaMaterial}
                      onChange={(e) => handleMaterialChange(index, e)}
                    />
                    <Input
                      type="number"
                      name="jumlahMaterial"
                      placeholder="Jumlah"
                      value={material.jumlahMaterial}
                      onChange={(e) => handleMaterialChange(index, e)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(index)}
                    >
                      <TbTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status Validasi</Label>

              <Select
                name="statusValidasi"
                onValueChange={(value) =>
                  setData({ ...data, statusValidasi: value })
                }
                className="col-span-3"
                required
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={data.statusValidasi} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="invalid">Belum Valid</SelectItem>
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

export default UpdateDataTemuan;
