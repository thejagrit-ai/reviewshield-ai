import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  UploadCloud, 
  CheckCircle, 
  Flame, 
  ArrowRight, 
  MessageSquare, 
  FileText, 
  AlertTriangle,
  Info,
  Text,
  Star
} from "lucide-react";

interface ReviewAuditorProps {
  onAnalyze: (reviews: Array<{ reviewerName: string; rating: number; reviewText: string; productName: string }>) => Promise<void>;
  isAnalyzing: boolean;
}

const presets = [
  {
    title: "AI Bot Review",
    product: "ApexFit Watch 3",
    rating: 5,
    author: "DeceivedBot88",
    icon: Sparkles,
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    text: "I am absolutely delighted and thrilled with this premium wrist technology masterpiece. The exquisite bezel matches perfectly with organic styles. Operating system runs spectacularly smoothly and battery lifespan is extremely magnificent. I highly recommend purchasing this item with absolute confidence, worth every single penny spent!"
  },
  {
    title: "Competitor Smear Campaign",
    product: "SonicBlast Wireless Buds",
    rating: 1,
    author: "AggressedCompetitor",
    icon: Flame,
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    text: "This product is a total scam. Complete rubbish materials, the charger case literally exploded on my table. Absolute fraud company that pays for good metrics. Green battery drops to zero instantly. DO NOT BUY this trash!"
  },
  {
    title: "Genuine Customer Feedback",
    product: "BrewPerfect Pro",
    rating: 4,
    author: "HumbleUser",
    icon: MessageSquare,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    text: "Decent auto coffee maker for the price. Programming buttons were a bit tricky to memorize at first but now it works well. Coffee filters can bleed slightly if overfilled. Satisfied with overall extraction speed."
  }
];

