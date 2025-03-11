// NotificationsPage.jsx (diperbaiki)
import { useState } from "react";
import { useNotifications } from "../contexts/notifications"; // Sesuaikan path impor

import { format } from "date-fns";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Layouts from "./admin/Layouts";

const NotificationsPage = () => {
  // Sekarang kita mengimpor checkAndCreateNotifications dari hook useNotifications
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    thresholds,
    updateThresholds,
    checkAndCreateNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("all");
  const [updatedThresholds, setUpdatedThresholds] = useState(thresholds);

  // Filter notifikasi berdasarkan tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "load") return notification.type === "load";
    if (activeTab === "unbalance") return notification.type === "unbalance";
    return true;
  });

  // Handler untuk mengubah threshold
  const handleThresholdChange = (e) => {
    const { name, value } = e.target;
    setUpdatedThresholds({
      ...updatedThresholds,
      [name]: parseFloat(value),
    });
  };

  // Simpan threshold yang diubah
  const saveThresholds = () => {
    updateThresholds(updatedThresholds);
    alert("Threshold berhasil diupdate");
  };

  // Fungsi untuk mengecek notifikasi secara manual
  const checkNotificationsManually = async () => {
    try {
      // Ambil data pengukuran terakhir
      const pengukuranSnapshot = await getDocs(collection(db, "Pengukuran"));
      const pengukuranData = pengukuranSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Data pengukuran untuk cek manual:", pengukuranData);

      // Jalankan pengecekan notifikasi
      const alerts = await checkAndCreateNotifications(pengukuranData);

      alert(
        `${alerts.length} notifikasi baru terdeteksi dan ditambahkan. Lihat console untuk detail.`
      );
    } catch (error) {
      console.error("Error saat cek manual:", error);
      alert("Error saat memeriksa notifikasi. Lihat console untuk detail.");
    }
  };

  return (
    <Layouts>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Pemberitahuan & Pengaturan Notifikasi
          </h2>
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <Button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Tandai Semua Telah Dibaca
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel notifikasi */}
          <div className="md:col-span-2">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="border-b">
                  <div className="flex h-auto p-0">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`flex-1 rounded-none py-3 border-b-2 ${
                        activeTab === "all"
                          ? "border-main font-medium"
                          : "border-transparent"
                      }`}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("unread")}
                      className={`flex-1 rounded-none py-3 border-b-2 ${
                        activeTab === "unread"
                          ? "border-main font-medium"
                          : "border-transparent"
                      }`}
                    >
                      Belum Dibaca (
                      {notifications.filter((n) => !n.isRead).length})
                    </button>
                    <button
                      onClick={() => setActiveTab("load")}
                      className={`flex-1 rounded-none py-3 border-b-2 ${
                        activeTab === "load"
                          ? "border-main font-medium"
                          : "border-transparent"
                      }`}
                    >
                      Beban
                    </button>
                    <button
                      onClick={() => setActiveTab("unbalance")}
                      className={`flex-1 rounded-none py-3 border-b-2 ${
                        activeTab === "unbalance"
                          ? "border-main font-medium"
                          : "border-transparent"
                      }`}
                    >
                      Unbalance
                    </button>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Tidak ada notifikasi ditemukan
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:bg-gray-50 ${
                          !notification.isRead
                            ? notification.severity === "high"
                              ? "bg-red-50"
                              : "bg-yellow-50"
                            : "bg-white"
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div
                            className={`mt-1 mr-3 flex-shrink-0 rounded-full w-3 h-3 ${
                              notification.severity === "high"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            } ${
                              notification.isRead ? "opacity-40" : "opacity-100"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <div
                              className={`font-medium ${
                                notification.isRead
                                  ? "text-gray-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.message}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-sm text-gray-500">
                                {format(
                                  notification.createdAt,
                                  "dd MMMM yyyy, HH:mm"
                                )}
                              </div>
                              {!notification.isRead && (
                                <button
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  Tandai dibaca
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel pengaturan */}
          <div>
            {/* Tambahkan tombol debugging di sini */}
            <Button
              onClick={checkNotificationsManually}
              className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Periksa Notifikasi Secara Manual
            </Button>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <CardTitle className="text-lg mb-4">
                  Pengaturan Threshold
                </CardTitle>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Threshold Persentase Beban (%)
                    </label>
                    <input
                      type="number"
                      name="loadPercentage"
                      value={updatedThresholds.loadPercentage}
                      onChange={handleThresholdChange}
                      min="1"
                      max="100"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Notifikasi akan dikirim jika beban melebihi{" "}
                      {updatedThresholds.loadPercentage}% dari kapasitas KVA
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Threshold Unbalance (%)
                    </label>
                    <input
                      type="number"
                      name="unbalance"
                      value={updatedThresholds.unbalance}
                      onChange={handleThresholdChange}
                      min="1"
                      max="100"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Notifikasi akan dikirim jika unbalance melebihi{" "}
                      {updatedThresholds.unbalance}%
                    </p>
                  </div>

                  <Button
                    onClick={saveThresholds}
                    className="w-full mt-4 px-4 py-2 bg-main text-white rounded-md hover:bg-main/90 transition"
                  >
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm mt-4">
              <CardContent className="pt-6">
                <CardTitle className="text-lg mb-4">Informasi</CardTitle>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Notifikasi tingkat tinggi (beban)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Notifikasi tingkat sedang (unbalance)</span>
                  </div>
                  <p className="text-gray-600 mt-4">
                    Sistem akan otomatis memeriksa data pengukuran yang masuk
                    dan memberikan notifikasi jika ada parameter yang melebihi
                    threshold.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layouts>
  );
};

export default NotificationsPage;
