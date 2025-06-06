import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
  MapPin,
  Clock,
  Hash,
  Download,
  Calendar,
  Target,
  Activity,
  Database,
  RefreshCw,
  Eye,
  ArrowRight,
  Percent,
  Loader2,
  AlertCircle,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Layouts from "@/pages/admin/Layouts";

const ParetoGangguanAnalysis = () => {
  // State management
  const [activeTab, setActiveTab] = useState("penyebab");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
    end: new Date(),
  });
  const [selectedPenyulang, setSelectedPenyulang] = useState("all");
  const [paretoThreshold, setParetoThreshold] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gangguanData, setGangguanData] = useState([]);
  const [penyulangList, setPenyulangList] = useState([]);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch gangguan data
        const gangguanQuery = query(
          collection(db, "gangguanPenyulang"),
          orderBy("tanggalGangguan", "desc")
        );
        const gangguanSnapshot = await getDocs(gangguanQuery);
        const gangguanData = gangguanSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch penyulang list
        const penyulangQuery = query(collection(db, "penyulang"));
        const penyulangSnapshot = await getDocs(penyulangQuery);
        const penyulangData = penyulangSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setGangguanData(gangguanData);
        setPenyulangList(penyulangData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError("Gagal memuat data. Silakan coba lagi.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to convert duration string to minutes
  const durationToMinutes = (duration) => {
    if (!duration || typeof duration !== "string") return 0;
    const parts = duration.split(":");
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  // Filter data based on date range and penyulang
  const filteredData = useMemo(() => {
    return gangguanData.filter((item) => {
      // Date filtering
      const itemDate = new Date(item.tanggalGangguan);
      const isInDateRange =
        itemDate >= dateRange.start && itemDate <= dateRange.end;

      // Penyulang filtering
      const isPenyulangMatch =
        selectedPenyulang === "all" || item.penyulang === selectedPenyulang;

      return isInDateRange && isPenyulangMatch;
    });
  }, [gangguanData, dateRange, selectedPenyulang]);

  // Calculate Pareto data based on active tab
  const calculateParetoData = useMemo(() => {
    if (!filteredData.length) return [];

    const groupData = (groupBy) => {
      const grouped = {};

      filteredData.forEach((item) => {
        const key = item[groupBy] || "Unknown";
        if (!grouped[key]) {
          grouped[key] = {
            name: key,
            count: 0,
            totalDuration: 0,
            incidents: [],
          };
        }
        grouped[key].count += 1;
        grouped[key].totalDuration += durationToMinutes(item.durasi);
        grouped[key].incidents.push(item);
      });

      // Sort by count and calculate cumulative percentage
      const sortedData = Object.values(grouped).sort(
        (a, b) => b.count - a.count
      );

      const totalCount = sortedData.reduce((sum, item) => sum + item.count, 0);
      if (totalCount === 0) return [];

      let cumulativeCount = 0;

      return sortedData.map((item) => {
        cumulativeCount += item.count;
        const percentage = (item.count / totalCount) * 100;
        const cumulativePercentage = (cumulativeCount / totalCount) * 100;

        return {
          ...item,
          percentage: Math.round(percentage * 10) / 10,
          cumulativePercentage: Math.round(cumulativePercentage * 10) / 10,
          avgDuration:
            item.count > 0 ? Math.round(item.totalDuration / item.count) : 0,
          isAboveThreshold: cumulativePercentage <= paretoThreshold,
        };
      });
    };

    switch (activeTab) {
      case "penyebab":
        return groupData("penyebab");
      case "penyulang":
        return groupData("penyulang");
      case "kode":
        return groupData("kodeGangguan");
      default:
        return groupData("penyebab");
    }
  }, [filteredData, activeTab, paretoThreshold]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalIncidents: 0,
        totalDuration: 0,
        avgDuration: 0,
        topCausesCount: 0,
        topCausesPercentage: 0,
        paretoEfficiency: 0,
      };
    }

    const totalIncidents = filteredData.length;
    const totalDuration = filteredData.reduce(
      (sum, item) => sum + durationToMinutes(item.durasi),
      0
    );
    const avgDuration =
      totalDuration > 0 ? Math.round(totalDuration / totalIncidents) : 0;

    const topCauses = calculateParetoData.filter(
      (item) => item.isAboveThreshold
    );
    const topCausesPercentage = topCauses.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    return {
      totalIncidents,
      totalDuration: Math.round((totalDuration / 60) * 10) / 10, // Convert to hours
      avgDuration,
      topCausesCount: topCauses.length,
      topCausesPercentage: Math.round(topCausesPercentage * 10) / 10,
      paretoEfficiency:
        calculateParetoData.length > 0
          ? Math.round((topCauses.length / calculateParetoData.length) * 100)
          : 0,
    };
  }, [calculateParetoData, filteredData]);

  // Refresh data function
  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const gangguanQuery = query(
        collection(db, "gangguanPenyulang"),
        orderBy("tanggalGangguan", "desc")
      );
      const gangguanSnapshot = await getDocs(gangguanQuery);
      const gangguanData = gangguanSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGangguanData(gangguanData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error refreshing data: ", error);
      setError("Gagal memuat ulang data. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  // Chart colors
  const colors = [
    "#f97316",
    "#ea580c",
    "#dc2626",
    "#b91c1c",
    "#991b1b",
    "#7f1d1d",
    "#fbbf24",
    "#f59e0b",
  ];

  const tabs = [
    { id: "penyebab", label: "Penyebab", icon: AlertTriangle },
    { id: "penyulang", label: "Penyulang", icon: MapPin },
    { id: "kode", label: "Kode Gangguan", icon: Hash },
  ];

  return (
    <Layouts>
      <div className="relative min-h-screen bg-gradient-to-br from-backgroundFrom via-backgroundFrom to-backgroundTo">
        {/* Global DatePicker Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .react-datepicker-popper {
              z-index: 9999 !important;
            }
            .react-datepicker {
              background-color: rgba(15, 23, 42, 0.95) !important;
              backdrop-filter: blur(10px) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 8px !important;
              color: white !important;
            }
            .react-datepicker__header {
              background-color: rgba(255, 255, 255, 0.1) !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
              color: white !important;
            }
            .react-datepicker__current-month,
            .react-datepicker__day-name {
              color: white !important;
            }
            .react-datepicker__day {
              color: rgba(255, 255, 255, 0.8) !important;
            }
            .react-datepicker__day:hover {
              background-color: rgba(249, 115, 22, 0.3) !important;
              color: white !important;
            }
            .react-datepicker__day--selected {
              background-color: rgb(249, 115, 22) !important;
              color: white !important;
            }
            .react-datepicker__day--today {
              background-color: rgba(59, 130, 246, 0.3) !important;
              color: white !important;
            }
            .react-datepicker__navigation {
              border: none !important;
            }
            .react-datepicker__navigation--previous {
              border-right-color: rgba(255, 255, 255, 0.7) !important;
            }
            .react-datepicker__navigation--next {
              border-left-color: rgba(255, 255, 255, 0.7) !important;
            }
          `,
          }}
        />

        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
          </div>
        </div>

        <div className="relative z-10 p-6 space-y-6">
          {/* Loading State */}
          {isLoading && (
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                  <span className="text-white/80">Memuat data gangguan...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-red-300 font-semibold">
                      Error Loading Data
                    </h3>
                    <p className="text-red-200/80 text-sm">{error}</p>
                  </div>
                  <Button
                    onClick={refreshData}
                    className="ml-auto bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50"
                  >
                    Coba Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content - Only show when not loading and no error */}
          {!isLoading && !error && (
            <>
              {/* Header */}
              <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

                <CardHeader className="relative ">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                          Pareto Analysis
                        </h1>
                        <p className="text-white/60 text-sm flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>
                            80/20 Analysis - Identifikasi penyebab utama
                            gangguan
                          </span>
                          <span className="text-white/40">•</span>
                          <span>
                            {summaryStats.totalIncidents} total incidents
                          </span>
                          <span className="text-white/40">•</span>
                          <span>{filteredData.length} filtered</span>
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      {/* Date Range */}
                      <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                        <Calendar className="w-5 h-5 text-white/70" />
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col">
                            <label className="text-xs text-white/60 mb-1">
                              Start Date
                            </label>
                            <DatePicker
                              selected={dateRange.start}
                              onChange={(date) =>
                                setDateRange((prev) => ({
                                  ...prev,
                                  start: date,
                                }))
                              }
                              className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 relative"
                              dateFormat="dd/MM/yyyy"
                              popperClassName="z-[9999]"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-white/60 mb-1">
                              End Date
                            </label>
                            <DatePicker
                              selected={dateRange.end}
                              onChange={(date) =>
                                setDateRange((prev) => ({ ...prev, end: date }))
                              }
                              className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                              dateFormat="dd/MM/yyyy"
                              popperClassName="z-[9999]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Penyulang Filter */}
                      <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                        <MapPin className="w-5 h-5 text-white/70" />
                        <div className="flex flex-col">
                          <label className="text-xs text-white/60 mb-1">
                            Penyulang
                          </label>
                          <Select
                            value={selectedPenyulang}
                            onValueChange={setSelectedPenyulang}
                          >
                            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Semua Penyulang" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20">
                              <SelectItem
                                value="all"
                                className="text-white hover:bg-white/10"
                              >
                                Semua Penyulang
                              </SelectItem>
                              {penyulangList.map((item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.penyulang}
                                  className="text-white hover:bg-white/10"
                                >
                                  {item.penyulang}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-none">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          onClick={refreshData}
                          className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                          disabled={isLoading}
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${
                              isLoading ? "animate-spin" : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Empty State */}
              {filteredData.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <div className="p-4 rounded-full bg-white/10 w-16 h-16 mx-auto flex items-center justify-center">
                        <Database className="w-8 h-8 text-white/60" />
                      </div>
                      <div>
                        <h3 className="text-white/90 font-semibold text-lg">
                          Tidak Ada Data
                        </h3>
                        <p className="text-white/60 text-sm">
                          Tidak ditemukan data gangguan untuk filter yang
                          dipilih.
                          {selectedPenyulang !== "all" &&
                            ` Coba pilih penyulang lain atau `}
                          Coba ubah rentang tanggal.
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        {selectedPenyulang !== "all" && (
                          <Button
                            onClick={() => setSelectedPenyulang("all")}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                          >
                            Tampilkan Semua Penyulang
                          </Button>
                        )}
                        <Button
                          onClick={refreshData}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6 -z-20 relative">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-red-500/20">
                            <AlertTriangle className="w-5 h-5 text-red-300" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-300">
                              {summaryStats.totalIncidents}
                            </p>
                            <p className="text-xs text-white/70">
                              Total Incidents
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-orange-500/20">
                            <Clock className="w-5 h-5 text-orange-300" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-orange-300">
                              {summaryStats.totalDuration}h
                            </p>
                            <p className="text-xs text-white/70">
                              Total Downtime
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 ">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-amber-500/20">
                            <Target className="w-5 h-5 text-amber-300" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-amber-300">
                              {summaryStats.topCausesCount}
                            </p>
                            <p className="text-xs text-white/70">
                              Top {paretoThreshold}% Causes
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 ">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-emerald-500/20">
                            <Percent className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-emerald-300">
                              {summaryStats.paretoEfficiency}%
                            </p>
                            <p className="text-xs text-white/70">Efficiency</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Analysis Tabs */}
                  <Card className="bg-white/5 backdrop-blur-lg border border-white/10 -z-10">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex space-x-1 bg-white/5 rounded-lg p-1 border border-white/10">
                          {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                              <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                                  activeTab === tab.id
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {tab.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center space-x-3">
                          <Label className="text-white/70 text-sm">
                            Pareto Threshold:
                          </Label>
                          <Select
                            value={paretoThreshold.toString()}
                            onValueChange={(value) =>
                              setParetoThreshold(Number(value))
                            }
                          >
                            <SelectTrigger className="w-20 bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20">
                              <SelectItem
                                value="70"
                                className="text-white hover:bg-white/10"
                              >
                                70%
                              </SelectItem>
                              <SelectItem
                                value="80"
                                className="text-white hover:bg-white/10"
                              >
                                80%
                              </SelectItem>
                              <SelectItem
                                value="90"
                                className="text-white hover:bg-white/10"
                              >
                                90%
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Pareto Chart */}
                        <div className="lg:col-span-2">
                          <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart
                                data={calculateParetoData}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="rgba(255,255,255,0.1)"
                                />
                                <XAxis
                                  dataKey="name"
                                  stroke="rgba(255,255,255,0.7)"
                                  fontSize={12}
                                  angle={-45}
                                  textAnchor="end"
                                  height={100}
                                />
                                <YAxis
                                  yAxisId="left"
                                  stroke="rgba(255,255,255,0.7)"
                                  fontSize={12}
                                />
                                <YAxis
                                  yAxisId="right"
                                  orientation="right"
                                  domain={[0, 100]}
                                  stroke="rgba(255,255,255,0.7)"
                                  fontSize={12}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.2)",
                                    borderRadius: "8px",
                                    color: "white",
                                  }}
                                  formatter={(value, name) => [
                                    name === "cumulativePercentage"
                                      ? `${value}%`
                                      : value,
                                    name === "count"
                                      ? "Jumlah Incidents"
                                      : name === "cumulativePercentage"
                                      ? "Cumulative %"
                                      : name,
                                  ]}
                                />
                                <Legend />
                                <Bar
                                  yAxisId="left"
                                  dataKey="count"
                                  fill="#f97316"
                                  name="Jumlah Incidents"
                                  radius={[4, 4, 0, 0]}
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="cumulativePercentage"
                                  stroke="#dc2626"
                                  strokeWidth={3}
                                  dot={{
                                    fill: "#dc2626",
                                    strokeWidth: 2,
                                    r: 4,
                                  }}
                                  name="Cumulative %"
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey={() => paretoThreshold}
                                  stroke="#10b981"
                                  strokeDasharray="5 5"
                                  strokeWidth={2}
                                  dot={false}
                                  name={`${paretoThreshold}% Threshold`}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Side Panel - Detailed Data */}
                        <div className="space-y-4">
                          <h3 className="text-white/90 font-semibold text-lg flex items-center space-x-2">
                            <Eye className="w-5 h-5" />
                            <span>Top Performers</span>
                          </h3>

                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {calculateParetoData
                              .slice(0, 6)
                              .map((item, index) => (
                                <Card
                                  key={item.name}
                                  className={`p-3 transition-all duration-200 hover:scale-105 ${
                                    item.isAboveThreshold
                                      ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30"
                                      : "bg-white/5 border-white/10"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                          item.isAboveThreshold
                                            ? "bg-red-500 text-white"
                                            : "bg-white/20 text-white/70"
                                        }`}
                                      >
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className="text-white/90 font-medium text-sm">
                                          {item.name}
                                        </p>
                                        <p className="text-white/60 text-xs">
                                          {item.count} incidents
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-white/90 font-bold">
                                        {item.percentage}%
                                      </p>
                                      <p className="text-white/60 text-xs">
                                        of total
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-2">
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          item.isAboveThreshold
                                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                                            : "bg-white/30"
                                        }`}
                                        style={{
                                          width: `${Math.min(
                                            item.percentage * 2,
                                            100
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Insights & Recommendations */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Key Insights */}
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5" />
                          <span>Key Insights</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                          <h4 className="text-orange-300 font-semibold mb-2">
                            Pareto Principle Analysis
                          </h4>
                          <p className="text-white/80 text-sm">
                            <strong>{summaryStats.topCausesPercentage}%</strong>{" "}
                            dari total gangguan disebabkan oleh
                            <strong> {summaryStats.topCausesCount}</strong>{" "}
                            penyebab utama ({summaryStats.paretoEfficiency}%
                            dari total kategori).
                          </p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-white/90 font-semibold">
                            Rekomendasi Prioritas:
                          </h4>
                          {calculateParetoData
                            .filter((item) => item.isAboveThreshold)
                            .map((item, index) => (
                              <div
                                key={item.name}
                                className="flex items-center space-x-3 p-3 rounded-lg bg-white/5"
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-white/90 font-medium">
                                    {item.name}
                                  </p>
                                  <p className="text-white/60 text-xs">
                                    {item.count} incidents • {item.percentage}%
                                    • Avg: {item.avgDuration} min
                                  </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-orange-400" />
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Distribution Chart */}
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                          <PieChartIcon className="w-5 h-5" />
                          <span>Distribution Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={calculateParetoData.slice(0, 6)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) =>
                                  `${name} (${percentage}%)`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {calculateParetoData
                                  .slice(0, 6)
                                  .map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={colors[index % colors.length]}
                                    />
                                  ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                                  border: "1px solid rgba(255, 255, 255, 0.2)",
                                  borderRadius: "8px",
                                  color: "white",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Data Table */}
                  <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                        <Database className="w-5 h-5" />
                        <span>Detailed Analysis Table</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left text-white/80 font-semibold py-3 px-4">
                                Rank
                              </th>
                              <th className="text-left text-white/80 font-semibold py-3 px-4">
                                {activeTab === "penyebab"
                                  ? "Penyebab"
                                  : activeTab === "penyulang"
                                  ? "Penyulang"
                                  : "Kode Gangguan"}
                              </th>
                              <th className="text-left text-white/80 font-semibold py-3 px-4">
                                Incidents
                              </th>
                              <th className="text-left text-white/80 font-semibold py-3 px-4">
                                Percentage
                              </th>
                              <th className="text-left text-white/80 font-semibold py-3 px-4">
                                Cumulative %
                              </th>
                              <th className="text-left text-white/80 font-semibold py-3 px-4">
                                Avg Duration
                              </th>
                              <th className="text-left text-white/80 font-semibold py-3 px-4">
                                Priority
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {calculateParetoData.map((item, index) => (
                              <tr
                                key={item.name}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                              >
                                <td className="py-3 px-4">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      item.isAboveThreshold
                                        ? "bg-red-500 text-white"
                                        : "bg-white/20 text-white/70"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-white/90 font-medium">
                                  {item.name}
                                </td>
                                <td className="py-3 px-4 text-white/80">
                                  {item.count}
                                </td>
                                <td className="py-3 px-4 text-white/80">
                                  {item.percentage}%
                                </td>
                                <td className="py-3 px-4 text-white/80">
                                  {item.cumulativePercentage}%
                                </td>
                                <td className="py-3 px-4 text-white/80">
                                  {item.avgDuration} min
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.isAboveThreshold
                                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                        : "bg-white/10 text-white/60 border border-white/20"
                                    }`}
                                  >
                                    {item.isAboveThreshold ? "High" : "Medium"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span>Live Firebase Data</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span>{gangguanData.length} total records</span>
                  <span className="text-white/40">•</span>
                  <span>{filteredData.length} filtered</span>
                  <span className="text-white/40">•</span>
                  <span>Pareto: {paretoThreshold}%</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-white/60">
                  <Activity className="w-4 h-4" />
                  <span>Real-time analysis from Firebase</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layouts>
  );
};

export default ParetoGangguanAnalysis;
