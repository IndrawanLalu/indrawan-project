import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // Import Firestore instance

export async function setUserRole(uid, role) {
  try {
    await setDoc(doc(db, "userRoles", uid), {
      role: role
    });
    console.log("User role set successfully");
  } catch (error) {
    console.error("Error setting user role: ", error);
  }
}
