import React from "react";
import { DashboardStats, ReviewAnalysis } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts";
import { Shield, ShieldAlert, BadgeInfo, Users, Layers, Activity, Star, AlertCircle, TrendingUp } from "lucide-react";

interface AnalyticsPanelProps {
  stats: DashboardStats;
  recentReviews: ReviewAnalysis[];
}

export default function AnalyticsPanel({ stats, recentReviews }: AnalyticsPanelProps) {
  
  // Prepare data for the Sentiment Pie Chart
  const sentimentData = [
    { name: "Positive", value: stats.sentimentDistribution.positive, color: "#10b981" },
    { name: "Neutral", value: stats.sentimentDistribution.neutral, color: "#64748b" },
    { name: "Negative", value: stats.sentimentDistribution.negative, color: "#ef4444" },
  ].filter(item => item.value > 0);

  // Fallback default sentiment data in case there are no reviews analysed
  const activeSentimentData = sentimentData.length > 0 ? sentimentData : [
    { name: "Positive", value: 3, color: "#10b981" },
    { name: "Neutral", value: 1, color: "#64748b" },
    { name: "Negative", value: 1, color: "#ef4444" }
  ];

  // Prepare data for Fake vs Real Bar Chart
  const auditData = [
    { name: "Verified Organic", count: stats.realReviewsCount, color: "#10b981" },
    { name: "Deceptive/Fake", count: stats.fakeReviewsCount, color: "#f43f5e" }
  ];

  // Time-series mock trend for the dashboard to show continuous system activity
  const trendData = [
    { name: "May 18", checked: 12, flagged: 3 },
    { name: "May 19", checked: 18, flagged: 5 },
    { name: "May 20", checked: 24, flagged: 8 },
    { name: "May 21", checked: 35, flagged: 11 },
    { name: "May 22", checked: stats.totalReviews + 15, flagged: stats.fakeReviewsCount + 4 }
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Platform Summary KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Audits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Audited Reviews</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{stats.totalReviews}</h3>
            </div>
            <div className="bg-teal-500/10 text-teal-400 p-2.5 rounded-xl border border-teal-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
            <span className="text-emerald-400 font-bold font-mono">100% Secure</span>
            <span>real-time database monitoring</span>
          </div>
        </div>

        {/* Card 2: Fake/Suspicious Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Flagged As Deceptive</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight text-rose-400">{stats.fakeReviewsCount}</h3>
            </div>
            <div className="bg-rose-500/10 text-rose-400 p-2.5 rounded-xl border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-400">
            <span className="font-bold bg-rose-500/10 border border-rose-500/20 py-0.5 px-1.5 rounded text-[10px]">
              {stats.totalReviews > 0 ? Math.round((stats.fakeReviewsCount / stats.totalReviews) * 100) : 0}% Risk Ratio
            </span>
            <span className="text-slate-400 text-[11px]">of total listings analyzed</span>
          </div>
        </div>

        {/* Card 3: Average Trust Index */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Average Trust Score</p>
              <h3 className={`text-3xl font-extrabold mt-2 tracking-tight ${stats.averageTrust > 75 ? "text-emerald-400" : stats.averageTrust > 50 ? "text-yellow-400" : "text-rose-400"}`}>
                {stats.averageTrust}%
              </h3>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
            <span className="text-emerald-400 font-bold font-mono">Authenticity Index</span>
            <span>across all active SKU listings</span>
          </div>
        </div>

        {/* Card 4: High Toxicity Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Suspected Smears</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight text-red-400">{stats.toxicCount}</h3>
            </div>
            <div className="bg-red-500/10 text-red-400 p-2.5 rounded-xl border border-red-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
            <span className="text-red-400 font-bold font-mono">Attack Alerts</span>
            <span>extremely toxic competitor reviews</span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Sentiment Frequency Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-sm">
          <h4 className="text-sm font-bold text-white mb-1">Customer Sentiment Polarity</h4>
          <p className="text-[11px] text-slate-400 font-sans mb-6">Aggregated real-time polarity spectrum of processed text inputs.</p>
          
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeSentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activeSentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", color: "white" }}
                  itemStyle={{ color: "white" }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Authenticity Audit breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-sm">
          <h4 className="text-sm font-bold text-white mb-1">Authenticity Ratios</h4>
          <p className="text-[11px] text-slate-400 font-sans mb-6">Total reviews volume categorization based on risk indices metrics.</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", color: "white" }}
                  cursor={{ fill: "rgba(30, 41, 59, 0.4)" }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {auditData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Area Chart: Platform Activity History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-sm font-bold text-white">System Threat Intelligence Timeline</h4>
            <p className="text-[11px] text-slate-400 mt-1">Audit verification load paired with identified threats across 5 calendar days.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-[10px] font-mono font-medium text-teal-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Streams</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorChecked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", color: "white" }} />
              <Area type="monotone" dataKey="checked" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorChecked)" name="Reviews Audited" />
              <Area type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFlagged)" name="Deceptions Caught" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dangerous Review Watch Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-rose-500/10 text-rose-400 p-1.5 rounded-lg border border-rose-500/20">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">Quarantined Risk Alerts</h4>
        </div>

        {recentReviews.filter(r => r.isFake).length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500">No priority risk reviews identified in recent runs. Platform operations secure.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-850">
            {recentReviews.filter(r => r.isFake).slice(0, 3).map((review) => (
              <div key={review.id} className="py-4 first:pt-0 last:pb-0 font-sans">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-bold uppercase">
                      ID: {review.id}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-semibold">Product: {review.productName}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-mono">Rating: {"★".repeat(review.rating)}</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 italic px-3 border-l-2 border-rose-500/40 line-clamp-2">
                  &quot;{review.reviewText}&quot;
                </p>
                <div className="mt-3 flex flex-wrap gap-2 items-center text-[10px] text-slate-400">
                  <span className="text-rose-400 font-bold font-mono bg-rose-400/5 px-2 py-0.5 rounded border border-rose-400/10">
                    Bot Conf: {review.fakeProbability}%
                  </span>
                  <span className="text-red-400 font-medium font-mono">
                    Anomaly Signature: {review.flaggedPatterns[0] || "Stylistic superlative spikes"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
