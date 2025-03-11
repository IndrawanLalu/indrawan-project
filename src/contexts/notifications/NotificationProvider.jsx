// File 3: NotificationProvider.jsx
// File ini berisi provider component
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
  getDocs,
  orderBy,
  writeBatch,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import NotificationContext from "./NotificationContext";

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Konfigurasi threshold
  const [thresholds, setThresholds] = useState({
    loadPercentage: 80, // 80% dari kapasitas KVA
    unbalance: 20, // 10% unbalance
  });

  // Fungsi untuk mengubah threshold
  const updateThresholds = (newThresholds) => {
    setThresholds({ ...thresholds, ...newThresholds });
    // Simpan ke local storage
    localStorage.setItem(
      "notificationThresholds",
      JSON.stringify({
        ...thresholds,
        ...newThresholds,
      })
    );
  };

  useEffect(() => {
    const setupNotificationsCollection = async () => {
      try {
        // Cek apakah collection notifications sudah ada
        const collectionRef = collection(db, "notifications");
        const emptyQuery = query(collectionRef, limit(1));
        const snapshot = await getDocs(emptyQuery);

        console.log(
          "Notifications collection exists:",
          !snapshot.empty || snapshot.metadata
        );

        // Meskipun collection kosong, ini akan memastikan collection dibuat
        if (snapshot.empty) {
          console.log(
            "Creating first notification to ensure collection exists"
          );
          await addDoc(collectionRef, {
            type: "system",
            message: "Sistem notifikasi diinisialisasi",
            severity: "low",
            isRead: true,
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error setting up notifications collection:", error);
      }
    };

    setupNotificationsCollection();
  }, []);

  // Ambil notifikasi dari Firestore saat komponen dimount
  useEffect(() => {
    // Coba ambil threshold dari local storage jika ada
    const savedThresholds = localStorage.getItem("notificationThresholds");
    if (savedThresholds) {
      try {
        setThresholds(JSON.parse(savedThresholds));
      } catch (error) {
        console.error("Error parsing saved thresholds:", error);
      }
    }

    // Query notifikasi dari Firestore
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      setNotifications(notificationData);
      setUnreadCount(notificationData.filter((n) => !n.isRead).length);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Fungsi untuk memeriksa dan membuat notifikasi baru
  const checkAndCreateNotifications = async (data) => {
    console.log("checkAndCreateNotifications dipanggil dengan data:", data);
    console.log("Thresholds saat ini:", thresholds);

    const newAlerts = [];

    // Periksa setiap item data untuk threshold
    data.forEach((item) => {
      // Convert nilai ke number untuk memastikan perbandingan numerik
      const persenKva = parseFloat(item.persenKva || 0);
      const unbalance = parseFloat(item.unbalance || 0);

      console.log(
        `Memeriksa gardu ${item.nama}: persenKva=${persenKva}, threshold=${thresholds.loadPercentage}`
      );

      // Cek beban KVA
      if (persenKva > thresholds.loadPercentage) {
        console.log(`Beban melebihi threshold untuk gardu ${item.nama}`);
        newAlerts.push({
          type: "load",
          message: `Gardu ${item.nama} melebihi ${
            thresholds.loadPercentage
          }% kapasitas (${persenKva.toFixed(2)}%)`,
          severity: "high",
          garduId: item.id,
          garduNama: item.nama,
          value: persenKva,
          isRead: false,
          createdAt: new Date(),
        });
      }

      console.log(
        `Memeriksa gardu ${item.nama}: unbalance=${unbalance}, threshold=${thresholds.unbalance}`
      );

      // Cek unbalance
      if (unbalance > thresholds.unbalance) {
        console.log(`Unbalance melebihi threshold untuk gardu ${item.nama}`);
        newAlerts.push({
          type: "unbalance",
          message: `Gardu ${item.nama} memiliki unbalance ${unbalance.toFixed(
            2
          )}% (>${thresholds.unbalance}%)`,
          severity: "medium",
          garduId: item.id,
          garduNama: item.nama,
          value: unbalance,
          isRead: false,
          createdAt: new Date(),
        });
      }
    });

    console.log("Notifikasi baru yang terdeteksi:", newAlerts.length);

    // Simpan notifikasi baru ke Firestore jika ada
    if (newAlerts.length > 0) {
      for (const alert of newAlerts) {
        try {
          // Cek dulu apakah notifikasi serupa sudah ada di hari yang sama untuk gardu yang sama
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const q = query(
            collection(db, "notifications"),
            where("garduId", "==", alert.garduId),
            where("type", "==", alert.type),
            where("createdAt", ">=", today)
          );

          const existingNotifications = await getDocs(q);

          // Jika belum ada, tambahkan notifikasi baru
          if (existingNotifications.empty) {
            console.log("Menambahkan notifikasi baru ke Firestore:", alert);
            const docRef = await addDoc(collection(db, "notifications"), {
              ...alert,
              createdAt: serverTimestamp(),
            });
            console.log(
              "Notifikasi berhasil ditambahkan dengan ID:",
              docRef.id
            );
          } else {
            console.log(
              "Notifikasi serupa sudah ada hari ini, tidak menambahkan duplikat"
            );
          }
        } catch (error) {
          console.error("Error creating notification:", error);
        }
      }
    }

    return newAlerts;
  };

  // Fungsi untuk menandai notifikasi sebagai telah dibaca
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Fungsi untuk menandai semua notifikasi sebagai telah dibaca
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);

      const unreadNotifications = notifications.filter((n) => !n.isRead);

      unreadNotifications.forEach((notification) => {
        const notificationRef = doc(db, "notifications", notification.id);
        batch.update(notificationRef, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Nilai context
  const value = {
    notifications,
    unreadCount,
    isLoading,
    thresholds,
    updateThresholds,
    checkAndCreateNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Validasi props
NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationProvider;
