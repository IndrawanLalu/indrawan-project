import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { EditIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Penyulang = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "penyulang"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="flex w-full flex-col pt-24 text-center mx-auto px-28">
      <div className="text-2xl font-semibold py-2">Penyulang ULP Selong</div>
      <div className="flex gap-2 items-center">
        <span className="text-2xl font-semibold">Tambah</span>
        <Link to="/aset/tambahPenyulang">
          <Button type="button" size="icon">
            <PlusCircleIcon />
          </Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]">#</TableHead>
            <TableHead>Penyulang</TableHead>
            <TableHead>Sumber GI/PLTD</TableHead>
            <TableHead>Panjang</TableHead>
            <TableHead>Beban</TableHead>
            <TableHead>Tgl Update</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.penyulang}</TableCell>
              <TableCell>{item.sumber}</TableCell>
              <TableCell>{item.Panjang} kMS</TableCell>
              <TableCell>{item.beban} MW</TableCell>
              <TableCell> {item.tglUpdate}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button type="button" size="icon">
                    <EditIcon />
                  </Button>
                  <Button type="button" variant="delete" size="icon">
                    <TrashIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Penyulang;
