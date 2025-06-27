// components/ui/MapComponent.jsx (Alternative Version)
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PropTypes from "prop-types";

// Create custom icon using CSS/SVG instead of importing PNG files
const createCustomIcon = (color = "#3b82f6") => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [25, 25],
    iconAnchor: [12, 24],
  });
};

// Risk level colors
const getRiskColor = (riskLevel) => {
  const colors = {
    Rendah: "#10b981", // green
    Sedang: "#f59e0b", // yellow
    Tinggi: "#f97316", // orange
    "Sangat Tinggi": "#ef4444", // red
  };
  return colors[riskLevel] || "#6b7280"; // default gray
};

const MapComponent = ({
  center,
  zoom = 15,
  height = "500px",
  markers = [],
  className = "",
  scrollWheelZoom = false,
}) => {
  return (
    <div
      className={`rounded-lg overflow-hidden border border-white/20 ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker, index) => {
          // Determine icon color based on risk level if available
          const riskLevel = marker.data?.tingkatRisiko;
          const iconColor = riskLevel ? getRiskColor(riskLevel) : "#3b82f6";

          return (
            <Marker
              key={index}
              position={marker.position}
              icon={createCustomIcon(iconColor)}
            >
              <Popup maxWidth={300}>
                <div className="space-y-2 p-2">
                  <h3 className="font-semibold text-sm">{marker.title}</h3>
                  <p className="text-xs text-gray-600">{marker.description}</p>

                  {marker.data && (
                    <div className="space-y-1 text-xs">
                      {marker.data.tingkatRisiko && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Risiko:</span>
                          <span
                            className="px-2 py-1 rounded text-white text-xs"
                            style={{
                              backgroundColor: getRiskColor(
                                marker.data.tingkatRisiko
                              ),
                            }}
                          >
                            {marker.data.tingkatRisiko}
                          </span>
                        </div>
                      )}
                      {marker.data.tinggiPohon && (
                        <div>
                          <span className="font-medium">Tinggi:</span>{" "}
                          {marker.data.tinggiPohon}m
                        </div>
                      )}
                      {marker.data.jarakKeJaringan && (
                        <div>
                          <span className="font-medium">Jarak:</span>{" "}
                          {marker.data.jarakKeJaringan}m
                        </div>
                      )}
                      {marker.data.petugas && (
                        <div>
                          <span className="font-medium">Petugas:</span>{" "}
                          {marker.data.petugas}
                        </div>
                      )}
                    </div>
                  )}

                  {marker.image && (
                    <img
                      src={marker.image}
                      alt={marker.title}
                      className="w-full h-24 object-cover rounded mt-2"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
MapComponent.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number,
  height: PropTypes.string,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.arrayOf(PropTypes.number).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      data: PropTypes.object,
      image: PropTypes.string,
    })
  ),
  className: PropTypes.string,
  scrollWheelZoom: PropTypes.bool,
};

export { MapComponent };
