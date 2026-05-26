import React, { useState, useEffect } from "react";
import { SystemLog, User } from "../types";
import { 
  Activity, 
  Shield, 
  Users, 
  Server, 
  Sliders, 
  Key, 
  Database, 
  Mail, 
  Cpu, 
  Clock, 
  HardDrive, 
  Terminal, 
  Layers, 
  Search, 
  Settings, 
  BarChart2, 
  ArrowUpRight, 
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface AdminPanelProps {
  logs: SystemLog[];
  user: User | null;
  token: string | null;
}

interface RegisterUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminPanel({ logs, user, token }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "users" | "volume" | "health" | "logs" | "api">("overview");
  
  // States for sub-panels
  const [usersList, setUsersList] = useState<RegisterUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [logFilter, setLogFilter] = useState("ALL");
  const [systemSensitivity, setSystemSensitivity] = useState<"strict" | "moderate" | "relaxed">("moderate");
  const [autoQuarantine, setAutoQuarantine] = useState(true);

  // Load registered users live from the API route we set up
  useEffect(() => {
    if (activeSubTab === "users" && token) {
      setLoadingUsers(true);
      fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.users) {
            setUsersList(data.users);
          }
        })
        .catch(err => {
          console.error("Failed to fetch administrative accounts indexes.", err);
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [activeSubTab, token]);

  // Filter logs list based on action types
  const filteredLogs = logs.filter(log => {
    if (logFilter === "ALL") return true;
    return log.action === logFilter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans animate-fade-in">
      
      {/* Admin Sub-tabs Navigation */}
      <div className="lg:col-span-3 space-y-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold px-3 block mb-3">Console Modules</span>
        
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeSubTab === "overview" 
              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner" 
              : "text-slate-400 hover:text-slate-250 hover:bg-slate-900/40 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BarChart2 className="w-4 h-4" />
            <span>Platform Overview</span>
          </div>
          <Zap className="w-3 h-3 opacity-60" />
        </button>

        <button
          onClick={() => setActiveSubTab("users")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeSubTab === "users" 
              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner" 
              : "text-slate-400 hover:text-slate-250 hover:bg-slate-900/40 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4" />
            <span>Workspace Users</span>
          </div>
          <span className="text-[9px] font-mono select-none px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-900">Live</span>
        </button>

        <button
          onClick={() => setActiveSubTab("volume")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeSubTab === "volume" 
              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner" 
              : "text-slate-400 hover:text-slate-250 hover:bg-slate-900/40 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4" />
            <span>Review Volume</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab("health")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeSubTab === "health" 
              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner" 
              : "text-slate-400 hover:text-slate-250 hover:bg-slate-900/40 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4" />
            <span>System Health</span>
          </div>
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </button>

        <button
          onClick={() => setActiveSubTab("logs")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeSubTab === "logs" 
              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner" 
              : "text-slate-400 hover:text-slate-250 hover:bg-slate-900/40 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4" />
            <span>Telemetry Logs</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab("api")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeSubTab === "api" 
              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner" 
              : "text-slate-400 hover:text-slate-250 hover:bg-slate-900/40 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4" />
            <span>API Monitoring</span>
          </div>
        </button>
      </div>

      {/* Main Admin Pages Mount */}
      <div className="lg:col-span-9">
        
        {/* TAB 1: PLATFORM OVERVIEW */}
        {activeSubTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Quick Greeting */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/5 blur-3xl rounded-full" />
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-lg">
                  {user?.name.substring(0, 2).toUpperCase() || "AD"}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">Welcome, {user?.name || "System Admin"}</h4>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-[#0e82] mt-0.5">Secure Platform Cluster Host</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest font-bold block">Account Status</span>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Administrative Verify Active</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Bypasses threshold bounds checks.</p>
              </div>

              <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest font-bold block">Active Clusters Count</span>
                <span className="text-2xl font-black text-white mt-1 block">3 Datacenters</span>
                <p className="text-[10px] text-slate-500 mt-2">Routed via local Cloud Run ingress safely.</p>
              </div>

              <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest font-bold block">Uptime Reliability</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">99.98%</span>
                <p className="text-[10px] text-slate-500 mt-2">Continuous continuous checks.</p>
              </div>

            </div>

            {/* Platform metrics info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-white mb-4">Operations Verdict metrics Checklist</h4>
              <div className="space-y-3.5 text-xs text-slate-350">
                <div className="flex gap-3 items-start">
                  <span className="text-teal-400 font-bold font-mono">1</span>
                  <div>
                    <span className="text-white font-semibold block">Language duplication vector isolation</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Scoping duplication frequencies in pasted paragraphs to find bots tokens saving signatures.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <span className="text-teal-400 font-bold font-mono">2</span>
                  <div>
                    <span className="text-white font-semibold block">Suspicious adjective density flags</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Isolating dense superlatives or exaggerated criticisms characteristic of rival companies smear posts.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-teal-400 font-bold font-mono">3</span>
                  <div>
                    <span className="text-white font-semibold block">Auto quarantine trigger controls</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Enables automatic rating isolation in the master listing database index instantly on analysis verdict.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REGISTERED USERS LIST */}
        {activeSubTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
            <div className="px-6 py-4 bg-[#0b1329] border-b border-slate-850 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono text-teal-400 uppercase tracking-widest font-extrabold">Active System Users</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono uppercase">Master workspace registry</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">{usersList.length} Accounts Active</span>
            </div>

            {loadingUsers ? (
              <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                Fetching secure user entries...
              </div>
            ) : usersList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No active users found.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left font-sans text-slate-300">
                  <thead className="bg-[#0b1329] text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-slate-850">
                    <tr>
                      <th className="px-5 py-3">Member ID</th>
                      <th className="px-5 py-3">User Profile Name</th>
                      <th className="px-5 py-3">Corporate Email</th>
                      <th className="px-5 py-3">Permission Role</th>
                      <th className="px-5 py-3">Register Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-550 font-bold">{usr.id}</td>
                        <td className="px-5 py-3.5 font-bold text-white">{usr.name}</td>
                        <td className="px-5 py-3.5 text-slate-400">{usr.email}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                            usr.role === "admin" 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                              : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono">
                          {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : "Active Seed"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REVIEW VOLUME ANALYSIS */}
        {activeSubTab === "volume" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in font-sans">
            <div>
              <h4 className="text-sm font-bold text-white">Database Ingestion Volumes</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time listing file synchronization load states tracker.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                  <span>DAILY STORAGE THRESHOLD</span>
                  <span className="text-teal-400">42.2 MB / 100 MB</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full" style={{ width: "42.2%" }} />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                  <span>CONCURRENT INGEST CHANNELS</span>
                  <span className="text-teal-400">12 / 64 Streams</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full" style={{ width: "18.7%" }} />
                </div>
              </div>

            </div>

            {/* Ingestion stream rates mockup */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4">
              <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest font-extrabold block">Ingest Ingress Velocity</span>
              <div className="h-28 flex items-end gap-1.5 pt-4">
                {[20, 45, 30, 80, 55, 90, 40, 65, 35, 75, 50, 85, 95, 45, 70].map((height, id) => (
                  <div key={id} className="flex-1 bg-teal-500/20 hover:bg-teal-400/40 rounded transition-all group relative cursor-pointer" style={{ height: `${height}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-slate-800 text-[9px] py-0.5 px-1.5 rounded font-mono text-teal-400">
                      {height}%
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-550 text-center font-mono">Real-time metrics timeline parsed in 1-second cycles</p>
            </div>

          </div>
        )}

        {/* TAB 4: SYSTEM HEALTH CHECK */}
        {activeSubTab === "health" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Compute Infrastructure Nodes</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Simulated real-time server cluster physical telemetry.</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>ONLINE CLUSTERS</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* CPU status */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-350">
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">Server CPU Load</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-2xl font-black text-white">24.2 %</span>
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">Stable</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-teal-500 h-full" style={{ width: "24.2%" }} />
                </div>
              </div>

              {/* Memory status */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-350">
                  <HardDrive className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">Primary Node RAM</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-2xl font-black text-white">42.8 %</span>
                  <span className="text-[10px] text-slate-500 font-mono">6.8 GB / 16 GB</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-teal-400 h-full" style={{ width: "42.8%" }} />
                </div>
              </div>

              {/* Ping stats */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-350">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">Database Latency</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-2xl font-black text-white">11.8 ms</span>
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">Excellent</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full" style={{ width: "11.8%" }} />
                </div>
              </div>

            </div>

            {/* Redis ping and container stats checklist */}
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3.5">
              <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest font-extrabold block">Health Check Diagnostics</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-900">
                  <span className="text-slate-400">Redis Cache Cluster:</span>
                  <span className="text-emerald-400 font-mono font-bold">Active Connection (OK)</span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-900">
                  <span className="text-slate-400">SSL Certificate expiry:</span>
                  <span className="text-emerald-400 font-mono font-bold">Expires in 324 Days</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-900">
                  <span className="text-slate-400">PostgreSQL replica node:</span>
                  <span className="text-emerald-400 font-mono font-bold">Active Sync (OK)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-900">
                  <span className="text-slate-400">Background Worker Threads:</span>
                  <span className="text-emerald-400 font-mono font-bold">8 Threads idle (OK)</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: TELEMETRY LOGS */}
        {activeSubTab === "logs" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[100vh-14rem] animate-fade-in font-sans">
            
            <div className="px-6 py-4 bg-[#0b1329] border-b border-slate-850 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div>
                <h4 className="text-xs font-mono text-teal-400 uppercase tracking-widest font-extrabold">Full Event telemetry logs</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Continuously streaming log feeds across portal sessions.</p>
              </div>

              {/* Log Action Filters */}
              <div className="shrink-0">
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl text-xs text-slate-200 outline-none focus:border-teal-500 font-bold"
                >
                  <option value="ALL">All Event Types</option>
                  <option value="REVIEW_ANALYZE">Review Analyze</option>
                  <option value="USER_REGISTER">User Register</option>
                  <option value="USER_LOGIN">User Login</option>
                  <option value="REVIEW_DELETE">Review Delete</option>
                </select>
              </div>
            </div>

            {/* Streaming Logs Body */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[35rem] pr-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-550 text-xs">
                  No telemetry logs matching the criteria were captured.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="text-xs border-b border-slate-850/40 pb-3 last:border-none leading-relaxed">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="font-extrabold text-teal-400 uppercase tracking-wider bg-teal-500/5 px-2 py-0.5 border border-teal-500/10 rounded">
                        {log.action}
                      </span>
                      <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 italic"><span className="text-slate-400 font-semibold">{log.userEmail}:</span> {log.details}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 6: API MONITORING */}
        {activeSubTab === "api" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in font-sans">
            <div>
              <h4 className="text-sm font-bold text-white">API Integrations Credentials</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Endpoint bindings and models thresholds settings triggers.</p>
            </div>

            {/* Threshold Configurations Controls */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4">
              <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest font-extrabold block">Threshold Controls Configuration</span>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Detection strictness factor</label>
                  <div className="grid grid-cols-3 gap-2.5 text-xs text-slate-300">
                    <button
                      type="button"
                      onClick={() => setSystemSensitivity("relaxed")}
                      className={`py-2 p-1.5 rounded-xl border font-bold transition-colors cursor-pointer text-center ${systemSensitivity === "relaxed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-900 border-slate-850"}`}
                    >
                      Relaxed
                    </button>
                    <button
                      type="button"
                      onClick={() => setSystemSensitivity("moderate")}
                      className={`py-2 p-1.5 rounded-xl border font-bold transition-colors cursor-pointer text-center ${systemSensitivity === "moderate" ? "bg-teal-500/10 border-teal-500/30 text-teal-400" : "bg-slate-900 border-slate-850"}`}
                    >
                      Default Moderate
                    </button>
                    <button
                      type="button"
                      onClick={() => setSystemSensitivity("strict")}
                      className={`py-2 p-1.5 rounded-xl border font-bold transition-colors cursor-pointer text-center ${systemSensitivity === "strict" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-slate-900 border-slate-850"}`}
                    >
                      Strict Sens
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-850" />

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Automated quarantine listing placement</span>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">If marked as deceptive, review indexes are isolated instantly inside the store repository.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={autoQuarantine} 
                      onChange={() => setAutoQuarantine(!autoQuarantine)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-900 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Static Endpoints indicators */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3.5">
              <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest font-extrabold block">Integrations Nodes Details</span>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="block text-[9px] font-mono text-slate-500 mb-1 font-bold">API HOSTING ROOT URL</span>
                  <input
                    type="text"
                    disabled
                    value="https://reviewshield.ai/api/v1/reviews/verify"
                    className="w-full bg-slate-900 border border-slate-850 px-3.5 py-2 rounded-lg text-slate-400 font-mono select-all disabled:opacity-80"
                  />
                </div>

                <div>
                  <span className="block text-[9px] font-mono text-slate-550 mb-1 font-bold">ACTIVE GEMINI MODEL MODEL</span>
                  <input
                    type="text"
                    disabled
                    value="gemini-3.5-flash-active-instance-node"
                    className="w-full bg-slate-900 border border-slate-850 px-3.5 py-2 rounded-lg text-slate-400 font-mono disabled:opacity-80"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
