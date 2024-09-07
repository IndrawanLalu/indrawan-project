import { useState, useEffect } from "react";

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
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Cari nama..."
      />
      <ul className="bg-gray-200">
        {results.map((item) => (
          <li key={item.id}>
            {item.name} - Barcode: {item.barcode} - Harga: {item.Harga}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
