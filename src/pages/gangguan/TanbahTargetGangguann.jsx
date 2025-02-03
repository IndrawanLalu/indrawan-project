import { useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Assuming you have Button component
import Layouts from "@/pages/admin/Layouts";

import { useToast } from "@/hooks/use-toast";

const TambahTargetGangguan = () => {
  const [bulan, setBulan] = useState("");
  const [target, setTarget] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const { toast } = useToast();

  const handleSubmitGangguan = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!bulan || !target) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setIsLoading(true);

      await addDoc(collection(db, "targetGangguan"), {
        bulan,
        target,
      });

      // Reset form
      setBulan("");
      setTarget("");

      setIsLoading(false);
      nav("/admin/gangguanPenyulang/target-gangguan");
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
          Input Target Gangguan Penyulang
        </h2>
      </div>
      <div className="w-full grid grid-cols-2 gap-2">
        <form onSubmit={handleSubmitGangguan}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bulan" className="text-right">
                Bulan
              </Label>
              <Input
                type="date"
                id="bulan"
                value={bulan}
                className="col-span-3"
                onChange={(e) => setBulan(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">
                target
              </Label>
              <Input
                id="target"
                value={target}
                className="col-span-3"
                onChange={(e) => setTarget(e.target.value)}
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

export default TambahTargetGangguan;
