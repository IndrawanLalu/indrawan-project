import { Link } from "react-router-dom";

const Unauthorrized = () => {
  return (
    <div className="flex flex-col justify-center w-full h-screen items-center">
      <div className="text-2xl font-semibold border-b border-main">
        401 | Unauthorized
      </div>
      <div>
        Atau{" "}
        <span className="text-blue-500">
          {" "}
          <Link to="/login">Login</Link>
        </span>{" "}
        untuk melanjutkan{" "}
      </div>
    </div>
  );
};

export default Unauthorrized;
