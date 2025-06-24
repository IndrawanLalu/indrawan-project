// 📁 hooks/index.js
// Export semua hooks untuk import yang lebih mudah

export {
  useGangguanData,
  useCounterAnimation,
  useDebounce,
  useLocalStorage,
  parseIndonesianDate,
  validateGangguanItem,
  filterByDateRange,
  MONTH_MAP,
  performanceMonitor,
  dataCache,
} from "./useGangguanData";

// Import error boundary dari component terpisah
export { withErrorBoundary, ErrorBoundary } from "../components/ErrorBoundary";
