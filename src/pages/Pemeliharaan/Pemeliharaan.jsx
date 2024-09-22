
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FaCheck } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CgDanger } from "react-icons/cg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Pemeliharaan = () => {
    const [data, setData] = useState([]);
        useEffect(() => {
            const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "inspeksi"));
                const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Mengurutkan data berdasarkan tgl inspeksi dari yang terbaru ke terlama
                const sortedData = fetchedData.sort((a, b) => new Date(b.tglInspeksi) - new Date(a.tglInspeksi));

            setData(sortedData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
            };
            fetchData();
        }, []);
    return ( 
        <div className="Container">
            <Tabs defaultValue="Temuan" className="w-[400px] flex fixed left-2 right-0 top-0 md:left-40 md:top-12">
            <div className="">
                <div className="font-semibold text-start md:text-2xl md:pt-12 pb-2 pt-6 ">
                    <TabsList>
                        <TabsTrigger value="Temuan">Temuan</TabsTrigger>
                        <TabsTrigger value="Pending">Pending</TabsTrigger>
                        <TabsTrigger value="Selesai">Selesai</TabsTrigger>
                    </TabsList>
                </div>
            </div>
            <TabsContent value="Temuan">
                <div className="fixed left-0 right-0 top-16 md:left-48 md:right-48 md:top-40">
                <ScrollArea className="w-full h-screen px-2 md:h-screen">
                {data
                    .filter((item) => item.status === "Temuan") // Memfilter item dengan status "Temuan"
                    .map((item) => (
                        <div key={item.id} className="grid grid-cols-6 justify-start py-2 hover:bg-main/10">
                            <div className="content-center pl-2">
                                <Avatar>
                                    <AvatarImage src={item.imageUrl} />
                                    <AvatarFallback>SB</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="col-start-2 col-span-3 md:col-span-2 md:content-center text-start">
                                <h2 className="font-semibold">{item.temuan}</h2>
                                <p className="text-sm">{item.lokasi}</p>
                            </div>
                            <div className="hidden md:flex md:text-start md:items-center">
                                <h2 className="font-semibold">{item.penyulang}</h2>
                            </div>
                            <div className="hidden md:flex md:text-start md:items-center">
                                <h2 className="font-semibold">{item.tglInspeksi}</h2>
                            </div>
                            <div className="flex flex-col justify-center text-end col-span-2 md:col-span-1 md:mr-4">
                                <div className="text-[10px]">{new Date(item.tglInspeksi).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </div>
                                <div className="">
                                <Link to={`/eksekusi/${item.id}`}>
                                    {item.status === "Temuan" ? <Badge variant="temuan">{item.status} </Badge>
                                    : item.status === "Pending" ?<Badge variant="pending"><CgDanger />{item.status} </Badge>
                                    : <Badge><FaCheck />{item.status} </Badge>}
                                </Link>
                                </div>
                            </div>
                            
                        </div>
                    ))}
                    <div className=" pb-20 mb-20  pt-2 text-sm">
                        <p>Hasil temuan Inspeksi</p>
                    </div>
                </ScrollArea>
                </div>
            </TabsContent>
            <TabsContent value="Pending">
                <div className="fixed left-0 right-0 top-16 md:left-48 md:right-48 md:top-40">
                <ScrollArea className="w-full h-screen px-2 md:h-screen">
                {data
                    .filter((item) => item.status === "Pending") // Memfilter item dengan status "Temuan"
                    .map((item) => (
                        <div key={item.id} className="grid grid-cols-6 justify-start py-2 hover:bg-main/10">
                            <div className="content-center pl-2">
                                <Avatar>
                                    <AvatarImage src={item.imageUrl} />
                                    <AvatarFallback>SB</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="col-start-2 col-span-3 md:col-span-2 md:content-center text-start">
                                <h2 className="font-semibold">{item.temuan}</h2>
                                <p className="text-sm">{item.lokasi}</p>
                            </div>
                            <div className="hidden md:flex md:text-start md:items-center">
                                <h2 className="font-semibold">{item.penyulang}</h2>
                            </div>
                            <div className="hidden md:flex md:text-start md:items-center">
                                <h2 className="font-semibold">{item.tglInspeksi}</h2>
                            </div>
                            <div className="flex flex-col justify-center text-end col-span-2 md:col-span-1 md:mr-4">
                                <div className="text-[10px]">{new Date(item.tglEksekusi).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </div>
                                <div className="">
                                <Link to={`/eksekusi/${item.id}`}>
                                    {item.status === "Temuan" ? <Badge variant="temuan">{item.status} </Badge>
                                    : item.status === "Pending" ?<Badge variant="pending"><CgDanger />{item.status} </Badge>
                                    : <Badge><FaCheck />{item.status} </Badge>}
                                </Link>
                                </div>
                            </div>
                            
                        </div>
                    ))}
                    <div className=" pb-20 mb-20  pt-2 text-sm">
                        <p>Hasil temuan Inspeksi</p>
                    </div>
                </ScrollArea>
                </div>
            </TabsContent>
            <TabsContent value="Selesai">
                <div className="fixed left-0 right-0 top-16 md:left-48 md:right-48 md:top-40">
                <ScrollArea className="w-full h-screen px-2 md:h-screen">
                {data
                    .filter((item) => item.status === "Selesai") // Memfilter item dengan status "Temuan"
                    .map((item) => (
                        <div key={item.id} className="grid grid-cols-6 justify-start py-2 hover:bg-main/10">
                            <div className="content-center pl-2">
                                <Avatar>
                                    <AvatarImage src={item.imageUrl} />
                                    <AvatarFallback>SB</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="col-start-2 col-span-3 md:col-span-2 md:content-center text-start">
                                <h2 className="font-semibold">{item.temuan}</h2>
                                <p className="text-sm">{item.lokasi}</p>
                            </div>
                            <div className="hidden md:flex md:text-start md:items-center">
                                <h2 className="font-semibold">{item.penyulang}</h2>
                            </div>
                            <div className="hidden md:flex md:text-start md:items-center">
                                <h2 className="font-semibold">{item.tglInspeksi}</h2>
                            </div>
                            <div className="flex flex-col justify-center text-end col-span-2 md:col-span-1 md:mr-4">
                                <div className="text-[10px]">{new Date(item.tglEksekusi).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </div>
                                <div className="">
                                <Link to={`/eksekusi/${item.id}`}>
                                    {item.status === "Temuan" ? <Badge variant="temuan">{item.status} </Badge>
                                    : item.status === "Pending" ?<Badge variant="pending"><CgDanger />{item.status} </Badge>
                                    : <Badge><FaCheck />{item.status} </Badge>}
                                </Link>
                                </div>
                            </div>
                            
                        </div>
                    ))}
                    <div className=" pb-20 mb-20  pt-2 text-sm">
                        <p>Hasil temuan Inspeksi</p>
                    </div>
                </ScrollArea>
                </div>
            </TabsContent>
            </Tabs>
        </div>
     );
}
export default Pemeliharaan;