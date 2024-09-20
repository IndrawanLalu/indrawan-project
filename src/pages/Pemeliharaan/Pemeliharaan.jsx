
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FaCheck } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const Pemeliharaan = () => {
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
            <div className="flex fixed left-0 right-0 top-12 md:left-40 ">
                <h2 className="font-semibold text-start md:text-2xl md:pt-12 border-b pb-2 pt-6 border-main ">Hasil Temuan
                </h2>
            </div>
            <div className="fixed left-0 right-0 top-28 md:left-40 md:right-40 md:top-40">
                <ScrollArea className="w-full h-[550px] pb-20 px-2 md:h-screen">
                    {data.map((item) => (
                        <div key={item.id} className="grid grid-cols-6 justify-start py-2 hover:bg-main/10">
                            <div className="content-center pl-2">
                                <Avatar>
                                    <AvatarImage src={item.imageUrl} />
                                    <AvatarFallback>SB</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="col-start-2 col-span-3 md:col-span-2 text-start">
                                <h2 className="font-semibold">{item.temuan}</h2>
                                <p className="text-sm">{item.lokasi}</p>
                            </div>
                            <div className="hidden md:flex md:text-start">
                                <h2 className="font-semibold">{item.penyulang}</h2>
                            </div>
                            <div className="hidden md:flex md:text-start">
                                <h2 className="font-semibold">{item.tglInspeksi}</h2>
                            </div>
                            <div className="content-center flex flex-col items-end col-span-2 md:col-span-1 md:mr-4">
                                <div className="text-[10px]">{item.tglInspeksi}</div>
                                <div className="">
                                <Link to={`/eksekusi/${item.id}`}>
                                    {item.status === "Temuan" ? (
                                            <Badge variant="temuan">{item.status}</Badge>
                                        ) : (
                                            <Badge><FaCheck />{item.status} </Badge>
                                        )}
                                </Link>
                                </div>
                            </div>
                            
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
     );
}
export default Pemeliharaan;