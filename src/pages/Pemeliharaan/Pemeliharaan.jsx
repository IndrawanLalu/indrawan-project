import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CgDanger } from "react-icons/cg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layouts from "@/pages/admin/Layouts";

const Pemeliharaan = () => {
  const [data, setData] = useState([]);
  const [dataPenyulang, setDataPenyulang] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPenyulang, setFilterPenyulang] = useState("all");
  // Default "all" instead of empty string

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inspeksi"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter data yang hanya memiliki statusValidasi "valid"
        const filteredData = fetchedData.filter(
          (data) => data.statusValidasi === "valid"
        );
        // Mengurutkan data berdasarkan tgl inspeksi dari yang terbaru ke terlama
        const sortedData = filteredData.sort(
          (a, b) => new Date(b.tglInspeksi) - new Date(a.tglInspeksi)
        );

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDataPenyulang = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "penyulang"));
        const fetchDataPenyulang = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDataPenyulang(fetchDataPenyulang);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchDataPenyulang();
  }, []);

  // Filter data berdasarkan category
  // Filter data berdasarkan category dan penyulang
  const filteredDataByCategoryAndPenyulang = (status) => {
    return data.filter(
      (item) =>
        item.status === status &&
        (filterCategory === "all" || item.category === filterCategory) &&
        (filterPenyulang === "all" || item.penyulang === filterPenyulang) // Tambah filter penyulang
    );
  };
  return (
    <Layouts>
      <div className="font-semibold text-start md:text-2xl md:pt-2">
        List Temuan Hasil Inspeksi
      </div>
      <Tabs
        defaultValue="Temuan"
        className="w-[500px] md:w-full m-auto md:h-screen"
      >
        <div className="flex items-center">
          <div className="font-semibold text-start md:text-2xl pb-1 md:pt-6 ">
            <TabsList>
              <TabsTrigger value="Temuan">Temuan</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Selesai">Selesai</TabsTrigger>
            </TabsList>
          </div>
          {/* Dropdown Filter Category */}
          <div className="md:pt-4 ml-2 mr-2">
            <Select onValueChange={setFilterCategory}>
              <SelectTrigger className="w-30 md:w-40">
                <SelectValue placeholder="Kategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="JTM">JTM</SelectItem>
                <SelectItem value="JTR">JTR</SelectItem>
                <SelectItem value="gardu">Gardu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Dropdown Filter Penyulang */}
        </div>
        <div className=" hidden md:grid grid-cols-6 justify-start text-center py-2 border font-semibold items-center bg-main/30">
          <h1 className="col-span-2">Temuan</h1>
          <Select onValueChange={setFilterPenyulang}>
            <SelectTrigger className="">
              <SelectValue placeholder="Penyulang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {dataPenyulang.map((penyulang) => (
                <SelectItem key={penyulang.id} value={penyulang.penyulang}>
                  {penyulang.penyulang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <h1>Inspektor</h1>
          <h1>Tgl Inspeksi</h1>
          <h1 className="">Status</h1>
        </div>
        <TabsContent value="Temuan">
          <div className=" ">
            <ScrollArea className="w-full h-[80vh] px-2">
              {filteredDataByCategoryAndPenyulang("Temuan").map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-6 justify-start py-2 hover:bg-main/10 border-b border-main/30 items-center"
                >
                  <div className="col-span-3 md:col-span-2 md:content-center text-start">
                    <h2 className="font-semibold">{item.temuan}</h2>
                    <p className="text-sm">{item.lokasi}</p>
                  </div>
                  <div className="hidden md:flex md:flex-col md:text-start md:items-center">
                    <h2 className="">{item.penyulang}</h2>
                  </div>
                  <div className="hidden md:block md:text-center md:items-center">
                    <h2 className="">{item.inspektor}</h2>
                  </div>
                  <div className="hidden md:block md:text-center md:items-center">
                    <h2 className="">{item.tglInspeksi}</h2>
                  </div>
                  <div className="flex flex-col justify-center text-end md:text-center col-span-1 md:col-span-1 ">
                    <div className="text-[10px]">
                      {new Date(item.tglInspeksi).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    <div className="">
                      <Link to={`/eksekusi/${item.id}`}>
                        {item.status === "Temuan" ? (
                          <Badge variant="temuan">{item.status} </Badge>
                        ) : item.status === "Pending" ? (
                          <Badge variant="pending">
                            <CgDanger />
                            {item.status}{" "}
                          </Badge>
                        ) : (
                          <Badge>
                            <FaCheck />
                            {item.status}{" "}
                          </Badge>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value="Pending">
          <div className=" ">
            <ScrollArea className="w-full h-[80vh] px-2">
              {filteredDataByCategoryAndPenyulang("Pending").map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-6 justify-start py-2 hover:bg-main/10 border-b border-main/30 items-center"
                >
                  <div className="col-span-3 md:col-span-2 md:content-center text-start">
                    <h2 className="font-semibold">{item.temuan}</h2>
                    <p className="text-sm">{item.lokasi}</p>
                  </div>
                  <div className="hidden md:flex md:flex-col md:text-start md:items-center">
                    <h2 className="">{item.penyulang}</h2>
                  </div>
                  <div className="hidden md:block md:text-center md:items-center">
                    <h2 className="">{item.inspektor}</h2>
                  </div>
                  <div className="hidden md:block md:text-center md:items-center">
                    <h2 className="">{item.tglInspeksi}</h2>
                  </div>
                  <div className="flex flex-col justify-center text-end md:text-center col-span-1 md:col-span-1 ">
                    <div className="text-[10px]">
                      {new Date(item.tglInspeksi).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    <div className="">
                      <Link to={`/eksekusi/${item.id}`}>
                        {item.status === "Temuan" ? (
                          <Badge variant="temuan">{item.status} </Badge>
                        ) : item.status === "Pending" ? (
                          <Badge variant="pending">
                            <CgDanger />
                            {item.status}{" "}
                          </Badge>
                        ) : (
                          <Badge>
                            <FaCheck />
                            {item.status}{" "}
                          </Badge>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <div className=" pb-20 mb-20  pt-2 text-sm md:hidden">
                <p>Hasil temuan Inspeksi</p>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value="Selesai">
          <div className=" ">
            <ScrollArea className="w-full h-[90vh] px-2">
              {filteredDataByCategoryAndPenyulang("Selesai").map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-6 justify-start py-2 hover:bg-main/10 border-b border-main/30 items-center"
                >
                  <div className="col-span-3 md:col-span-2 md:content-center text-start">
                    <h2 className="font-semibold">{item.temuan}</h2>
                    <p className="text-sm">{item.lokasi}</p>
                  </div>
                  <div className="hidden md:flex md:flex-col md:text-start md:items-center">
                    <h2 className="">{item.penyulang}</h2>
                  </div>
                  <div className="hidden md:block md:text-center md:items-center">
                    <h2 className="">{item.inspektor}</h2>
                  </div>
                  <div className="hidden md:block md:text-center md:items-center">
                    <h2 className="">{item.tglInspeksi}</h2>
                  </div>
                  <div className="flex flex-col justify-center text-end md:text-center col-span-1 md:col-span-1 ">
                    <div className="text-[10px]">
                      {new Date(item.tglInspeksi).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    <div className="">
                      <Link to={`/eksekusi/${item.id}`}>
                        {item.status === "Temuan" ? (
                          <Badge variant="temuan">{item.status} </Badge>
                        ) : item.status === "Pending" ? (
                          <Badge variant="pending">
                            <CgDanger />
                            {item.status}{" "}
                          </Badge>
                        ) : (
                          <Badge>
                            <FaCheck />
                            {item.status}{" "}
                          </Badge>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <div className=" pb-20 mb-20  pt-2 text-sm md:hidden">
                <p>Hasil temuan Inspeksi</p>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </Layouts>
  );
};
export default Pemeliharaan;
