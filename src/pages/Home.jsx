import { Link } from "react-router-dom";

// import { useSelector } from "react-redux";
const transactions = [
  {
    id: 1,
    name: "Gangguan Penyulang",
    desc: "Gangguan Bulan Ini",
    amount: "14 Kali",
    color: "text-red-500",
  },
  {
    id: 2,
    name: "Pemadaman",
    desc: "Pemadaman Hari ini",
    amount: "Masbagik",
    color: "text-green-500",
  },
  {
    id: 3,
    name: "Temuan",
    desc: "Total Temuan Hari ini",
    amount: "5 Titik",
    color: "text-blue-500",
  },
];

const services = [
  { id: 1, name: "Beban Gardu", icon: "🏠", link: "/amg" },
  { id: 2, name: "Temuan Inspeksi", icon: "🎯", link: "/inspeksi" },
  { id: 3, name: "Gangguan Penyulang", icon: "⚡", link: "#" },
  { id: 4, name: "Topup", icon: "📥", link: "#" },
];
const Home = () => {
  // const user = useSelector ((state) => state.auth.user);
  return (
    <div className="p-4 max-w-sm mx-auto bg-main/2 min-h-screen md:max-w-3xl">
      {/* Profile Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img
            src="/petasan.webp"
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <p className="text-gray-500">Hello</p>
            <p className="text-lg font-semibold">Inspektor</p>
          </div>
        </div>
        <button className="text-gray-500">🔍</button>
      </div>

      {/* Balance Card */}
      <div className="bg-main text-white p-4 rounded-xl shadow-md relative">
        <p className="text-sm font-bold">PETASAN</p>
        <p className="text-lg ">PENGECEKAN TUNTAS SATU BULAN</p>
        <div className="flex justify-between mt-2">
          <p className="text-sm">Inspektor</p>
          <p className="text-sm">ULP Selong</p>
        </div>
      </div>

      {/* Services Section */}
      <div className="mt-6">
        <p className="text-lg font-semibold">Menu</p>
        <div className="grid grid-cols-4 gap-4 mt-2">
          {services.map((service) => (
            <Link to={service.link} key={service.id}>
              <div
                key={service.id}
                className="flex flex-col items-center p-3 bg-white rounded-xl shadow-md hover:bg-gray-100 cursor-pointer transition-transform transform hover:scale-110"
              >
                <span className="text-2xl">{service.icon}</span>
                <p className="text-sm mt-1">{service.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <p className="text-lg font-semibold">Informasi </p>
        <div className="mt-2 space-y-2">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md"
            >
              <div>
                <p className="font-semibold">{txn.name}</p>
                <p className="text-gray-500 text-sm">{txn.desc}</p>
              </div>
              <p className={`font-semibold ${txn.color}`}>{txn.amount}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Floating Action Button */}
      <Link to="/tambahTemuan">
        <button className="fixed bottom-6 right-6 bg-main text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110">
          ➕
        </button>
      </Link>
    </div>
  );
};
export default Home;
