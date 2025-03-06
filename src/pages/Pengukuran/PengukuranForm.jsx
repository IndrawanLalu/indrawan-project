import { useState } from "react";
import { tambahPengukuran } from "./pengukuranService";
import PropTypes from "prop-types";

const PengukuranForm = ({ gardu }) => {
  const [data, setData] = useState({
    R_A: "",
    S_A: "",
    T_A: "",
    N_A: "",
    R_B: "",
    S_B: "",
    T_B: "",
    N_B: "",
    R_C: "",
    S_C: "",
    T_C: "",
    N_C: "",
    R_D: "",
    S_D: "",
    T_D: "",
    N_D: "",
    R_K: "",
    S_K: "",
    T_K: "",
    N_K: "",
    r_n: "",
    s_n: "",
    t_n: "",
    r_s: "",
    r_t: "",
    s_t: "",
    rTotal: "",
    sTotal: "",
    tTotal: "",
    nTotal: "",
    tglUkur: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await tambahPengukuran(gardu, data);
    alert(response);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Input Pengukuran Gardu: {gardu.nama}</h2>
      <p>Alamat: {gardu.alamat}</p>
      <p>
        Titik:{" "}
        <a href={gardu.Titik} target="_blank">
          Lihat Lokasi
        </a>
      </p>
      <p>KVA: {gardu.kva}</p>

      <input
        type="number"
        name="rTotal"
        placeholder="R Total"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="sTotal"
        placeholder="S Total"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="tTotal"
        placeholder="T Total"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="nTotal"
        placeholder="N Total"
        onChange={handleChange}
        required
      />

      <input type="date" name="tglUkur" onChange={handleChange} required />

      <button type="submit">Tambah Pengukuran</button>
    </form>
  );
};

PengukuranForm.propTypes = {
  gardu: PropTypes.shape({
    nama: PropTypes.string.isRequired,
    alamat: PropTypes.string.isRequired,
    Titik: PropTypes.string.isRequired,
    kva: PropTypes.number.isRequired,
  }).isRequired,
};

export default PengukuranForm;
