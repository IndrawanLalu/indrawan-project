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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Temuan = () => {
    const [data, setData] = useState([]);
        useEffect(() => {
            const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "inspeksi"));
                const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setData(fetchedData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
            };
            fetchData();
        }, []);
    return ( 
        <div className="Container">
                <h2 className="font-semibold text-start md:text-2xl md:pt-12 border-b pb-2 pt-6 border-main ">Hasil Temuan <TambahTemuan />
                </h2>
                {data.map((item) => (
                <Dialog key={item.id}>
                    <DialogTrigger asChild >
                    <div className="grid grid-cols-5 justify-start py-2">
                        <div className="content-center">
                            <Avatar>
                                <AvatarImage src={item.imageUrl} />
                                <AvatarFallback>SB</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="col-start-2 col-span-3 text-start">
                            <h2 className="font-semibold">{item.temuan}</h2>
                            <p className="text-sm">{item.lokasi}</p>
                        </div>
                        <div className="content-center">
                            <div className="text-[10px]">{item.tglInspeksi}</div>
                        {item.status === "Temuan" ? (
                                <Badge variant="temuan">{item.status}</Badge>
                            ) : (
                                <Badge><FaCheck />{item.status} </Badge>
                            )}
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
        </div>
     );
}
 
export default Temuan;