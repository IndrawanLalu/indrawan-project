// components/ui/EnhancedDataTable.jsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { getTreePrediction } from "@/utils/treePrediction";
import PropTypes from "prop-types";

const EnhancedDataTable = ({
  data = [],
  columns = [],
  title = "Data Table",
  searchable = true,
  actions = [],
  onRowClick,
  className = "",
  showPrediction = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterLevel, setFilterLevel] = useState("all");

  // Process data dengan prediksi UPDATED
  const processedData = useMemo(() => {
    return data.map((row) => {
      if (showPrediction) {
        const prediction = getTreePrediction(row);
        return {
          ...row,
          prediction,
        };
      }
      return row;
    });
  }, [data, showPrediction]);

  // Filter data berdasarkan search dan filter level UPDATED
  const filteredData = useMemo(() => {
    let filtered = processedData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = row[column.key];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        })
      );
    }

    // Warning level filter UPDATED dengan threshold baru
    if (filterLevel !== "all" && showPrediction) {
      filtered = filtered.filter((row) => {
        if (!row.prediction) return true;

        switch (filterLevel) {
          case "sangat_berbahaya":
            return row.prediction.isCritical; // < 1 hari
          case "waspada":
            return row.prediction.isUrgent; // < 5 hari
          case "perhatian":
            return row.prediction.sisaHari >= 5 && row.prediction.sisaHari <= 7;
          case "monitoring":
            return row.prediction.sisaHari > 7 && row.prediction.sisaHari <= 30;
          case "aman":
            return row.prediction.warningLevel.level === "AMAN";
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [processedData, searchTerm, filterLevel, columns, showPrediction]);

  // Sort data UPDATED
  const sortedData = useMemo(() => {
    if (!sortField) {
      // Default sort by prediction priority if showing predictions
      if (showPrediction) {
        return [...filteredData].sort((a, b) => {
          if (a.prediction && b.prediction) {
            // Sort by priority first
            if (
              b.prediction.warningLevel.priority !==
              a.prediction.warningLevel.priority
            ) {
              return (
                b.prediction.warningLevel.priority -
                a.prediction.warningLevel.priority
              );
            }
            // Then by remaining days
            return a.prediction.sisaHari - b.prediction.sisaHari;
          }
          return 0;
        });
      }
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle prediction sorting
      if (sortField === "prediction") {
        aVal = a.prediction?.sisaHari || 999999;
        bVal = b.prediction?.sisaHari || 999999;
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredData, sortField, sortDirection, showPrediction]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Statistics untuk prediction UPDATED
  const predictionStats = useMemo(() => {
    if (!showPrediction) return null;

    const stats = {
      total: processedData.length,
      sangat_berbahaya: 0,
      waspada: 0,
      perhatian: 0,
      monitoring: 0,
      aman: 0,
    };

    processedData.forEach((row) => {
      if (row.prediction) {
        const level = row.prediction.warningLevel.level;
        switch (level) {
          case "SANGAT_BERBAHAYA":
            stats.sangat_berbahaya++;
            break;
          case "WASPADA":
            stats.waspada++;
            break;
          case "PERHATIAN":
            stats.perhatian++;
            break;
          case "MONITORING":
            stats.monitoring++;
            break;
          case "AMAN":
            stats.aman++;
            break;
        }
      }
    });

    return stats;
  }, [processedData, showPrediction]);

  const getStatusBadge = (status) => {
    const variants = {
      Temuan: "destructive",
      "Dalam Proses": "default",
      Selesai: "success",
      Pending: "secondary",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const renderPredictionCell = (prediction) => {
    if (!prediction) return <span className="text-gray-400">-</span>;

    const { warningLevel, displayFormat } = prediction;

    return (
      <div className="space-y-1">
        <div
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${warningLevel.color} ${warningLevel.textColor}`}
        >
          {displayFormat.text}
        </div>
        <div className="text-xs text-gray-500">{displayFormat.subtext}</div>
      </div>
    );
  };

  return (
    <Card
      className={`bg-white/10 backdrop-blur-lg border border-white/20 ${className}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {showPrediction && <TrendingUp className="w-5 h-5" />}
            {title}
          </span>
          <div className="flex gap-2">
            {searchable && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}

            {showPrediction && (
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="sangat_berbahaya">
                  🚨 Sangat Berbahaya (&lt;1 hari)
                </option>
                <option value="waspada">⚠️ Waspada (&lt;5 hari)</option>
                <option value="perhatian">🔔 Perhatian (5-7 hari)</option>
                <option value="monitoring">📊 Monitoring (7-30 hari)</option>
                <option value="aman">✅ Aman (&gt;30 hari)</option>
              </select>
            )}
          </div>
        </CardTitle>

        {/* Prediction Statistics UPDATED */}
        {showPrediction && predictionStats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-100 rounded-lg">
              <div className="text-lg font-bold">{predictionStats.total}</div>
              <div className="text-xs text-gray-600">Total Pohon</div>
            </div>
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <div className="text-lg font-bold text-red-700">
                {predictionStats.sangat_berbahaya}
              </div>
              <div className="text-xs text-red-700">Sangat Berbahaya</div>
            </div>
            <div className="text-center p-3 bg-orange-100 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {predictionStats.waspada}
              </div>
              <div className="text-xs text-orange-600">Waspada</div>
            </div>
            <div className="text-center p-3 bg-yellow-100 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {predictionStats.perhatian}
              </div>
              <div className="text-xs text-yellow-600">Perhatian</div>
            </div>
            <div className="text-center p-3 bg-blue-100 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {predictionStats.monitoring}
              </div>
              <div className="text-xs text-blue-600">Monitoring</div>
            </div>
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {predictionStats.aman}
              </div>
              <div className="text-xs text-green-600">Aman</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`p-3 text-left font-semibold ${
                      column.sortable ? "cursor-pointer hover:bg-white/5" : ""
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.icon && <column.icon className="w-4 h-4" />}
                      {column.label}
                      {column.sortable && sortField === column.key && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}

                {/* NEW: Prediksi Inspektur Column */}
                {showPrediction && (
                  <th className="p-3 text-left font-semibold">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Prediksi Inspektur
                    </div>
                  </th>
                )}

                {/* Prediction Column */}
                {showPrediction && (
                  <th
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort("prediction")}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Status Saat Ini
                      {sortField === "prediction" && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                )}

                {actions.length > 0 && (
                  <th className="p-3 text-left font-semibold">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-white/10 hover:bg-white/5 ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${
                    row.prediction?.isCritical
                      ? "bg-red-50/30"
                      : row.prediction?.isUrgent
                      ? "bg-orange-50/30"
                      : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="p-3">
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : column.key === "status" ? (
                        getStatusBadge(row[column.key])
                      ) : column.type === "image" ? (
                        row[column.key] ? (
                          <img
                            src={row[column.key]}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                            No Image
                          </div>
                        )
                      ) : column.type === "date" ? (
                        new Date(row[column.key]).toLocaleDateString("id-ID")
                      ) : (
                        String(row[column.key] || "-")
                      )}
                    </td>
                  ))}

                  {/* NEW: Prediksi Inspektur Column */}
                  {showPrediction && (
                    <td className="p-3">
                      <span className="text-sm font-medium text-blue-600">
                        {row.prediksiInspektur || "-"}
                      </span>
                    </td>
                  )}

                  {/* Prediction Column */}
                  {showPrediction && (
                    <td className="p-3">
                      {renderPredictionCell(row.prediction)}
                    </td>
                  )}

                  {actions.length > 0 && (
                    <td className="p-3">
                      <div className="flex gap-2">
                        {actions
                          .filter((action) => !action.show || action.show(row))
                          .map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              size="sm"
                              variant={action.variant || "outline"}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                            >
                              {action.icon && (
                                <action.icon className="w-4 h-4" />
                              )}
                              {action.label && (
                                <span className="ml-1">{action.label}</span>
                              )}
                            </Button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {sortedData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "Tidak ada data yang sesuai dengan pencarian"
                : "Tidak ada data"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
EnhancedDataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  title: PropTypes.string,
  searchable: PropTypes.bool,
  filterable: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      show: PropTypes.func,
    })
  ),
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  showPrediction: PropTypes.bool,
};

export { EnhancedDataTable };
