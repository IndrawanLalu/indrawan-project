
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FaCheck } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

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
                <h2 className="font-semibold text-start md:text-2xl md:pt-12 border-b pb-2 pt-6 border-main ">Hasil Temuan
                </h2>
                {data.map((item) => (
                    <div key={item.id} className="grid grid-cols-5 justify-start py-2">
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
                            <Link to={`/eksekusi/${item.id}`}>
                                {item.status === "Temuan" ? (
                                        <Badge variant="temuan">{item.status}</Badge>
                                    ) : (
                                        <Badge><FaCheck />{item.status} </Badge>
                                    )}
                            </Link>
                        </div>
                    </div>
                ))}
        </div>
     );
}
export default Pemeliharaan;