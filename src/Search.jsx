import { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null); // Untuk menyimpan timeout

  useEffect(() => {
    // Fetch data dari public folder
    fetch("/db/data.json")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set timeout untuk menunggu 1 detik sebelum pencarian dieksekusi
    const timeout = setTimeout(() => {
      const filteredResults = data.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filteredResults);
    }, 2000); // 1 detikk

    setTypingTimeout(timeout);
  };

  return (
    <div>
      <Input
        className="mb-4 mt-4"
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Cari nama..."
      />
      <ul className="flex flex-col gap-4 px-4 ">
        {results.map((item) => (
          <li key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>variant: {item.varian}</p>
                <p>Barcode: {item.barcode}</p>
                <p>Harga: {item.Harga}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <div className="h-40"></div>
    </div>
  );
};

export default Search;
