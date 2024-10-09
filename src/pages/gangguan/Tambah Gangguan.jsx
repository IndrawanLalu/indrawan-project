import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Assuming you have Button component
import Layouts from "../admin/Layouts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const TambahGangguan = () => {
  const [noGangguanAPKT, setNoGangguanAPKT] = useState("");
  const [keypoint, setKeypoint] = useState("");
  const [penyulang, setPenyulang] = useState("");
  const [fasilitasPadam, setFasilitasPadam] = useState("");
  const [jamPadam, setJamPadam] = useState("");
  const [jamNyala, setJamNyala] = useState("");
  const [durasi, setDurasi] = useState("");
  const [tanggalGangguan, setTanngalGangguan] = useState("");
  const [indikasi, setIndikasi] = useState("");
  const [kodeGangguan, setKodeGangguan] = useState("");
  const [arusR, setArusR] = useState("");
  const [arusS, setArusS] = useState("");
  const [arusT, setArusT] = useState("");
  const [arusN, setArusN] = useState("");
  const [penyebab, setPenyebab] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const [data, setData] = useState([]);
  const { toast } = useToast();
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
  const handleSubmitGangguan = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (
      !keypoint ||
      !penyulang ||
      !fasilitasPadam ||
      !jamPadam ||
      !jamNyala ||
      !durasi ||
      !tanggalGangguan ||
      !indikasi ||
      !kodeGangguan ||
      !arusR ||
      !arusS ||
      !arusT ||
      !arusN ||
      !penyebab
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setIsLoading(true);

      await addDoc(collection(db, "gangguanPenyulang"), {
        noGangguanAPKT,
        keypoint,
        penyulang,
        fasilitasPadam,
        jamPadam,
        jamNyala,
        durasi,
        tanggalGangguan,
        indikasi,
        kodeGangguan,
        arusR,
        arusS,
        arusT,
        arusN,
        penyebab,
      });

      // Reset form
      setKeypoint("");
      setNoGangguanAPKT("");
      setPenyulang("");
      setFasilitasPadam("");
      setJamPadam("");
      setJamNyala("");
      setDurasi("");
      setTanngalGangguan("");
      setIndikasi("");
      setKodeGangguan("");
      setArusR("");
      setArusS("");
      setArusT("");
      setArusN("");
      setPenyebab("");
      setIsLoading(false);
      nav("/admin/gangguanPenyulang");
      toast({
        variant: "success",
        title: "Suksess",
        description: "Data Berhasil disimpan",
      });
    } catch (error) {
      console.error("Error uploading data: ", error);
      setIsLoading(false);
    }
  };

  return (
    <Layouts>
      <div className="border-main border-b pb-2 flex">
        <h2 className="font-semibold text-start md:text-2xl">
          Input Gangguan Penyulang
        </h2>
      </div>
      <div className="w-full grid grid-cols-2 gap-2">
        <form onSubmit={handleSubmitGangguan}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="noGangguanAPKT" className="text-right">
                noGangguanAPKT
              </Label>
              <Input
                name="noGangguanAPKT"
                id="noGangguanAPKT"
                value={noGangguanAPKT}
                className="col-span-3"
                onChange={(e) => setNoGangguanAPKT(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keypoint" className="text-right">
                keypoint
              </Label>
              <Input
                name="keypoint"
                id="keypoint"
                value={keypoint}
                className="col-span-3"
                onChange={(e) => setKeypoint(e.target.value)}
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
              <Label htmlFor="fasilitasPadam" className="text-right">
                fasilitasPadam
              </Label>
              <Input
                id="fasilitasPadam"
                value={fasilitasPadam}
                className="col-span-3"
                onChange={(e) => setFasilitasPadam(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jamPadam" className="text-right">
                jamPadam
              </Label>
              <Input
                type="time"
                step="1"
                id="jamPadam"
                value={jamPadam}
                className="col-span-3"
                onChange={(e) => setJamPadam(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jamNyala" className="text-right">
                jamNyala
              </Label>
              <Input
                type="time"
                step="1"
                id="jamNyala"
                value={jamNyala}
                className="col-span-3"
                onChange={(e) => setJamNyala(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="durasi" className="text-right">
                durasi
              </Label>
              <Input
                type="time"
                step="1"
                id="durasi"
                value={durasi}
                className="col-span-3"
                onChange={(e) => setDurasi(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggalGangguan" className="text-right">
                Tgl Padam
              </Label>
              <Input
                type="date"
                id="tanggalGangguan"
                value={tanggalGangguan}
                className="col-span-3"
                onChange={(e) => setTanngalGangguan(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="indikasi" className="text-right">
                indikasi
              </Label>
              <Input
                id="indikasi"
                value={indikasi}
                className="col-span-3"
                onChange={(e) => setIndikasi(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kodeGangguan" className="text-right">
                kodeGangguan
              </Label>
              <Input
                id="kodeGangguan"
                value={kodeGangguan}
                className="col-span-3"
                onChange={(e) => setKodeGangguan(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arusR" className="text-right">
                arusR
              </Label>
              <Input
                id="arusR"
                type="number"
                value={arusR}
                className="col-span-3"
                onChange={(e) => setArusR(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arusS" className="text-right">
                arusS
              </Label>
              <Input
                id="arusS"
                type="number"
                value={arusS}
                className="col-span-3"
                onChange={(e) => setArusS(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arusT" className="text-right">
                arusT
              </Label>
              <Input
                id="arusT"
                type="number"
                value={arusT}
                className="col-span-3"
                onChange={(e) => setArusT(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arusN" className="text-right">
                arusN
              </Label>
              <Input
                id="arusN"
                type="number"
                value={arusN}
                className="col-span-3"
                onChange={(e) => setArusN(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="penyebab" className="text-right">
                penyebab
              </Label>
              <Input
                id="penyebab"
                value={penyebab}
                className="col-span-3"
                onChange={(e) => setPenyebab(e.target.value)}
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
      </div>
    </Layouts>
  );
};

export default TambahGangguan;
