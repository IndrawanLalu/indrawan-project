import { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { TbMapSearch } from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "./components/ui/button";
import { Copy } from "lucide-react";
import { Label } from "./components/ui/label";
import { Link } from "react-router-dom";

const SearchAmg = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null); // Untuk menyimpan timeout

  useEffect(() => {
    // Fetch data dari public folder
    fetch("/db/amg.json")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set timeout untuk menunggu 1 detik sebelum pencarian dieksekusi
    const timeout = setTimeout(() => {
      const filteredResults = data.filter((item) =>
        item.nama.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filteredResults);
    }, 2000); // 1 detikk

    setTypingTimeout(timeout);
  };

  return (
    <div>
      <div className="py-2">
        <Button variant="neutral" className="py-4 gap-4">
          Beban Gardu Selong
        </Button>
      </div>
      <Input
        className="mb-4 mt-4"
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Cari nomor gardu..."
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ">
        {results.map((item) => (
          <li key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2>{item.nama}</h2>
                  <p className="text-sm">{item.alamat}</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Data Gardu</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4 py-2">
                        <p>Gardu</p>
                        <p>{item.nama}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-2">
                        <p>Alamat</p>
                        <p>{item.alamat}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-2">
                        <p>Kapasitas</p>
                        <p>{item.kva} kVA</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-2">
                        <p>Lokasi</p>
                        {item.Titik == "BELUMDIUPDATE" ? (
                          <p className="text-red-600">BELUM DI UPDATE</p>
                        ) : (
                          <div className="flex gap-2 items-center justify-center">
                            <Link to={item.Titik} target={item.Titik}>
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
                          <Input id="link" defaultValue={item.Titik} readOnly />
                        </div>
                        <Button type="submit" size="sm" className="px-3">
                          <span className="sr-only">Copy</span>
                          <Copy className="h-2 w-2" />
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Data Beban Gardu</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-start justify-between gap-12 grid-cols-2 ">
                        <div className="gap-2 font-semibold">
                          <p>Beban Total</p>
                          <p>R : {item.rTotal}</p>
                          <p>S : {item.sTotal}</p>
                          <p>T : {item.tTotal}</p>
                          <p>N : {item.nTotal}</p>
                        </div>
                        <div className="font-semibold ">
                          <p className="py-2">Tanggal Ukur : {item.tglUkur}</p>
                          <span className="text-red-600 animate-pulse ">
                            Update at : {item.tglUpdate}
                          </span>
                        </div>
                      </div>
                      <div className="grid-cols-5 border-t border-b py-2 flex justify-between">
                        <div className=" flex flex-col items-start">
                          <p className="font-bold">Line A</p>
                          <p>R : {item.R_A}</p>
                          <p>S : {item.S_A}</p>
                          <p>T : {item.T_A}</p>
                          <p>N : {item.N_A}</p>
                        </div>
                        <div className=" flex flex-col items-start">
                          <p className="font-bold">Line B</p>
                          <p>R : {item.R_B}</p>
                          <p>S : {item.S_B}</p>
                          <p>T : {item.T_B}</p>
                          <p>N : {item.N_B}</p>
                        </div>
                        <div className=" flex flex-col items-start">
                          <p className="font-bold">Line C</p>
                          <p>R : {item.R_C}</p>
                          <p>S : {item.S_C}</p>
                          <p>T : {item.T_C}</p>
                          <p>N : {item.N_C}</p>
                        </div>
                        <div className=" flex flex-col items-start">
                          <p className="font-bold">Line D</p>
                          <p>R : {item.R_D}</p>
                          <p>S : {item.S_D}</p>
                          <p>T : {item.T_D}</p>
                          <p>N : {item.N_D}</p>
                        </div>
                        <div className=" flex flex-col items-start">
                          <p className="font-bold">Line K</p>
                          <p>R : {item.R_K}</p>
                          <p>S : {item.S_K}</p>
                          <p>T : {item.T_K}</p>
                          <p>N : {item.N_K}</p>
                        </div>
                      </div>
                      <div className="grid-cols-5 border-t border-b py-2 flex justify-between">
                        <div className=" flex flex-col items-start">
                          <p className="font-bold">Tegangan Fasa Netral</p>
                          <p>R-N : {item.r_n} Volt</p>
                          <p>S-N : {item.s_n} Volt</p>
                          <p>T-N : {item.t_n} Volt</p>
                        </div>
                        <div className=" flex flex-col items-start">
                          <p className="font-bold">Tegangan Fasa Fasa</p>
                          <p>R-S : {item.r_s} Volt</p>
                          <p>R-T : {item.s_t} Volt</p>
                          <p>S-T : {item.s_t} Volt</p>
                        </div>
                      </div>
                      <div className="grid-cols-5 border-t border-b py-2 flex justify-between">
                        <div className=" flex flex-col items-start">
                          <p className="font-bold">Kesimpulan</p>
                          <p>Unbalance : {item.UBL} %</p>
                          <p>Beban Total : {item.bebanKva} kVA</p>
                          <p>Persentase : {item.Persen} %</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchAmg;
