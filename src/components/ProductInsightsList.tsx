import React, { useState } from "react";
import { ProductInsight } from "../types";
import { CheckCircle, ShieldAlert, Sparkles, ThumbsUp, ThumbsDown, Lightbulb, FileText, ArrowRight } from "lucide-react";

interface ProductInsightsListProps {
  insights: ProductInsight[];
  onSummarizeBulk: (reviewsListText: string) => Promise<any>;
  isSummarizing: boolean;
}

export default function ProductInsightsList({ insights, onSummarizeBulk, isSummarizing }: ProductInsightsListProps) {
  const [bulkInput, setBulkInput] = useState("");
  const [summarizerReport, setSummarizerReport] = useState<any | null>(null);

  const handleSummarizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    // Convert raw pasted paragraphs split by linebreaks into a format suited for server ingestion
    const reviewsArr = bulkInput.split("\n").filter(line => line.trim().length > 10).map(line => ({
      reviewText: line.trim()
    }));

    const result = await onSummarizeBulk(JSON.stringify(reviewsArr));
    if (result) {
      setSummarizerReport(result);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Dynamic Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {insights.map((prod, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-sm hover:border-slate-755 transition-all">
            
            {/* Header info */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">{prod.productName}</h4>
                <div className="mt-1 flex gap-3 text-slate-400 text-[10px] font-mono">
                  <span>Audited: <strong>{prod.reviewsCount} records</strong></span>
                  <span>Satisfaction Rating: <strong>{prod.satisfactionScore}%</strong></span>
                </div>
              </div>

              {/* Reputation Letter Grade Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border uppercase ${
                prod.authenticityGrade === "A" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                prod.authenticityGrade === "B" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                prod.authenticityGrade === "C" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                "bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold"
              }`}>
                {prod.authenticityGrade}
              </div>
            </div>

            {/* Risk profile alert block */}
            <p className="text-xs text-slate-350 leading-relaxed bg-[#0b1329] border border-slate-850 p-4 rounded-xl italic mb-6">
              &quot;{prod.consensusText}&quot;
            </p>

            {/* Structured details columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
              
              {/* Positives */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Highlights</span>
                </span>
                <ul className="space-y-2 text-[11px] list-disc list-inside pl-0.5 text-slate-400 leading-relaxed">
                  {prod.keyHighlights.slice(0, 3).map((item, id) => (
                    <li key={id}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Complaints */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Complaints</span>
                </span>
                <ul className="space-y-2 text-[11px] list-disc list-inside pl-0.5 text-slate-400 leading-relaxed">
                  {prod.mainComplaints.slice(0, 3).map((item, id) => (
                    <li key={id}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Roadmaps */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Improvements</span>
                </span>
                <ul className="space-y-2 text-[11px] list-disc list-inside pl-0.5 text-slate-400 leading-relaxed">
                  {prod.actionableImprovements.slice(0, 3).map((item, id) => (
                    <li key={id}>{item}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        ))}

      </div>

      {/* Advanced Bulk Summarizer Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="max-w-xl">
          <h4 className="text-sm font-bold text-white">Advanced Listing summarizer</h4>
          <p className="text-[10px] text-slate-400 leading-normal mt-1 mb-6">Paste up to 20 review paragraphs from external competitor listings. Gemini isolates authentic satisfaction traits instantly.</p>
        </div>

        <form onSubmit={handleSummarizeSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Paste Competitive Reviews List (Line separated)</label>
            <textarea
              placeholder="[Review A]: Absolutely loved the battery sync speed...&#10;[Review B]: Horrible flimsy charging case pins..."
              rows={6}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 font-sans leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSummarizing || !bulkInput.trim()}
            className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
          >
            {isSummarizing ? (
              <span>Synthesizing Listings Feed...</span>
            ) : (
              <>
                <span>Synthesize Bullet Reports</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        {/* Summarizer outcome response box */}
        {summarizerReport && (
          <div className="mt-8 p-6 bg-slate-950 border border-slate-850 rounded-2xl space-y-6">
            
            <div className="flex gap-2 items-center text-teal-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <h5 className="text-xs font-mono uppercase tracking-widest font-bold">Synthesized Listing Evaluation</h5>
            </div>

            <p className="text-xs text-slate-350 bg-slate-900/40 p-3 rounded-xl border border-slate-900 leading-relaxed italic">
              Authenticity Consensus: &quot;{summarizerReport.authenticityConsensus}&quot;
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
              
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold block pb-1 border-b border-slate-850">Top Advantages</span>
                <ul className="space-y-2 pl-3 list-disc text-[11px] text-slate-400 leading-relaxed">
                  {summarizerReport.keyHighlights.map((hl: string, index: number) => (
                    <li key={index}>{hl}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold block pb-1 border-b border-slate-850">Recurring Complaints</span>
                <ul className="space-y-2 pl-3 list-disc text-[11px] text-slate-400 leading-relaxed">
                  {summarizerReport.mainComplaints.map((comp: string, index: number) => (
                    <li key={index}>{comp}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest font-bold block pb-1 border-b border-slate-850">Actionable Roadmaps</span>
                <ul className="space-y-2 pl-3 list-disc text-[11px] text-slate-400 leading-relaxed">
                  {summarizerReport.actionableImprovements.map((imp: string, index: number) => (
                    <li key={index}>{imp}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