export default function ReviewAuditor({ onAnalyze, isAnalyzing }: ReviewAuditorProps) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [manualText, setManualText] = useState("");
  const [rating, setRating] = useState(5);
  const [productName, setProductName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "idle" | "success" | "error"; text: string }>({ type: "idle", text: "" });
  const [loadedFromCSV, setLoadedFromCSV] = useState<Array<{ name: string; text: string; rating: number; product: string }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetSelect = (text: string, rating: number, prod: string, author: string) => {
    setManualText(text);
    setRating(rating);
    setProductName(prod);
    setAuthorName(author);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    const reviewPayload = [
      {
        reviewerName: authorName.trim() || "Verified Buyer",
        rating: rating,
        reviewText: manualText.trim(),
        productName: productName.trim() || "General Merchandise SKU"
      }
    ];

    await onAnalyze(reviewPayload);
  };

  // CSV Drag/Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCSVContent = (text: string) => {
    try {
      const lines = text.split("\n");
      const results: Array<{ name: string; text: string; rating: number; product: string }> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Basic CSV splitting safely
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 2) continue;

        const ratingVal = parseInt(matches[0]?.replace(/^"|"$/g, "")) || 5;
        const authorVal = matches[1]?.replace(/^"|"$/g, "") || "Imported Buyer";
        const reviewText = matches[2]?.replace(/^"|"$/g, "") || line;
        const prodVal = matches[3]?.replace(/^"|"$/g, "") || "Imported Product";

        results.push({
          name: authorVal,
          text: reviewText,
          rating: ratingVal,
          product: prodVal
        });
      }

      if (results.length === 0) {
        throw new Error("No readable records identified. Ensure CSV columns matches layout.");
      }

      setLoadedFromCSV(results);
      setUploadStatus({
        type: "success",
        text: `Staged ${results.length} listing reviews successfully. Ready to trigger AI pattern checking.`
      });
    } catch (err: any) {
      setUploadStatus({
        type: "error",
        text: err.message || "Column misalignment detected. Columns must be: Rating, Reviewer, Review, Product"
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            parseCSVContent(event.target.result as string);
          }
        };
        reader.readAsText(file);
      } else {
        setUploadStatus({ type: "error", text: "Invalid file format. Please upload a standardized .csv file." });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseCSVContent(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerCSVSubmit = async () => {
    if (loadedFromCSV.length === 0) return;
    const arrayPayload = loadedFromCSV.map(item => ({
      reviewerName: item.name,
      rating: item.rating,
      reviewText: item.text,
      productName: item.product
    }));

    await onAnalyze(arrayPayload);
    setLoadedFromCSV([]);
    setUploadStatus({ type: "idle", text: "" });
  };

  const [lastPreview, setLastPreview] = useState<null | { reviewerName: string; rating: number; reviewText: string; productName: string }>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-sans">
      
      {/* Centered Introductory Vibe */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Inspect Review Authenticity</h3>
        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Paste a single review or upload a listing CSV to detect inauthentic feedback, AI-generated text, and targeted smear campaigns — fast, reliable, and explainable.
        </p>
      </div>

      {/* Mode Select Tabs */}
      <div className="flex justify-center">
        <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex gap-1">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "single" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Text className="w-3.5 h-3.5" />
            <span>Single Review Paste</span>
          </button>
          
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "bulk" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Bulk CSV Upload</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      {activeTab === "single" ? (
        
        /* SINGLE REVIEW PASTE LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card bg-slate-900/40 border-slate-800 p-6 md:p-8 shadow-2xl relative">
          
          <form onSubmit={handleManualSubmit} className="space-y-6">
            
            {/* Upper Config Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Product Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. ApexFit Watch 3"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 placeholder-slate-650"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Reviewer Identity</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 placeholder-slate-650"
                />
              </div>
            </div>

            {/* Star selector */}
              <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Reviewer Star Score</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      rating === star 
                        ? "bg-teal-500 text-slate-950 border-teal-500 shadow-inner" 
                        : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <span>{star}</span>
                    <Star className={`w-3.5 h-3.5 ${rating === star ? "fill-slate-950" : ""}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Massive centered input */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Review Text Content</label>
              <textarea
                placeholder="Type or paste the product review copy here to run forensic scans..."
                rows={6}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 resize-none font-sans leading-relaxed placeholder-slate-650 shadow-inner"
                required
              />
            </div>

            {/* Core Run Button */}
            <button
              type="submit"
              disabled={isAnalyzing || !manualText.trim() || !productName.trim()}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.01]"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 00 12 5.373 12 12H4z"></path>
                  </svg>
                  <span>Deconstruction Language Patterns...</span>
                </>
              ) : (
                <>
                  <span>Conduct Forensic Analysis</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview / Explanation Panel */}
        <div className="lg:col-span-1">
          <div className="card bg-slate-900/40 p-4 border-slate-800">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">Preview & Explanation</div>
            {!lastPreview ? (
              <div className="mt-4 text-sm text-slate-300">After you run an analysis, a concise explanation and risk indicators will appear here, including fake-probability, AI-generation score, and suggested actions.</div>
            ) : (
              <div className="mt-4">
                <div className="text-sm font-bold text-white">{lastPreview.productName}</div>
                <div className="text-[12px] text-slate-400 mt-1">By {lastPreview.reviewerName} — Rating: {lastPreview.rating}</div>
                <div className="mt-3 text-xs text-slate-300 italic">"{lastPreview.reviewText.slice(0, 160)}{lastPreview.reviewText.length>160? '...' : '' }"</div>
                <div className="mt-4 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between"><span>Fake Probability</span><strong className="text-rose-400">—%</strong></div>
                  <div className="flex items-center justify-between"><span>AI Generated Score</span><strong className="text-amber-400">—%</strong></div>
                  <div className="flex items-center justify-between"><span>Trust Score</span><strong className="text-emerald-400">—</strong></div>
                </div>
              </div>
            )}
            <div className="mt-4 text-[11px] text-slate-400">Tip: Use the presets to quickly simulate common cases, or upload a CSV for batch processing.</div>
          </div>
        </div>

      ) : (
        
        /* BULK CSV IMPORT LAYOUT */
        <div className="card bg-slate-900/40 border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
          
          <div className="max-w-xl">
            <h4 className="text-base font-bold text-white">Import Marketplace Sheets</h4>
            <p className="text-xs text-slate-400 leading-normal mt-1">
              Supports bulk listing files directly. Ensure your CSV contains columns equivalent to **Rating, Reviewer, Review, and Product** as header keys.
            </p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-64 ${
              dragActive 
                ? "border-teal-400 bg-teal-500/5 shadow-inner" 
                : "border-slate-800 bg-slate-950 hover:bg-slate-900/60"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
            <div className="bg-teal-500/10 text-teal-400 p-4 rounded-2xl border border-teal-500/20 mb-4 animate-bounce-slow">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-white">Drag and drop rating CSV or click to browse</p>
            <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Supports large listings up to 10,000 rows</p>
          </div>

          {/* Import alerts */}
          {uploadStatus.type !== "idle" && (
            <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
              uploadStatus.type === "success" 
                ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-300 animate-fade-in" 
                : "bg-rose-500/15 border-rose-500/20 text-rose-300 animate-fade-in"
            }`}>
              {uploadStatus.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />}
              <span className="flex-1 font-semibold">{uploadStatus.text}</span>
            </div>
          )}

          {/* Core CSV processing trigger */}
          {loadedFromCSV.length > 0 && (
            <button
              onClick={triggerCSVSubmit}
              disabled={isAnalyzing}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 font-extrabold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              {isAnalyzing ? (
                <span>Filtering Listing Rows...</span>
              ) : (
                <>
                  <span>Process {loadedFromCSV.length} Synced Listing Rows</span>
                  <FileText className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          )}

        </div>
      )}

      {/* Placeholders presets list */}
      <div className="space-y-4 pt-4 border-t border-slate-900">
        <div className="flex items-center gap-2 text-slate-300 font-extrabold text-xs uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Quick Demo Presets: Fill in with 1-Click</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((tpl, idx) => {
            const IconComp = tpl.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(tpl.text, tpl.rating, tpl.product, tpl.author)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-850 p-4 rounded-xl text-left transition-all relative group text-xs cursor-pointer block"
              >
                <div className="flex items-center justify-between gap-1.5 font-bold text-white mb-2">
                  <span className="truncate">{tpl.title}</span>
                  <span className={`px-2 py-0.5 border rounded text-[9px] font-mono ${tpl.badgeColor}`}>
                    {tpl.product.split(" ")[0]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed">&quot;{tpl.text}&quot;</p>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
