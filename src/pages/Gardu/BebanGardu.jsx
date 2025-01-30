import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import Layouts from "../admin/Layouts";
import { useNavigate } from "react-router-dom";

const BebanGardu = () => {
  const [data, setData] = useState([]);
  const [arusLimit, setArusLimit] = useState(""); // Nilai input user
  const [debouncedArusLimit, setDebouncedArusLimit] = useState(""); // Nilai debounced
  const [isCheckedBeban, setIsCheckedBeban] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/db/amg.json")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  // Debounce: Update `debouncedArusLimit` setelah user berhenti mengetik selama 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedArusLimit(arusLimit);
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [arusLimit]);

  const filterData = () => {
    const limitValue = parseInt(debouncedArusLimit, 10); // Gunakan nilai debounced
    return data
      .map((item) => {
        let arusLebihLimit = {};

        if (!isNaN(limitValue)) {
          for (let key in item) {
            if (key.match(/_A|_B|_C|_D|_K/)) {
              const value = parseInt(item[key], 10);
              if (value > limitValue) {
                arusLebihLimit[key] = value;
              }
            }
          }
        }

        const isBebanConditionMet = parseFloat(item.Persen) > 80;

        if (
          (Object.keys(arusLebihLimit).length > 0 && limitValue) ||
          (isCheckedBeban && isBebanConditionMet) ||
          (!limitValue && !isCheckedBeban)
        ) {
          return { ...item, arusLebihLimit };
        }

        return null;
      })
      .filter((item) => item !== null);
  };

  const displayedData = filterData();

  const handleRowClick = (nama) => {
    navigate(`/admin/detail-gardu/${nama}`);
  };

  return (
    <Layouts>
      <div className="gap-2 mb-4">
        <label className="flex items-center gap-2">
          <span>Filter Arus Lebih dari:</span>
          <input
            type="number"
            value={arusLimit}
            onChange={(e) => setArusLimit(e.target.value)}
            placeholder="Masukkan nilai"
            className="border px-2 py-1"
          />
        </label>
      </div>
      <div className="gap-2 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isCheckedBeban}
            onChange={() => setIsCheckedBeban(!isCheckedBeban)}
          />
          Beban lebih dari 50%
        </label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]">#</TableHead>
            <TableHead>Gardu</TableHead>
            <TableHead>Alamat</TableHead>
            <TableHead>KVA</TableHead>
            <TableHead>R_TOTAL</TableHead>
            <TableHead>S_TOTAL</TableHead>
            <TableHead>T_TOTAL</TableHead>
            <TableHead>N_TOTAL</TableHead>
            <TableHead>Beban KVA</TableHead>
            <TableHead>%</TableHead>

            {debouncedArusLimit && (
              <TableHead>Arus Lebih dari {debouncedArusLimit}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedData.map((item, index) => (
            <TableRow
              key={item.nama}
              onClick={() => handleRowClick(item.nama)}
              style={{ cursor: "pointer" }}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.nama}</TableCell>
              <TableCell>{item.alamat}</TableCell>
              <TableCell>{item.kva}</TableCell>
              <TableCell>{item.rTotal}</TableCell>
              <TableCell>{item.sTotal}</TableCell>
              <TableCell>{item.tTotal}</TableCell>
              <TableCell>{item.nTotal}</TableCell>
              <TableCell>{item.bebanKva}</TableCell>
              <TableCell>{item.Persen}</TableCell>
              {debouncedArusLimit && (
                <TableCell>
                  {Object.entries(item.arusLebihLimit).map(([key, value]) => (
                    <div key={key}>
                      {key}: {value}
                    </div>
                  ))}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Layouts>
  );
};

export default BebanGardu;
