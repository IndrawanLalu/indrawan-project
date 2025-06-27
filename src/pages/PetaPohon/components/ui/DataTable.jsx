// components/ui/DataTable.jsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import PropTypes from "prop-types";

const DataTable = ({
  data = [],
  columns = [],
  title = "Data Table",
  searchable = true,
  filterable = false,
  actions = [],
  onRowClick,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      })
    );
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Temuan: "destructive",
      "Dalam Proses": "default",
      Selesai: "success",
      Pending: "secondary",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <Card
      className={`bg-white/10 backdrop-blur-lg border border-white/20 ${className}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
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
            {filterable && (
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            )}
          </div>
        </CardTitle>
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
                      {column.label}
                      {column.sortable && sortField === column.key && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
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
                  {actions.length > 0 && (
                    <td className="p-3">
                      <div className="flex gap-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            size="sm"
                            variant={action.variant || "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                          >
                            {action.icon && <action.icon className="w-4 h-4" />}
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
DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
      type: PropTypes.oneOf(["text", "image", "date"]),
    })
  ).isRequired,
  title: PropTypes.string,
  searchable: PropTypes.bool,
  filterable: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      variant: PropTypes.string,
      onClick: PropTypes.func.isRequired,
    })
  ),
  onRowClick: PropTypes.func,
  className: PropTypes.string,
};

export { DataTable };
