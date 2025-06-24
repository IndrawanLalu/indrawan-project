import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { fetchSheetData } from "@/utils/googleSheetsData";
import {
  parseIndonesianDate,
  validateGangguanItem,
} from "@/hooks/useGangguanData";

export const useTop10Gangguan = (options = {}) => {
  const {
    startDate,
    endDate,
    sheetName = "gangguanPenyulang",
    range = "A:S",
    filterByUnit = true,
    top = 10,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
  } = options;

  const userLogin = useSelector((state) => state.auth.user);
  const userUnit = userLogin ? userLogin.unit : null;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch and process data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rawData = await fetchSheetData(sheetName, range);

      if (!Array.isArray(rawData)) {
        throw new Error("Data yang diterima tidak valid");
      }

      // Check if first row is header
      const firstRow = rawData[0];
      const isFirstRowHeader =
        firstRow &&
        typeof firstRow.ulp === "string" &&
        (firstRow.ulp.toLowerCase().includes("ulp") ||
          firstRow.ulp.toLowerCase().includes("unit"));

      const dataRows = isFirstRowHeader ? rawData.slice(1) : rawData;

      // Filter and validate data
      let filteredData = dataRows.filter((item) => {
        // Basic validation
        if (!validateGangguanItem(item, filterByUnit ? userUnit : null)) {
          return false;
        }

        // Date range filtering
        if (startDate && endDate) {
          const itemDate = parseIndonesianDate(item.tanggal);
          if (!itemDate) return false;
          return itemDate >= startDate && itemDate <= endDate;
        }

        return true;
      });

      // Count gangguan by penyulang
      const gangguanCounts = {};
      filteredData.forEach((item) => {
        const penyulang =
          item.penyulang || item.namaPenyulang || "Tidak Diketahui";
        if (penyulang && penyulang.toString().trim() !== "") {
          const penyulangName = penyulang.toString().trim();
          gangguanCounts[penyulangName] =
            (gangguanCounts[penyulangName] || 0) + 1;
        }
      });

      // Sort and get top N
      const sortedData = Object.entries(gangguanCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, top);

      setData(sortedData);
      setLastFetch(new Date());
    } catch (error) {
      console.error("Error fetching top gangguan data:", error);
      setError(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [sheetName, range, startDate, endDate, filterByUnit, userUnit, top]);

  // Initial fetch and dependency updates
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Computed values
  const processedData = useMemo(() => {
    const totalGangguan = data.reduce((sum, [, count]) => sum + count, 0);
    const avgGangguan =
      data.length > 0 ? (totalGangguan / data.length).toFixed(1) : 0;
    const topPenyulang = data.length > 0 ? data[0] : null;

    return {
      gangguanTerbanyak: data,
      totalGangguan,
      avgGangguan,
      topPenyulang,
      totalPenyulang: data.length,
    };
  }, [data]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...processedData,
    loading,
    error,
    lastFetch,
    refresh,
    userUnit,
  };
};
