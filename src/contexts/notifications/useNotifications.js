// File 2: useNotifications.js
// File ini hanya berisi hook
import { useContext } from "react";
import NotificationContext from "./NotificationContext";

const useNotifications = () => useContext(NotificationContext);

export default useNotifications;
