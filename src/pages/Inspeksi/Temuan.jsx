import Body from "@/components/body";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
  


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
        <Body>
            <h2 className="font-semibold">Hasil Temuan</h2>
            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead className="">Foto</TableHead>
                    <TableHead>Temuan</TableHead>
                    <TableHead>Lokasi</TableHead>
                    
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="text-xs md:text-sm">
                {data.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell className="flex items-center space-x-3">
                        <Dialog>
                            <DialogTrigger asChild>
                            <img src={item.imageUrl} alt="image" className="w-10 h-10 rounded-full md:rounded-md "/>
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
                    </TableCell>
                    <TableCell>{item.temuan}</TableCell>
                    <TableCell>{item.lokasi}</TableCell>
                    <TableCell className="text-right">{item.status}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>

        </Body>
     );
}
 
export default Temuan;