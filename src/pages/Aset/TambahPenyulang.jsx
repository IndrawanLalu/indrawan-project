import { useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Assuming you have Button component
import Layouts from "@/pages/admin/Layouts";

const TambahPenyulang = () => {
  const [penyulang, setPenyulang] = useState("");
  const [sumber, setSumber] = useState("");
  const [panjang, setPanjang] = useState("");
  const [beban, setBeban] = useState("");
  const [tglUpdate, setTanggalUpdate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmitPenyulang = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!penyulang || !sumber || !panjang || !beban || !tglUpdate) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setIsLoading(true);

      await addDoc(collection(db, "penyulang"), {
        penyulang,
        sumber,
        Panjang: panjang,
        beban,
        tglUpdate,
      });

      // Reset form
      setPenyulang("");
      setSumber("");
      setPanjang("");
      setBeban("");
      setTanggalUpdate("");
      setIsLoading(false);
      nav("/aset/penyulang");
    } catch (error) {
      console.error("Error uploading data: ", error);
      setIsLoading(false);
    }
  };

  return (
    <Layouts>
      <div className="px-2 md:pt-20 md:px-96">
        <div className="border-main border-b pb-2 flex left-2 right-0 top-0 md:left-40 md:top-12">
          <h2 className="font-semibold text-start md:text-2xl md:pt-12">
            Input Penyulang
          </h2>
        </div>
        <form onSubmit={handleSubmitPenyulang}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="penyulang" className="text-right">
                Penyulang
              </Label>
              <Input
                id="penyulang"
                value={penyulang}
                className="col-span-3"
                onChange={(e) => setPenyulang(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sumber" className="text-right">
                Sumber
              </Label>
              <Input
                id="sumber"
                value={sumber}
                className="col-span-3"
                onChange={(e) => setSumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="panjang" className="text-right">
                Panjang
              </Label>
              <Input
                id="panjang"
                value={panjang}
                className="col-span-3"
                onChange={(e) => setPanjang(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="beban" className="text-right">
                Beban
              </Label>
              <Input
                id="beban"
                value={beban}
                className="col-span-3"
                onChange={(e) => setBeban(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggalUpdate" className="text-right">
                Tgl Inspeksi
              </Label>
              <Input
                type="date"
                id="tanggalUpdate"
                value={tglUpdate}
                className="col-span-3"
                onChange={(e) => setTanggalUpdate(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="mt-4 w-full"
          >
            {isLoading ? "Uploading..." : "Simpan"}
          </Button>
        </form>
        <div className="h-[100px]"></div>
      </div>
    </Layouts>
  );
};

export default TambahPenyulang;
