import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig" // Import Firestore instance

const HasilTemuan = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Data from Firestore</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <p>Text: {item.text}</p>
            <img src={item.imageUrl} alt="Uploaded" style={{ maxWidth: "100px" }} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HasilTemuan;
