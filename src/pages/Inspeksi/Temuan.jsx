import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import TambahTemuan from "./Tambah Temuan";
import { Badge } from "@/components/ui/badge";
import { FaCheck } from "react-icons/fa";
import { CgDanger } from "react-icons/cg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const Temuan = () => {
    const [data, setData] = useState([]);
        useEffect(() => {
            const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "inspeksi"));
                const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Mengurutkan data berdasarkan tglInspeksi dari yang terbaru ke terlama
                const sortedData = fetchedData.sort((a, b) => new Date(b.tglInspeksi) - new Date(a.tglInspeksi));

            setData(sortedData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
            };
            fetchData();
        }, []);
    return ( 
        <div className="Container mb-16">
                <div className=" border-main border-b pb-2 flex fixed left-2 right-0 top-0 md:left-40 md:top-12">
                    <h2 className="font-semibold text-start md:text-2xl md:pt-12 pt-2">Hasil Temuan</h2>
                    <div className="flex flex-col justify-center pl-2 py-2 md:pt-12"><TambahTemuan /></div>
                </div>
                <div className="fixed left-0 right-0 top-16 md:left-48 md:right-48 md:top-40">
                <ScrollArea className="w-full h-screen px-2 md:h-screen">
                {data.map((item) => (
                <Dialog key={item.id}>
                    <DialogTrigger asChild >
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
                                    {item.status === "Temuan" ? <Badge variant="temuan">{item.status} </Badge>
                                    : item.status === "Pending" ?<Badge variant="pending"><CgDanger />{item.status} </Badge>
                                    : <Badge><FaCheck />{item.status} </Badge>}
                                </div>
                            </div>
                            
                        </div>
                    </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                <DialogTitle>Detail Temuan</DialogTitle>
                                <DialogDescription>
                                    Pastikan Detail Temuan anda Benar
                                </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="foto" className="text-right">
                                        Foto
                                        </Label>
                                    <img src={item.imageUrl} alt="foto" className="w-20 h-20 rounded-md md:w-36 md:h-36"/>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="temuan" className="text-right">
                                        Temuan
                                        </Label>
                                        <Input
                                        id="temuan"
                                        defaultValue={item.temuan}
                                        className="col-span-3"
                                        readOnly 
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lokasi" className="text-right">
                                        Lokasi
                                        </Label>
                                        <Input
                                        id="lokasi"
                                        defaultValue={item.lokasi}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="inspektor" className="text-right">
                                        Inspektor
                                        </Label>
                                        <Input
                                        id="inspektor"
                                        defaultValue={item.inspektor}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="penyulang" className="text-right">
                                        Penyulang
                                        </Label>
                                        <Input
                                        id="penyulang"
                                        defaultValue={item.penyulang}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="category" className="text-right">
                                        Kategory
                                        </Label>
                                        <Input
                                        id="category"
                                        defaultValue={item.category}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="tanggalInspeksi" className="text-right">
                                        Tgl Inspeksi
                                        </Label>
                                        <Input
                                        id="tanggalInspeksi"
                                        defaultValue={item.tglInspeksi}
                                        className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog> 
                ))}
                <div className=" pb-20 mb-20  pt-2 text-sm">
                        <p>Hasil temuan Inspeksi</p>
                </div>
                </ScrollArea>
                </div>
        </div>
     );
}
 
export default Temuan;