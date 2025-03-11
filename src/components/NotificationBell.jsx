import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../contexts/notifications"; // Sesuaikan dengan path yang benar
import { format } from "date-fns";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (id) => {
    markAsRead(id);
  };

  // Filter notifikasi untuk menampilkan hanya yang relevan
  // Hindari menampilkan notifikasi inisialisasi sistem
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.type !== "system" ||
      notification.message !== "Sistem notifikasi diinisialisasi"
  );

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Notifikasi"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg z-50 border border-gray-200 max-h-[80vh] overflow-hidden">
          <div className="py-2 px-4 bg-gray-100 flex justify-between items-center border-b border-gray-200">
            <div className="font-semibold text-gray-800">
              Notifikasi {unreadCount > 0 && `(${unreadCount} baru)`}
            </div>
            {unreadCount > 0 && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => markAllAsRead()}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Tidak ada notifikasi
              </div>
            ) : (
              filteredNotifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    !notification.isRead
                      ? notification.severity === "high"
                        ? "bg-red-50"
                        : "bg-yellow-50"
                      : "bg-white"
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start">
                    <div
                      className={`mt-1 mr-3 rounded-full w-2 h-2 flex-shrink-0 ${
                        notification.severity === "high"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      } ${notification.isRead ? "opacity-40" : "opacity-100"}`}
                    ></div>
                    <div className="flex-1">
                      <div
                        className={`font-medium text-sm ${
                          notification.isRead
                            ? "text-gray-600"
                            : "text-gray-900"
                        }`}
                      >
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(notification.createdAt, "dd MMM yyyy HH:mm")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {filteredNotifications.length > 10 && (
              <div className="p-2 text-center border-t border-gray-100">
                <a
                  href="/notifications"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Lihat semua notifikasi
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
