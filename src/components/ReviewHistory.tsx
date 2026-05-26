import React, { useState } from "react";
import { Search, Filter, ShieldAlert, CheckCircle, Flame, Trash2, ArrowUpRight, ArrowDownRight, Tag, AlertTriangle, User, Calendar, X } from "lucide-react";
import { ReviewAnalysis } from "../types";

interface ReviewHistoryProps {
  reviews: ReviewAnalysis[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDeleteReview: (id: string) => Promise<void>;
  filterSearch: string;
  setFilterSearch: (val: string) => void;
  filterProduct: string;
  setFilterProduct: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterSentiment: string;
  setFilterSentiment: (val: string) => void;
  isAdmin: boolean;
}

export default function ReviewHistory({
  reviews,
  totalReviews,
  totalPages,
  currentPage,
  onPageChange,
  onDeleteReview,
  filterSearch,
  setFilterSearch,
  filterProduct,
  setFilterProduct,
  filterStatus,
  setFilterStatus,
  filterSentiment,
  setFilterSentiment,
  isAdmin
}: ReviewHistoryProps) {
  
  const [selectedReview, setSelectedReview] = useState<ReviewAnalysis | null>(null);

  // Sub-metrics derived for filter list options
  const productsList = [
    "ApexFit Watch 3",
    "SonicBlast Wireless Buds",
    "BrewPerfect Pro"
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Filtering Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <h4 className="text-sm font-bold text-white shrink-0">Historic Review Audits</h4>
          <span className="text-[10px] font-mono text-slate-500">{totalReviews} results indexed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search content, authors..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Product Filter */}
          <div className="lg:col-span-3">
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="">All Product SKUs</option>
              {productsList.map((prod) => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="">All Authenticity</option>
              <option value="organic">Organic Humans</option>
              <option value="fake">Deceptive/Fake</option>
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="lg:col-span-3">
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="">All Sentiment Polarity</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Review Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-sans">No indexed records found. Ensure filters or search queries are broad.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="bg-[#0b1329] border-b border-slate-850 text-slate-400 text-[10px] uppercase font-mono font-bold tracking-widest">
                <tr>
                  <th className="px-5 py-4">Authenticity</th>
                  <th className="px-5 py-4">Reviewer</th>
                  <th className="px-5 py-4">Product Info</th>
                  <th className="px-5 py-4">Snippet Review</th>
                  <th className="px-5 py-4">Trust Ratio</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-950/40 transition-colors">
                    
                    {/* Security Flag */}
                    <td className="px-5 py-4">
                      {rev.isFake ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wide border border-rose-500/20">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Fake</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Organic</span>
                        </span>
                      )}
                    </td>

                    {/* Reviewer */}
                    <td className="px-5 py-4 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{rev.reviewerName}</span>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-5 py-4 text-slate-400 font-mono">
                      {rev.productName}
                    </td>

                    {/* Passage snippet */}
                    <td className="px-5 py-4 max-w-sm">
                      <p className="truncate line-clamp-1 italic text-slate-300">&quot;{rev.reviewText}&quot;</p>
                    </td>

                    {/* Trust ratio score */}
                    <td className="px-5 py-4 font-mono font-bold">
                      <span className={rev.trustScore > 75 ? "text-emerald-400" : rev.trustScore > 40 ? "text-yellow-400" : "text-rose-400"}>
                        {rev.trustScore}%
                      </span>
                    </td>

                    {/* Detail pop and actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => setSelectedReview(rev)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded hover:border-slate-800 text-teal-400 text-xs font-bold transition-all"
                        >
                          Forensics
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => onDeleteReview(rev.id)}
                            className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition-colors"
                            title="Admin delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Pagination Bar */}
        {totalPages > 1 && (
          <div className="bg-[#0b1329] border-t border-slate-850 px-5 py-4 flex items-center justify-between">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 bg-slate-950 disabled:opacity-40 border border-slate-850 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-slate-400 text-xs">Page <strong className="text-white">{currentPage}</strong> of <strong>{totalPages}</strong></span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 bg-slate-950 disabled:opacity-40 border border-slate-850 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Forensics modal details box */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up font-sans relative">
            
            {/* Header */}
            <div className="bg-[#0b1329] px-6 py-4 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Linguistic Forensic Audit Record</h3>
              </div>
              <button 
                onClick={() => setSelectedReview(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Context bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 border border-slate-850 rounded-xl">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Reviewer</span>
                  <p className="text-xs font-bold text-white truncate mt-0.5">{selectedReview.reviewerName}</p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Tested SKU</span>
                  <p className="text-xs font-bold text-teal-400 truncate mt-0.5">{selectedReview.productName}</p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Auth Grading</span>
                  <p className="text-xs font-bold mt-0.5">
                    {selectedReview.isFake ? (
                      <span className="text-rose-400 font-bold uppercase">Deceptive</span>
                    ) : (
                      <span className="text-emerald-400 font-bold uppercase">Organic</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Date Audited</span>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(selectedReview.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Review content card */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Content Passage Analyzed</span>
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-xs text-slate-300 italic leading-relaxed font-sans">
                  &quot;{selectedReview.reviewText}&quot;
                </div>
              </div>

              {/* Advanced Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Meter gauge 1 */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl relative overflow-hidden">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Fake Confidence</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${selectedReview.fakeProbability > 50 ? "text-rose-400 animate-pulse" : "text-slate-200"}`}>{selectedReview.fakeProbability}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-rose-500 h-full" style={{ width: `${selectedReview.fakeProbability}%` }} />
                  </div>
                </div>

                {/* Meter gauge 2 */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl relative overflow-hidden">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Bot Prompt probability</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-200">{selectedReview.aiGeneratedProbability}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-teal-400 h-full" style={{ width: `${selectedReview.aiGeneratedProbability}%` }} />
                  </div>
                </div>

                {/* Meter gauge 3 */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl relative overflow-hidden">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Hate/Toxicity Indices</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-200">{selectedReview.toxicityScore}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-amber-400 h-full" style={{ width: `${selectedReview.toxicityScore}%` }} />
                  </div>
                </div>

              </div>

              {/* Keyword Highlights */}
              {selectedReview.extractedKeywords.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-2.5">Extracted Key terms</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.extractedKeywords.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-850 text-slate-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                        <Tag className="w-3 h-3 text-teal-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pattern anomalies flagged */}
              {selectedReview.isFake && selectedReview.flaggedPatterns.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Linguistic Anomaly Codes Triggered</span>
                  </span>
                  <ul className="text-xs text-rose-300 space-y-1.5 list-disc list-inside pl-1 font-semibold leading-relaxed">
                    {selectedReview.flaggedPatterns.map((pat, idx) => (
                      <li key={idx}>{pat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gemini reasoning description */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Linguistic Auditor Consensus Remarks</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-4 border border-slate-850 rounded-xl">
                  {selectedReview.suspiciousReasoning}
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#0b1329] px-6 py-4 border-t border-slate-850 flex justify-end">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-xl border border-slate-850 transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
