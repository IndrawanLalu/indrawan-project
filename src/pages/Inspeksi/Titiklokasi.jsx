import { useEffect, useState } from "react";
import {  Marker, Popup, useMap } from "react-leaflet";
import PropTypes from "prop-types";

function LocationMarker({ onLocationFound }) {
    const [position, setPosition] = useState(null);
    const map = useMap();
  
    // Mengambil lokasi secara otomatis saat komponen dimuat
    useEffect(() => {
      map.locate(); // Memulai pencarian lokasi pengguna
  
      map.on("locationfound", (e) => {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
        onLocationFound(e.latlng); // Mengirim data lokasi ke parent component
      });
  
      map.on("locationerror", (e) => {
        console.error("Location access denied.", e);
      });
    }, [map, onLocationFound]);
  
    return position === null ? null : (
      <Marker position={position}>
        <Popup>You are here</Popup>
      </Marker>
    );
  }
LocationMarker.propTypes = {
    onLocationFound: PropTypes.func.isRequired, // Menandai bahwa onLocationFound adalah fungsi dan wajib diisi
  };

export default LocationMarker;
