// utils/notificationSystem.js - Tree Monitoring Notification System
import { useState, useCallback } from "react";

import {
  getTreesNeedingBotNotification,
  getTreesNeedingDailyNotification,
  generateBotNotificationMessage,
  generateDailyNotificationMessage,
} from "./treePrediction";

// WhatsApp API Configuration
const WHATSAPP_CONFIG = {
  groupId: "120363277434509822", // ID grup WhatsApp
  botToken: "YOUR_BOT_TOKEN", // Token bot WhatsApp (jika menggunakan API)
  dailyNotificationTime: "08:00", // 08:00 WITA
};

// Send WhatsApp message via web interface
const sendWhatsAppWeb = (message, imageUrl = null) => {
  try {
    let finalMessage = message;
    if (imageUrl) {
      finalMessage += `\n\n📸 Foto: ${imageUrl}`;
    }

    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=&text=${encodedMessage}&group_id=${WHATSAPP_CONFIG.groupId}`;

    window.open(whatsappUrl, "_blank");
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

// Check for new critical findings that need immediate bot notification
const checkCriticalFindings = async (newInspectionData) => {
  try {
    console.log("=== CHECKING CRITICAL FINDINGS ===");

    const criticalTrees = getTreesNeedingBotNotification([newInspectionData]);

    if (criticalTrees.length > 0) {
      console.log(
        `Found ${criticalTrees.length} critical trees needing immediate notification`
      );

      for (const tree of criticalTrees) {
        const message = generateBotNotificationMessage(tree);
        const success = sendWhatsAppWeb(message, tree.fotoSebelumURL);

        if (success) {
          console.log(`Critical notification sent for tree at: ${tree.lokasi}`);

          // Log notification to database (optional)
          await logNotification({
            type: "CRITICAL_FINDING",
            treeId: tree.id,
            message: message,
            sentAt: new Date().toISOString(),
            status: "SENT",
          });
        }
      }

      return criticalTrees.length;
    }

    return 0;
  } catch (error) {
    console.error("Error checking critical findings:", error);
    return 0;
  }
};

// Daily notification scheduler (to be called by cron job or scheduler)
const sendDailyNotification = async (allTreesData) => {
  try {
    console.log("=== SENDING DAILY NOTIFICATION ===");

    const treesNeedingAttention =
      getTreesNeedingDailyNotification(allTreesData);

    if (treesNeedingAttention.length === 0) {
      console.log("No trees need daily notification today");
      return 0;
    }

    console.log(
      `Found ${treesNeedingAttention.length} trees needing daily notification`
    );

    const message = generateDailyNotificationMessage(treesNeedingAttention);
    const success = sendWhatsAppWeb(message);

    if (success) {
      console.log("Daily notification sent successfully");

      // Log daily notification
      await logNotification({
        type: "DAILY_SUMMARY",
        treeCount: treesNeedingAttention.length,
        message: message,
        sentAt: new Date().toISOString(),
        status: "SENT",
      });

      return treesNeedingAttention.length;
    }

    return 0;
  } catch (error) {
    console.error("Error sending daily notification:", error);
    return 0;
  }
};

// Check if current time matches daily notification schedule
const shouldSendDailyNotification = () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  // Check if it's 08:00 WITA (adjust timezone as needed)
  return currentTime === WHATSAPP_CONFIG.dailyNotificationTime;
};

// Log notification to database (implement with your database)
const logNotification = async (notificationData) => {
  try {
    // This would be implemented with your database
    // For now, just log to console
    console.log("Notification logged:", notificationData);

    // Example with Firebase:
    // import { addDoc, collection } from "firebase/firestore";
    // import { db } from "@/firebase/firebaseConfig";
    // await addDoc(collection(db, "notifications"), notificationData);

    return true;
  } catch (error) {
    console.error("Error logging notification:", error);
    return false;
  }
};

// Get notification history (implement with your database)
const getNotificationHistory = async (limit = 50) => {
  try {
    // This would fetch from your database
    // For now, return empty array
    console.log("Fetching notification history...");

    // Example with Firebase:
    // import { getDocs, collection, orderBy, query, limit as firebaseLimit } from "firebase/firestore";
    // import { db } from "@/firebase/firebaseConfig";
    // const q = query(
    //   collection(db, "notifications"),
    //   orderBy("sentAt", "desc"),
    //   firebaseLimit(limit)
    // );
    // const querySnapshot = await getDocs(q);
    // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return [];
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return [];
  }
};

// Manual trigger for testing notifications
const testNotification = async (testType = "daily") => {
  try {
    console.log(`=== TESTING ${testType.toUpperCase()} NOTIFICATION ===`);

    if (testType === "daily") {
      const testMessage = `🧪 TEST NOTIFIKASI HARIAN
📅 ${new Date().toLocaleDateString("id-ID")}
⏰ ${new Date().toLocaleTimeString("id-ID")}

✅ Sistem notifikasi berfungsi dengan baik!
🔔 Notifikasi harian akan dikirim setiap hari jam 08:00 WITA untuk pohon yang perlu perhatian.`;

      return sendWhatsAppWeb(testMessage);
    }

    if (testType === "critical") {
      const testMessage = `🚨 TEST NOTIFIKASI KRITIS
📅 ${new Date().toLocaleDateString("id-ID")}
⏰ ${new Date().toLocaleTimeString("id-ID")}

⚠️ Ini adalah test notifikasi untuk temuan kritis!
🔴 Notifikasi akan otomatis terkirim saat ada temuan pohon yang sangat berbahaya (< 1 hari).`;

      return sendWhatsAppWeb(testMessage);
    }

    return false;
  } catch (error) {
    console.error("Error testing notification:", error);
    return false;
  }
};

// Schedule daily notifications (to be used with cron job or similar)
const scheduleDailyNotifications = (allTreesData) => {
  // Check every minute if it's time for daily notification
  const checkInterval = setInterval(async () => {
    if (shouldSendDailyNotification()) {
      console.log("Time for daily notification!");
      await sendDailyNotification(allTreesData);

      // Clear interval after sending to avoid sending multiple times
      clearInterval(checkInterval);

      // Reschedule for next day
      setTimeout(() => {
        scheduleDailyNotifications(allTreesData);
      }, 24 * 60 * 60 * 1000); // 24 hours
    }
  }, 60000); // Check every minute

  return checkInterval;
};

// Hook for React components to use notification system
const useNotificationSystem = () => {
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendCriticalNotification = useCallback(async (treeData) => {
    setIsLoading(true);
    try {
      const result = await checkCriticalFindings(treeData);
      return result > 0;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendTestNotification = useCallback(async (type) => {
    setIsLoading(true);
    try {
      return await testNotification(type);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await getNotificationHistory();
      setNotificationHistory(history);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notificationHistory,
    isLoading,
    sendCriticalNotification,
    sendTestNotification,
    refreshHistory,
  };
};

export {
  checkCriticalFindings,
  sendDailyNotification,
  shouldSendDailyNotification,
  scheduleDailyNotifications,
  testNotification,
  logNotification,
  getNotificationHistory,
  useNotificationSystem,
  WHATSAPP_CONFIG,
};
