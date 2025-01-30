import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Layouts from "../admin/Layouts";
import { Button } from "@/components/ui/button";
import { TbMapSearch } from "react-icons/tb";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

const DetailGardu = () => {
  const { nama } = useParams(); // Ambil ID dari URL
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data dari public folder
    fetch("/db/amg.json")
      .then((response) => response.json())
      .then((data) => {
        const selectedItem = data.find((item) => item.nama === nama);
        setData(selectedItem);
      });
  }, [nama]);

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <Layouts>
      <div className="text-2xl font-semibold pb-10">Detail Beban Gardu</div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{data.nama}</h2>
              <p className="text-sm">{data.alamat}</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-2">
                <AccordionTrigger>Data Beban Gardu</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <p>Gardu</p>
                    <p>{data.nama}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <p>Alamat</p>
                    <p>{data.alamat}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <p>Kapasitas</p>
                    <p>{data.kva} kVA</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <p>Lokasi</p>
                    {data.Titik == "BELUMDIUPDATE" ? (
                      <p className="text-red-600">BELUM DI UPDATE</p>
                    ) : (
                      <div className="flex gap-2 items-center justify-center">
                        <Link to={data.Titik} target={data.Titik}>
                          <Button size="iconNav">
                            <TbMapSearch />
                            Maps
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Link
                      </Label>
                      <Input id="link" defaultValue={data.Titik} readOnly />
                    </div>
                    <Button type="submit" size="sm" className="px-3">
                      <span className="sr-only">Copy</span>
                      <Copy className="h-2 w-2" />
                    </Button>
                  </div>
                  <div className="flex items-start justify-between gap-12 grid-cols-2 pt-6 ">
                    <div className="gap-2 font-semibold">
                      <p>Beban Total</p>
                      <p>R : {data.rTotal}</p>
                      <p>S : {data.sTotal}</p>
                      <p>T : {data.tTotal}</p>
                      <p>N : {data.nTotal}</p>
                    </div>
                    <div className="font-semibold ">
                      <p className="py-2">Tanggal Ukur : {data.tglUkur}</p>
                      <span className="text-red-600 animate-pulse ">
                        Update at : {data.tglUpdate}
                      </span>
                    </div>
                  </div>
                  <div className="grid-cols-5 border-t border-b py-2 flex justify-between">
                    <div className=" flex flex-col items-start">
                      <p className="font-bold">Line A</p>
                      <p>R : {data.R_A}</p>
                      <p>S : {data.S_A}</p>
                      <p>T : {data.T_A}</p>
                      <p>N : {data.N_A}</p>
                    </div>
                    <div className=" flex flex-col items-start">
                      <p className="font-bold">Line B</p>
                      <p>R : {data.R_B}</p>
                      <p>S : {data.S_B}</p>
                      <p>T : {data.T_B}</p>
                      <p>N : {data.N_B}</p>
                    </div>
                    <div className=" flex flex-col items-start">
                      <p className="font-bold">Line C</p>
                      <p>R : {data.R_C}</p>
                      <p>S : {data.S_C}</p>
                      <p>T : {data.T_C}</p>
                      <p>N : {data.N_C}</p>
                    </div>
                    <div className=" flex flex-col items-start">
                      <p className="font-bold">Line D</p>
                      <p>R : {data.R_D}</p>
                      <p>S : {data.S_D}</p>
                      <p>T : {data.T_D}</p>
                      <p>N : {data.N_D}</p>
                    </div>
                    <div className=" flex flex-col items-start">
                      <p className="font-bold">Line K</p>
                      <p>R : {data.R_K}</p>
                      <p>S : {data.S_K}</p>
                      <p>T : {data.T_K}</p>
                      <p>N : {data.N_K}</p>
                    </div>
                  </div>
                  <div className="grid-cols-5 border-t border-b py-2 flex justify-between">
                    <div className=" flex flex-col items-start">
                      <p className="font-bold">Tegangan Fasa Netral</p>
                      <p>R-N : {data.r_n} Volt</p>
                      <p>S-N : {data.s_n} Volt</p>
                      <p>T-N : {data.t_n} Volt</p>
                    </div>
                    <div className=" flex flex-col items-start">
                      <p className="font-bold">Tegangan Fasa Fasa</p>
                      <p>R-S : {data.r_s} Volt</p>
                      <p>R-T : {data.s_t} Volt</p>
                      <p>S-T : {data.s_t} Volt</p>
                    </div>
                  </div>
                  <div className="grid-cols-5 border-t border-b py-2 flex justify-between mb-14">
                    <div className=" flex flex-col items-start">
                      <p className="font-bold">Kesimpulan</p>
                      <p>Unbalance : {data.UBL} %</p>
                      <p>Beban Total : {data.bebanKva} kVA</p>
                      <p>Persentase : {data.Persen} %</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layouts>
  );
};

export default DetailGardu;
