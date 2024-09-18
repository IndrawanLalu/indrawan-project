import { useState } from "react";
import { db, storage } from "@/firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Body from "@/components/body";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HasilTemuan from "./hasilTemuan";

const FormTemuan = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e) => {

    
    e.preventDefault();

    if (!text || !image) {
      alert("Please provide both text and image.");
      return;
    }

    try {
      // Upload gambar ke Firebase Storage dengan progress tracking
      const imageRef = ref(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(imageRef, image);

      // Mengawasi progress upload
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Perbarui progress berdasarkan persentase upload
          const progressPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercentage);
        },
        (error) => {
          console.error("Error uploading file: ", error);
        },
        async () => {
          // Dapatkan URL download setelah upload selesai
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Simpan data ke Firestore
          const docRef = await addDoc(collection(db, "posts"), {
            text: text,
            imageUrl: imageUrl,
          });
          console.log("Document written with ID: ", docRef.id);
          alert("Upload successful!");
          setText("");
          setImage(null);
          setProgress(0); // Reset progress setelah upload
        }
      );
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  return (
    <Body>
      <form onSubmit={handleUpload}>
        <div>
          <Label htmlFor="text">Text:</Label>
          <Input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="image">Image:</Label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Upload</button>
      </form>
      {progress > 0 && <progress value={progress} max="100" />}

      <HasilTemuan />
    </Body>
  );
};

export default FormTemuan;
