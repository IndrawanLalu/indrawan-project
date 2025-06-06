// import DiagramGangguan from "@/components/diagram/DiagramGangguan";
import Layouts from "@/pages/admin/Layouts";
// import DiagramPenyulangTrip from "@/components/diagram/DiagramPenyulangTrip";
import DiagramGangguanPenyulang from "@/components/diagram/DiagramGangguanPenyulang";
import TabelSegment from "@/components/diagram/TabelSegment";
import Top10gangguan from "@/components/diagram/Top10Gangguan";
import { TotalGangguan } from "@/pages/gangguan/dataGangguan";
import DiagramSumberGangguan from "@/components/diagram/DiagramSumberGangguan";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import DiagramTemuan from "@/components/diagram/DiagramTemuan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  Activity,
  Globe,
  RefreshCw,
  Settings,
  Download,
  Target,
  Zap,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1)
  ); // Default awal tahun ini
  const [endDate, setEndDate] = useState(new Date()); // Default hari ini

  const formatDateRange = () => {
    const start = startDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const end = endDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const getDaysDifference = () => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  return (
    <Layouts>
      <div className="relative min-h-screen bg-gradient-to-br from-backgroundFrom via-backgroundFrom to-backgroundTo">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-10 opacity-40">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
          </div>
        </div>

        <div className="relative z-10 p-6 space-y-6">
          <Card className="group bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

            <CardHeader className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Analytics Dashboard
                    </h1>
                    <p className="text-white/60 text-sm flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Real-time monitoring & analytics</span>
                      <span className="text-white/40">•</span>
                      <span>{formatDateRange()}</span>
                      <span className="text-white/40">•</span>
                      <span>{getDaysDifference()} hari</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                    <Calendar className="w-5 h-5 text-white/70" />
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-white/60 mb-1">
                          Start Date
                        </label>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select start date"
                        />
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-white/20"></div>
                      <div className="flex flex-col">
                        <label className="text-xs text-white/60 mb-1">
                          End Date
                        </label>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select end date"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 group/btn">
                      <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-400">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white/90">
                  Overview Analytics
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>

              <TotalGangguan startDate={startDate} endDate={endDate} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white/90">
                  Detailed Analytics
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Trend Gangguan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <DiagramGangguanPenyulang
                      startDate={startDate}
                      endDate={endDate}
                    />
                  </CardContent>
                </Card>

                <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Top Gangguan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Top10gangguan startDate={startDate} endDate={endDate} />
                  </CardContent>
                </Card>

                <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Sumber Gangguan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <DiagramSumberGangguan
                      startDate={startDate}
                      endDate={endDate}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white/90">
                  Data Management
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Segment Management</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <TabelSegment />
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white/90 text-lg flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>Temuan Inspeksi</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <DiagramTemuan startDate={startDate} endDate={endDate} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>System Online</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span>
                    Last Updated: {new Date().toLocaleTimeString("id-ID")}
                  </span>
                  <span className="text-white/40">•</span>
                  <span>Data Period: {getDaysDifference()} days</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-white/60">
                  <span>Powered by Analytics Engine</span>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <span>v2.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layouts>
  );
};

export default Dashboard;
