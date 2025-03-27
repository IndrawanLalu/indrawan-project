import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TrendChart = ({ measurements, type = "beban" }) => {
  // Memproses data pengukuran untuk grafik
  const chartData = useMemo(() => {
    // Urutkan berdasarkan tanggal (terlama ke terbaru)
    return [...measurements]
      .sort((a, b) => {
        // Sort by date and time
        if (a.tanggalUkur !== b.tanggalUkur) {
          return a.tanggalUkur.localeCompare(b.tanggalUkur);
        }
        return a.jamUkur.localeCompare(b.jamUkur);
      })
      .map((measurement) => {
        // Format data untuk chart
        return {
          tanggal: `${measurement.tanggalUkur} ${measurement.jamUkur}`,
          bebanKva: parseFloat(measurement.bebanKva || 0).toFixed(2),
          persenKva: parseFloat(measurement.persenKva || 0).toFixed(2),
          unbalance: parseFloat(measurement.unbalance || 0).toFixed(2),
          R: measurement.R || 0,
          S: measurement.S || 0,
          T: measurement.T || 0,
          N: measurement.N || 0,
        };
      });
  }, [measurements]);

  // Definisi chart berdasarkan tipe
  const getChartConfig = () => {
    switch (type) {
      case "beban":
        return {
          title: "Trend Beban KVA",
          lines: [
            { dataKey: "bebanKva", stroke: "#8884d8", name: "Beban KVA" },
            {
              dataKey: "persenKva",
              stroke: "#82ca9d",
              name: "Persen Beban (%)",
            },
          ],
        };
      case "unbalance":
        return {
          title: "Trend Unbalance (%)",
          lines: [
            { dataKey: "unbalance", stroke: "#ff7300", name: "Unbalance (%)" },
          ],
        };
      case "phase":
        return {
          title: "Trend Arus per Phase (A)",
          lines: [
            { dataKey: "R", stroke: "#ff0000", name: "R" },
            { dataKey: "S", stroke: "#ffc658", name: "S" },
            { dataKey: "T", stroke: "#0088fe", name: "T" },
            { dataKey: "N", stroke: "#999999", name: "N" },
          ],
        };
      default:
        return {
          title: "Trend Data",
          lines: [
            { dataKey: "bebanKva", stroke: "#8884d8", name: "Beban KVA" },
          ],
        };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <>
      <h3 className="text-lg font-medium mb-2">{chartConfig.title}</h3>
      <div className="rounded-lg border p-1 bg-white" style={{ height: 300 }}>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="tanggal"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartConfig.lines.map((line, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  activeDot={{ r: 8 }}
                  name={line.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Minimal 2 pengukuran untuk menampilkan trend
          </div>
        )}
      </div>
    </>
  );
};

TrendChart.propTypes = {
  measurements: PropTypes.array.isRequired,
  type: PropTypes.string,
};

export default TrendChart;
