// 📁 hooks/useGangguanData.js
// Pure JavaScript hooks tanpa JSX

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { fetchSheetData } from "@/utils/googleSheetsData";

// Month mapping constant
export const MONTH_MAP = {
  Januari: 0,
  Februari: 1,
  Maret: 2,
  April: 3,
  Mei: 4,
  Juni: 5,
  Juli: 6,
  Agustus: 7,
  September: 8,
  Oktober: 9,
  November: 10,
  Desember: 11,
};

// Date parsing utility
export const parseIndonesianDate = (dateString) => {
  if (!dateString || typeof dateString !== "string") return null;

  const parts = dateString.trim().split(" ");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0]);
  const monthName = parts[1];
  const year = parseInt(parts[2]);

  const month = MONTH_MAP[monthName];

  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  if (day < 1 || day > 31 || year < 1900 || year > 2100) return null;

  return new Date(year, month, day);
};

// Data validation utility
export const validateGangguanItem = (item, userUnit) => {
  // Basic item validation
  if (!item || typeof item !== "object") return false;

  // Unit validation (optional)
  if (userUnit && item.ulp) {
    if (typeof item.ulp !== "string") return false;
    const isUnitMatch =
      item.ulp.trim().toUpperCase() === userUnit.toUpperCase();
    if (!isUnitMatch) return false;
  }

  // Date validation
  const itemDate = parseIndonesianDate(item.tanggal);
  if (!itemDate) return false;

  return true;
};

// Filter data by date range
export const filterByDateRange = (items, startDate, endDate) => {
  if (!Array.isArray(items) || !startDate || !endDate) return [];

  return items.filter((item) => {
    const itemDate = parseIndonesianDate(item.tanggal);
    if (!itemDate) return false;
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// Custom hook for gangguan data
export const useGangguanData = (options = {}) => {
  const {
    startDate,
    endDate,
    sheetName = "gangguanPenyulang",
    range = "A:S",
    filterByUnit = true,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
  } = options;

  const userLogin = useSelector((state) => state.auth.user);
  const userUnit = userLogin ? userLogin.unit : null;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rawData = await fetchSheetData(sheetName, range);

      if (!Array.isArray(rawData)) {
        throw new Error("Data yang diterima tidak valid");
      }

      // Filter and validate data
      let filteredData = rawData;

      // Check if first row is header
      const firstRow = rawData[0];
      const isFirstRowHeader =
        firstRow &&
        typeof firstRow.ulp === "string" &&
        (firstRow.ulp.toLowerCase().includes("ulp") ||
          firstRow.ulp.toLowerCase().includes("unit"));

      if (isFirstRowHeader) {
        filteredData = rawData.slice(1);
      }

      // Filter by unit if required
      if (filterByUnit && userUnit) {
        filteredData = filteredData.filter((item) =>
          validateGangguanItem(item, userUnit)
        );
      } else {
        filteredData = filteredData.filter((item) =>
          validateGangguanItem(item, null)
        );
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        filteredData = filterByDateRange(filteredData, startDate, endDate);
      }

      setData(filteredData);
      setLastFetch(new Date());
    } catch (error) {
      console.error("Error fetching gangguan data:", error);
      setError(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [sheetName, range, startDate, endDate, filterByUnit, userUnit]);

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
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const monthlyData = {
      currentYear: Array(12).fill(0),
      previousYear: Array(12).fill(0),
      total: data.length,
    };

    data.forEach((item) => {
      const itemDate = parseIndonesianDate(item.tanggal);
      if (!itemDate) return;

      const month = itemDate.getMonth();
      const year = itemDate.getFullYear();

      if (year === currentYear) {
        monthlyData.currentYear[month] += 1;
      } else if (year === previousYear) {
        monthlyData.previousYear[month] += 1;
      }
    });

    monthlyData.totalCurrentYear = monthlyData.currentYear.reduce(
      (sum, val) => sum + val,
      0
    );
    monthlyData.totalPreviousYear = monthlyData.previousYear.reduce(
      (sum, val) => sum + val,
      0
    );

    // Calculate percentage change
    if (monthlyData.totalPreviousYear === 0) {
      monthlyData.percentageChange = monthlyData.totalCurrentYear > 0 ? 100 : 0;
    } else {
      monthlyData.percentageChange =
        ((monthlyData.totalCurrentYear - monthlyData.totalPreviousYear) /
          monthlyData.totalPreviousYear) *
        100;
    }

    return monthlyData;
  }, [data]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    processedData,
    loading,
    error,
    lastFetch,
    refresh,
    userUnit,
  };
};

// Custom hook for animation
export const useCounterAnimation = (target, duration = 2000) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  const animate = useCallback(
    (newTarget) => {
      let start = 0;
      const startTime = Date.now();

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (newTarget - start) * easeOutQuart);
        setAnimatedValue(current);
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };
      requestAnimationFrame(updateCounter);
    },
    [duration]
  );

  useEffect(() => {
    animate(target);
  }, [target, animate]);

  return animatedValue;
};

// Performance monitoring utility
export const performanceMonitor = {
  mark: (name) => {
    if (performance && performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name, startMark, endMark) => {
    if (performance && performance.measure) {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      if (entries.length > 0) {
        console.log(`${name}: ${entries[0].duration.toFixed(2)}ms`);
      }
    }
  },

  clearMarks: () => {
    if (performance && performance.clearMarks) {
      performance.clearMarks();
    }
  },
};

// Cache utility for API responses
class DataCache {
  constructor(maxAge = 300000) {
    // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const dataCache = new DataCache();

// Debounce utility
export const useDebounce = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = useState(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
};

// Local storage hook with error handling
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};
