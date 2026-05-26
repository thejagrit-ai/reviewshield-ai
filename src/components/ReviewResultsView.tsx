import React from "react";
import { ReviewAnalysis } from "../types";
import { 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  Tag, 
  TrendingUp, 
  Calendar, 
  Search, 
  ArrowLeftRight,
  Eye,
  Activity,
  Award
} from "lucide-react";

interface ReviewResultsProps {
  latestResults: ReviewAnalysis[];
  onBackToUpload: () => void;
}

export default function ReviewResultsView({ latestResults, onBackToUpload }: ReviewResultsProps) {
  if (latestResults.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 bg-slate-950 text-slate-500 rounded-2xl border border-slate-850 flex items-center justify-center mx-auto mb-6">
          <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Active Review Results</h3>
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          You haven't processed any product reviews in this session yet. Return to the upload tab or use our presets to run a quick forensic analysis.
        </p>
        <button
          onClick={onBackToUpload}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer"
        >
          Analyze Reviews Now
        </button>
      </div>
    );
  }

  // Calculate batch metrics
  const totalAnalyzed = latestResults.length;
  const fakeCount = latestResults.filter(r => r.isFake).length;
  const realCount = totalAnalyzed - fakeCount;
  const averageTrust = Math.round(latestResults.reduce((sum, r) => sum + r.trustScore, 0) / totalAnalyzed);
  
  const positiveCount = latestResults.filter(r => r.sentiment === "positive").length;
  const negativeCount = latestResults.filter(r => r.sentiment === "negative").length;
  const neutralCount = latestResults.filter(r => r.sentiment === "neutral").length;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Overview stats block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">Session Analytics</span>
            <h3 className="text-xl font-bold text-white mt-1">Batch Forensics Inspection Report</h3>
          </div>
          <button
            onClick={onBackToUpload}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-350 hover:text-white px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            ← Close & Analyze More
          </button>
        </div>

        {/* 4 Score Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-850">
          
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl relative">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Average Trust Quotient</span>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className={`text-3xl font-black ${averageTrust > 75 ? "text-emerald-400" : averageTrust > 50 ? "text-yellow-400" : "text-rose-400"}`}>
                {averageTrust}%
              </span>
              <span className="text-[9px] text-slate-400">/ 100 max</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Overall reliability across latest inputs.</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Integrity Breakdown</span>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-400">{fakeCount}</span>
              <span className="text-xs text-slate-400">Flagged Fake</span>
              <span className="text-3xl font-black text-emerald-400 ml-auto">{realCount}</span>
              <span className="text-xs text-slate-400">Organic</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Ratio: {Math.round((fakeCount / totalAnalyzed) * 100)}% suspected deceptive.</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Sentiment Distribution</span>
            <div className="mt-2.5 flex gap-2 items-center">
              <div className="text-center flex-1">
                <span className="block text-emerald-400 font-bold text-sm">{positiveCount}</span>
                <span className="text-[9px] text-slate-500 uppercase font-mono">Pos</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="text-center flex-1">
                <span className="block text-slate-350 font-bold text-sm">{neutralCount}</span>
                <span className="text-[9px] text-slate-500 uppercase font-mono">Neu</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="text-center flex-1">
                <span className="block text-red-400 font-bold text-sm">{negativeCount}</span>
                <span className="text-[9px] text-slate-500 uppercase font-mono">Neg</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Sentiment indices skew positive by {Math.round((positiveCount/totalAnalyzed)*100)}%.</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Security Verdict</span>
            <div className="mt-2 px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg text-xs font-bold w-fit">
              {fakeCount > 0 ? "Quarantine Active" : "Clean Verified Batch"}
            </div>
            <p className="text-[10px] text-slate-500 mt-2.5">
              {fakeCount > 0 ? "Flagged items isolated in historical database records." : "All reviews represent genuine buyer behaviors."}
            </p>
          </div>

        </div>
      </div>

      {/* Individual item results list */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Granular Forensic Breakdown ({totalAnalyzed} Reviews)</h4>

        {latestResults.map((rev, index) => {
          // Identify suspect phrasing words inside text
          const suspectTerms = rev.extractedKeywords;
          const reviewTextWithHighlights = () => {
            if (suspectTerms.length === 0 || !rev.isFake) {
              return <span className="text-slate-300 italic">"{rev.reviewText}"</span>;
            }
            
            // Build regex of suspect terms to highlight them in red
            let htmlText = rev.reviewText;
            suspectTerms.forEach(term => {
              if (term.trim().length > 2) {
                const regex = new RegExp(`\\b(${term})\\b`, "gi");
                htmlText = htmlText.replace(regex, `[[MARK]]${term}[[UNMARK]]`);
              }
            });

            const parts = htmlText.split(/(\[\[MARK\]\].*?\[\[UNMARK\]\])/g);
            return (
              <span className="text-slate-300 italic">
                "
                {parts.map((part, pidx) => {
                  if (part.startsWith("[[MARK]]") && part.endsWith("[[UNMARK]]")) {
                    const cleanWord = part.replace("[[MARK]]", "").replace("[[UNMARK]]", "");
                    return (
                      <span key={pidx} className="bg-red-500/15 text-red-300 border-b border-red-500/30 px-1 py-0.5 rounded font-semibold text-xs">
                        {cleanWord}
                      </span>
                    );
                  }
                  return part;
                })}
                "
              </span>
            );
          };

          return (
            <div 
              key={index} 
              className={`border rounded-2xl p-6 relative shadow-sm transition-all overflow-hidden ${
                rev.isFake 
                  ? "bg-slate-900 border-red-500/20 hover:border-red-500/30" 
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              
              {/* Top title area */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{rev.reviewerName}</span>
                    <span className="text-xs text-slate-500 font-mono">({rev.productName})</span>
                  </div>
                  <div className="mt-1 flex gap-2">
                    <span className="text-xs text-yellow-500">{"★".repeat(rev.rating)}</span>
                    <span className="text-[10px] font-mono text-slate-500">rating stars</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {rev.isFake ? (
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>DECEPTIVE FLAGGED</span>
                    </span>
                  ) : (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>VERIFIED ORGANIC</span>
                    </span>
                  )}

                  <span className={`px-2.5 py-1 border rounded text-[10px] font-mono font-bold uppercase ${
                    rev.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" :
                    rev.sentiment === "negative" ? "bg-rose-500/10 text-rose-400 border-rose-500/10" :
                    "bg-slate-950 text-slate-400 border-slate-800"
                  }`}>
                    {rev.sentiment}
                  </span>
                </div>
              </div>

              {/* Verified Text Highlights */}
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl mb-5 leading-relaxed text-xs">
                {reviewTextWithHighlights()}
              </div>

              {/* Gauges indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                
                <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block">Trustworthiness Score</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className={`text-xl font-black ${rev.trustScore > 75 ? "text-emerald-400" : rev.trustScore > 40 ? "text-yellow-400" : "text-rose-400"}`}>
                      {rev.trustScore}%
                    </span>
                    <span className="text-[9px] text-slate-500">reliability quotient</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-teal-500 h-full" style={{ width: `${rev.trustScore}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block">AI-model probability</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-slate-300">{rev.aiGeneratedProbability}%</span>
                    <span className="text-[9px] text-slate-500">style matches GPT</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-teal-400 h-full" style={{ width: `${rev.aiGeneratedProbability}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block">Offense & Toxicity</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-slate-300">{rev.toxicityScore}%</span>
                    <span className="text-[9px] text-slate-500">competitor malice level</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-red-500 h-full" style={{ width: `${rev.toxicityScore}%` }} />
                  </div>
                </div>

              </div>

              {/* Keywords list */}
              {rev.extractedKeywords.length > 0 && (
                <div className="mb-4">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-1.5">Suspect Phrasing Markers</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rev.extractedKeywords.map((tag, id) => (
                      <span key={id} className="inline-flex items-center gap-1 bg-slate-950 border border-slate-850 font-mono text-[9px] text-slate-400 px-2 py-0.5 rounded-lg">
                        <Tag className="w-2.5 h-2.5 text-teal-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning Consensus */}
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-1">Pattern Auditor Consensus</span>
                <p className="text-xs text-slate-300 leading-normal">{rev.suspiciousReasoning}</p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
