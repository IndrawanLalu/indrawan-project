import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import SidebarLayout from "@/components/admin/SidebarLayout";

const allowedServicesForYantek = ["/pengukuran-form", "/"];

const Layouts = ({ children }) => {
  const user = useSelector((state) => state.auth.user); // Mengambil user dari Redux

  return (
    <div className="flex min-h-screen">
      {/* Sidebar dan Konten Utama */}
      <SidebarLayout pengguna={user} ruteDisetujui={allowedServicesForYantek}>
        {/* Main Content and Footer */}
        <div className="flex flex-col w-full min-h-screen">
          {/* Main Content */}
          <main className="flex-grow  bg-[#bec3bf1c]">{children}</main>

          {/* Footer */}
          <footer className="p-4 text-center text-white bg-main/50">
            <p>&copy; 2025 SIEKAS</p>
          </footer>
        </div>
      </SidebarLayout>
    </div>
  );
};

Layouts.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layouts;
