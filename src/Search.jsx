import { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"



const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data dari public folder
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    const filteredResults = data.filter((item) =>
      item.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setResults(filteredResults);
  };

  return (
    <div>
      <Input className="mb-4 mt-4"
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Cari nama..."
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ">
        {results.map((item) => (
          <li key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                
              </CardHeader>
              <CardContent>
                <p>Barcode: {item.barcode}</p>
                <p>Harga: {item.Harga}</p>
              </CardContent>
              
            </Card>
            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
