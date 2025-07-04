import { useState, useEffect } from "react";
import { debounce } from "lodash";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import SidebarMobile from "../admin/SidebarMobile";
import { useSelector } from "react-redux";

const Pengukuran = () => {
  const user = useSelector((state) => state.auth.user);
  const selectedPetugas = useSelector(
    (state) => state.petugas?.selectedPetugas || []
  );
  const allowedServicesForYantek = ["/pengukuran-form", "/", "/preventive"];
  const nav = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [pengukuran, setPengukuran] = useState({
    tanggalUkur: "",
    kva: 0,
    alamat: "",
    R: "",
    S: "",
    T: "",
    N: "",
    perJurusan: {
      R: { A: "", B: "", C: "", D: "", K: "" },
      S: { A: "", B: "", C: "", D: "", K: "" },
      T: { A: "", B: "", C: "", D: "", K: "" },
      N: { A: "", B: "", C: "", D: "", K: "" },
    },
    // petugas: selectedPetugas.map((p) => p.nama).join(", "),
    tegangan: {
      R_N: "",
      S_N: "",
      T_N: "",
      R_S: "",
      R_T: "",
      S_T: "",
    },
  });
  useEffect(() => {
    if (selectedPetugas.length > 0) {
      const petugasNames = selectedPetugas.map((p) => p.nama).join(", ");
      setPengukuran((prev) => ({
        ...prev,
        petugas: petugasNames,
      }));
    }
  }, [selectedPetugas]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "gardu"));
        const garduData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(garduData);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const searchGardu = debounce(() => {
      if (query) {
        setResults(
          data.filter((item) =>
            item.nama.toLowerCase().includes(query.toLowerCase())
          )
        );
      } else {
        setResults([]);
      }
    }, 2000); // Debounce 500ms agar tidak terlalu sering memanggil pencarian

    searchGardu();
    return () => searchGardu.cancel();
  }, [query, data]);

  // Handle perubahan input total manual
  const handleTotalInputChange = (e, phase) => {
    const { value } = e.target;
    setPengukuran((prev) => ({
      ...prev,
      [phase]: parseFloat(value) || 0,
    }));
  };

  // Handle perubahan input per jurusan
  const handleInputChange = (e, phase, line) => {
    const { value } = e.target;
    setPengukuran((prev) => ({
      ...prev,
      perJurusan: {
        ...prev.perJurusan,
        [phase]: { ...prev.perJurusan[phase], [line]: parseFloat(value) || 0 },
      },
    }));
  };

  const handleTeganganChange = (e, key) => {
    const { value } = e.target;
    setPengukuran((prev) => ({
      ...prev,
      tegangan: {
        ...prev.tegangan,
        [key]: parseFloat(value) || 0,
      },
    }));
  };
  // Hitung Beban KVA
  const bebanKva = ((pengukuran.R + pengukuran.S + pengukuran.T) * 231) / 1000;

  // Hitung Persentase KVA
  const kvaNumber = Number(results[0]?.kva);

  const persenKva = (bebanKva / kvaNumber) * 100;

  // Hitung Unbalance
  const maxArus = Math.max(pengukuran.R, pengukuran.S, pengukuran.T);
  const minArus = Math.min(pengukuran.R, pengukuran.S, pengukuran.T);
  const unbalance = ((maxArus - minArus) / maxArus) * 100;
  // Simpan data ke Firestore
  const handleSavePengukuran = async (garduId) => {
    if (!pengukuran.tanggalUkur) {
      setErrorMessage("Tanggal ukur harus diisi!");
      setShowModal(true);
      return;
    }
    if (!pengukuran.jamUkur) {
      setErrorMessage("Jam ukur harus diisi!");
      setShowModal(true);
      return;
    }
    if (!pengukuran.petugas) {
      setErrorMessage("Petugas harus diisi!");
      setShowModal(true);
      return;
    }
    if (pengukuran.R === "" || pengukuran.S === "" || pengukuran.T === "") {
      setErrorMessage("Minimal satu beban harus lebih dari 0!");
      setShowModal(true);
      return;
    }
    if (
      pengukuran.tegangan.R_N === "" ||
      pengukuran.tegangan.S_N === "" ||
      pengukuran.tegangan.T_N === "" ||
      pengukuran.tegangan.R_S === "" ||
      pengukuran.tegangan.R_T === "" ||
      pengukuran.tegangan.S_T === ""
    ) {
      setErrorMessage("Minimal satu tegangan harus lebih dari 0!");
      setShowModal(true);
      return;
    }
    const selectedGardu = data.find((item) => item.id === garduId);
    if (!selectedGardu) {
      setErrorMessage("Gardu tidak ditemukan!");
      setShowModal(true);
      return;
    }
    try {
      await addDoc(collection(db, "Pengukuran"), {
        nama: selectedGardu.nama,
        garduId,
        kva: selectedGardu.kva,
        alamat: selectedGardu.alamat,
        tanggalUkur: pengukuran.tanggalUkur,
        jamUkur: pengukuran.jamUkur,
        R: pengukuran.R,
        S: pengukuran.S,
        T: pengukuran.T,
        N: pengukuran.N,
        perJurusan: pengukuran.perJurusan,
        tegangan: pengukuran.tegangan,
        bebanKva,
        persenKva,
        unbalance,
        petugas: pengukuran.petugas,
        createdAt: new Date(),
      });
      setErrorMessage("Pengukuran berhasil disimpan!");
      setShowModal(true);
      // Reset form setelah berhasil simpan
      setPengukuran({
        tanggalUkur: "",
        petugas: "",
        jamUkur: "",
        R: "",
        S: "",
        T: "",
        N: "",
        perJurusan: {
          R: { A: "", B: "", C: "", D: "", K: "" },
          S: { A: "", B: "", C: "", D: "", K: "" },
          T: { A: "", B: "", C: "", D: "", K: "" },
          N: { A: "", B: "", C: "", D: "", K: "" },
        },
        tegangan: {
          R_N: "",
          S_N: "",
          T_N: "",
          R_S: "",
          R_T: "",
          S_T: "",
        },
      });
      // Tunggu beberapa detik sebelum navigasi (opsional)
      setTimeout(() => {
        setShowModal(false); // Tutup modal
        nav("/"); // Navigasi ke halaman utama
      }, 2000); // 2 detik delay sebelum pindah halaman
    } catch {
      setErrorMessage("Gagal menyimpan pengukuran, coba lagi.");
      setShowModal(true);
    }
  };

  return (
    <div className="p-4">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md">
            <p>{errorMessage}</p>
            <Button onClick={() => setShowModal(false)} className="mt-2">
              OK
            </Button>
          </div>
        </div>
      )}
      <div className="fixed top-0 right-0 bg-main text-white px-4 py-2 h-16 w-full z-10 flex items-center justify-center bg-gradient-to-r from-main to-blue-500 font-semibold">
        <div className="text-center w-full">
          PENGUKURAN BEBAN GARDU
          {selectedPetugas.length > 0 && (
            <div className=" text-sm">
              <p>Petugas: {selectedPetugas.map((p) => p.nama).join(", ")}</p>
            </div>
          )}
        </div>
      </div>
      {/* Sidebar Mobile */}
      <SidebarMobile pengguna={user} ruteDisetujui={allowedServicesForYantek} />
      <div className="py-2 bg-main rounded-md">
        <span className="py-4 gap-4 font-semibold">🏠 Beban Gardu Selong</span>
      </div>

      <Input
        className="mb-4 mt-4"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari nomor gardu..."
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <li key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2>
                    {item.nama}-{item.kva} KVA
                  </h2>
                  <p className="text-sm">{item.alamat}</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Data Beban Gardu</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2">
                        <div className="flex flex-col gap-2">
                          {["R", "S", "T", "N"].map((phase) => (
                            <div
                              key={phase}
                              className="flex flex-row items-center gap-2 mt-2"
                            >
                              <Label className="font-bold">{phase} :</Label>
                              <Input
                                type="number"
                                value={pengukuran[phase]}
                                onChange={(e) =>
                                  handleTotalInputChange(e, phase)
                                }
                                className="w-24 h-8 text-center"
                                step="any"
                                required
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <Input
                            type="date"
                            value={pengukuran.tanggalUkur}
                            onChange={(e) =>
                              setPengukuran({
                                ...pengukuran,
                                tanggalUkur: e.target.value,
                              })
                            }
                          ></Input>
                          <Input
                            className="mt-2"
                            type="time"
                            value={pengukuran.jamUkur}
                            onChange={(e) =>
                              setPengukuran({
                                ...pengukuran,
                                jamUkur: e.target.value,
                              })
                            }
                          ></Input>
                        </div>
                      </div>

                      <p className="py-2 font-semibold">Per Jurusan</p>
                      <div className="grid grid-cols-6 border-t border-b py-2">
                        <div className="flex flex-col items-start gap-3">
                          <p className="font-bold">Fasa</p>
                          <p className="font-bold">R</p>
                          <p className="font-bold">S</p>
                          <p className="font-bold">T</p>
                          <p className="font-bold">N</p>
                        </div>

                        {["A", "B", "C", "D", "K"].map((line) => (
                          <div key={line} className="flex flex-col items-start">
                            <p className="font-bold">Line {line}</p>
                            {["R", "S", "T", "N"].map((phase) => (
                              <div
                                className="flex items-center gap-1 mb-1"
                                key={`${phase}_${line}`}
                              >
                                <Input
                                  type="number"
                                  value={pengukuran.perJurusan[phase][line]}
                                  onChange={(e) =>
                                    handleInputChange(e, phase, line)
                                  }
                                  className="w-16 h-8 text-center"
                                  step="any"
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="py-2 font-semibold">Tegangan (Volt)</p>
                        <div className="grid grid-cols-3 gap-4 border-main border-b py-2">
                          {["R_N", "S_N", "T_N", "R_S", "R_T", "S_T"].map(
                            (key) => (
                              <div key={key} className="flex flex-col">
                                <Label className="font-bold">
                                  {key.replace("_", " - ")} :
                                </Label>
                                <Input
                                  type="number"
                                  value={pengukuran.tegangan[key]}
                                  onChange={(e) => handleTeganganChange(e, key)}
                                  className="w-24 h-8 text-center font-mono"
                                  step="any"
                                  required
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <div></div>
                      <div>
                        <h2>Kesimpulan</h2>
                        <p> Beban KVA = {bebanKva.toFixed(2)}</p>
                        <p> Persentase KVA = {persenKva.toFixed(2)}%</p>
                        <p>Unbalance = {unbalance.toFixed(2)}</p>
                      </div>

                      <div className="mt-4">
                        <h2>Petugas</h2>
                        <Input
                          disabled
                          type="text"
                          value={pengukuran.petugas}
                          onChange={(e) =>
                            setPengukuran({
                              ...pengukuran,
                              petugas: e.target.value,
                            })
                          }
                        />
                      </div>

                      <Button
                        onClick={() => handleSavePengukuran(item.id)}
                        className="mt-4 w-full"
                      >
                        Simpan Pengukuran
                      </Button>
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

export default Pengukuran;
