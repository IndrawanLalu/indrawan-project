import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FaCheck } from "react-icons/fa";
import { CgDanger } from "react-icons/cg";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import ImagePreview from "../ImagePreview";

const Temuan = () => {
  const [data, setData] = useState([]);
  const lastDocRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limitPerPage = 10;

  const fetchData = async (loadMore = false) => {
    setLoading(true);
    try {
      const ref = collection(db, "inspeksi");
      let q = query(ref, orderBy("tglInspeksi", "desc"), limit(limitPerPage));

      if (loadMore && lastDocRef.current) {
        q = query(
          ref,
          orderBy("tglInspeksi", "desc"),
          startAfter(lastDocRef.current),
          limit(limitPerPage)
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      lastDocRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
      setHasMore(querySnapshot.docs.length >= limitPerPage);

      setData((prevData) =>
        loadMore ? [...prevData, ...fetchedData] : fetchedData
      );
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-md">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <h2 className="text-xl font-bold flex items-center">
            🎯 Hasil Temuan
          </h2>
          <Link to="/tambahTemuan">
            <button className="bg-green-500 text-white p-2 rounded-full shadow-md hover:bg-green-600 transition">
              ➕
            </button>
          </Link>
        </div>

        <ScrollArea className="fixed left-0 right-0 top-2 md:left-48 md:right-48 md:top-40 h-screen">
          {data.map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <div className="grid grid-cols-6 py-2 bg-white shadow-md rounded-lg p-2 border border-gray-200 hover:shadow-lg transition">
                  <div className="col-span-3 text-start">
                    <h2 className="font-semibold">{item.temuan}</h2>
                    <p className="text-sm">{item.lokasi}</p>
                  </div>
                  <div className="col-start-4 text-center">
                    <span>P.{item.penyulang}</span>
                  </div>
                  <div className="hidden md:flex col-start-5 flex-col text-start">
                    <span>Inspektor</span>
                    <h2 className="font-semibold">{item.inspektor}</h2>
                  </div>
                  <div className="text-end col-span-2 md:col-span-1">
                    <span className="text-[10px]">
                      {new Date(item.tglInspeksi).toLocaleDateString("id-ID")}
                    </span>
                    <Badge variant={item.status.toLowerCase()}>
                      {item.status === "Temuan" ? <CgDanger /> : <FaCheck />}{" "}
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Detail Temuan</DialogTitle>
                  <DialogDescription>
                    Pastikan Detail Temuan Anda Benar
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Foto</Label>
                    <ImagePreview
                      src={item.imageUrl}
                      className="w-20 h-20 md:w-36 md:h-36 rounded-md"
                    />
                  </div>
                  {[
                    { label: "Temuan", value: item.temuan },
                    { label: "Lokasi", value: item.lokasi },
                    { label: "Inspektor", value: item.inspektor },
                    { label: "Penyulang", value: item.penyulang },
                    { label: "Kategori", value: item.category },
                    { label: "Tgl Inspeksi", value: item.tglInspeksi },
                  ].map(({ label, value }, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 items-center gap-4"
                    >
                      <Label className="text-right">{label}</Label>
                      <Input
                        defaultValue={value}
                        className="col-span-3"
                        readOnly
                      />
                    </div>
                  ))}
                </div>

                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}

          <div className="flex justify-center mt-4">
            {hasMore && !loading && (
              <Button size="full" onClick={() => fetchData(true)}>
                Load More
              </Button>
            )}
            {loading && <p>Loading...</p>}
          </div>

          <div className="pb-20 pt-2 text-sm flex justify-center">
            <p>Hasil temuan Inspeksi</p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Temuan;
