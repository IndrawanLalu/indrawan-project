import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { setPetugas } from "@/redux/petugasSlice"; // Perlu membuat slice ini
import {
  LuUsers,
  LuUserCheck,
  LuUserPlus,
  LuSearch,
  LuAlertCircle,
  LuChevronRight,
} from "react-icons/lu";

const PetugasSelection = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  //   const userLogin = useSelector((state) => state.auth.user);

  const [allPetugas, setAllPetugas] = useState([]);
  const [filteredPetugas, setFilteredPetugas] = useState([]);
  const [selectedPetugas, setSelectedPetugas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mengambil daftar petugas dari Firebase saat komponen dimuat
  useEffect(() => {
    const fetchPetugas = async () => {
      try {
        setLoading(true);
        const petugasCollection = collection(db, "petugas");
        const petugasSnapshot = await getDocs(petugasCollection);
        const petugasList = petugasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllPetugas(petugasList);
        setFilteredPetugas(petugasList);
        setLoading(false);
      } catch (err) {
        console.error("Error saat mengambil data petugas:", err);
        setError("Gagal memuat daftar petugas. Silakan coba lagi.");
        setLoading(false);
      }
    };

    fetchPetugas();
  }, []);

  // Filter petugas berdasarkan pencarian
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPetugas(allPetugas);
    } else {
      const filtered = allPetugas.filter((petugas) =>
        petugas.nama.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPetugas(filtered);
    }
  }, [searchQuery, allPetugas]);

  // Menangani pemilihan petugas
  const handleSelectPetugas = (petugas) => {
    if (selectedPetugas.some((p) => p.id === petugas.id)) {
      // Jika sudah dipilih, hapus dari daftar
      setSelectedPetugas(selectedPetugas.filter((p) => p.id !== petugas.id));
    } else {
      // Jika belum dipilih dan belum mencapai batas 2 petugas
      if (selectedPetugas.length < 2) {
        setSelectedPetugas([...selectedPetugas, petugas]);
      }
    }
  };

  // Menangani pencarian
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Lanjut ke dashboard
  const handleContinue = () => {
    if (selectedPetugas.length === 0) {
      setError("Silakan pilih minimal 1 petugas");
      return;
    }

    // Simpan data petugas yang dipilih ke Redux
    dispatch(setPetugas(selectedPetugas));

    // Arahkan ke dashboard
    nav("/dashboard");
  };

  return (
    <div className="petugas-selection-page">
      <div className="petugas-selection-container">
        <div className="selection-header">
          <div className="logo-container">
            <LuUsers className="logo-icon" />
            <h1>PETASAN</h1>
          </div>
          <h2>Pilih Petugas Yantek</h2>
          <p>Pilih maksimal 2 petugas yang sedang bertugas saat ini</p>
        </div>

        <div className="selection-content">
          <div className="search-container">
            <LuSearch className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama petugas..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="selection-panel">
            <div className="petugas-list">
              <h3>
                <LuUserPlus className="section-icon" />
                Daftar Petugas
              </h3>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Memuat daftar petugas...</p>
                </div>
              ) : filteredPetugas.length > 0 ? (
                <div className="petugas-grid">
                  {filteredPetugas.map((petugas) => (
                    <div
                      key={petugas.id}
                      className={`petugas-card ${
                        selectedPetugas.some((p) => p.id === petugas.id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectPetugas(petugas)}
                    >
                      <div className="avatar-container">
                        {petugas.foto ? (
                          <img
                            src={petugas.foto}
                            alt={petugas.nama}
                            className="avatar"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {petugas.nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {selectedPetugas.some((p) => p.id === petugas.id) && (
                          <div className="selected-indicator">
                            <LuUserCheck />
                          </div>
                        )}
                      </div>
                      <div className="petugas-details">
                        <h4>{petugas.nama}</h4>
                        <p>{petugas.jabatan || "Yantek"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Tidak ada petugas yang ditemukan</p>
                </div>
              )}
            </div>

            <div className="selected-panel">
              <h3>
                <LuUserCheck className="section-icon" />
                Petugas Terpilih ({selectedPetugas.length}/2)
              </h3>

              <div className="selected-list">
                {selectedPetugas.length > 0 ? (
                  selectedPetugas.map((petugas, index) => (
                    <div key={petugas.id} className="selected-item">
                      <div className="selected-number">{index + 1}</div>
                      <div className="selected-avatar">
                        {petugas.foto ? (
                          <img src={petugas.foto} alt={petugas.nama} />
                        ) : (
                          <div className="avatar-placeholder small">
                            {petugas.nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="selected-name">{petugas.nama}</div>
                      <button
                        className="remove-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPetugas(petugas);
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-selection">
                    <p>Belum ada petugas yang dipilih</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <LuAlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="continue-button"
              onClick={handleContinue}
              disabled={selectedPetugas.length === 0}
            >
              <span>Lanjutkan</span>
              <LuChevronRight className="button-icon" />
            </button>
          </div>
        </div>

        <div className="selection-footer">
          <p>© 2025 Petasan | ULP Selong. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        /* Reset dan base styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Halaman pemilihan petugas */
        .petugas-selection-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ef 100%);
          padding: 20px;
        }

        /* Container utama */
        .petugas-selection-container {
          width: 100%;
          max-width: 1000px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        /* Header dengan logo dan judul */
        .selection-header {
          padding: 30px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .selection-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(
            circle at 20% 30%,
            rgba(59, 130, 246, 0.3) 0%,
            transparent 50%
          );
          z-index: 0;
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .logo-icon {
          font-size: 28px;
          margin-right: 10px;
          color: #3b82f6;
        }

        .selection-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .selection-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .selection-header p {
          font-size: 0.95rem;
          opacity: 0.8;
          max-width: 400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Konten utama */
        .selection-content {
          padding: 30px;
          flex: 1;
        }

        /* Search box */
        .search-container {
          position: relative;
          margin-bottom: 24px;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 18px;
        }

        .search-input {
          width: 100%;
          padding: 14px 14px 14px 45px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background-color: white;
          font-size: 0.95rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
        }

        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          outline: none;
        }

        /* Panel pemilihan */
        .selection-panel {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 25px;
          margin-bottom: 24px;
        }

        /* Daftar petugas */
        .petugas-list,
        .selected-panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
          padding: 20px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }

        .petugas-list h3,
        .selected-panel h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
        }

        .section-icon {
          margin-right: 8px;
          color: #3b82f6;
        }

        .petugas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 10px;
        }

        .petugas-grid::-webkit-scrollbar {
          width: 6px;
        }

        .petugas-grid::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .petugas-grid::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .petugas-grid::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Card petugas */
        .petugas-card {
          padding: 15px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .petugas-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .petugas-card.selected {
          background: rgba(59, 130, 246, 0.05);
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }

        .avatar-container {
          position: relative;
          width: 50px;
          height: 50px;
          margin-right: 15px;
          flex-shrink: 0;
        }

        .avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .avatar-placeholder.small {
          width: 36px;
          height: 36px;
          font-size: 1rem;
        }

        .selected-indicator {
          position: absolute;
          bottom: -3px;
          right: -3px;
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          border: 2px solid white;
          animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .petugas-details {
          flex: 1;
          overflow: hidden;
        }

        .petugas-details h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .petugas-details p {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Panel petugas terpilih */
        .selected-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .selected-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          animation: slideIn 0.3s ease-out;
        }

        .selected-number {
          width: 22px;
          height: 22px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          margin-right: 10px;
        }

        .selected-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 10px;
        }

        .selected-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .selected-name {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .remove-button {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          opacity: 0.8;
          transition: all 0.2s;
        }

        .remove-button:hover {
          opacity: 1;
          background: rgba(239, 68, 68, 0.1);
        }

        /* Empty states */
        .empty-state,
        .empty-selection,
        .loading-state {
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px dashed #e2e8f0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s linear infinite;
        }

        /* Pesan error */
        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #b91c1c;
          font-size: 0.9rem;
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .error-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        /* Tombol aksi */
        .action-buttons {
          display: flex;
          justify-content: center;
        }

        .continue-button {
          padding: 14px 30px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }

        .continue-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 10px -1px rgba(37, 99, 235, 0.3);
        }

        .continue-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px -1px rgba(37, 99, 235, 0.2);
        }

        .continue-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .button-icon {
          font-size: 18px;
        }

        /* Footer */
        .selection-footer {
          padding: 16px;
          text-align: center;
          color: #94a3b8;
          font-size: 0.75rem;
          border-top: 1px solid #f1f5f9;
          background: rgba(255, 255, 255, 0.5);
        }

        /* Animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0);
          }
          70% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .selection-panel {
            grid-template-columns: 1fr;
          }

          .petugas-grid {
            max-height: 300px;
          }

          .selected-list {
            max-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default PetugasSelection;
