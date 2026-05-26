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
  Text,
  Star,
  ShieldCheck,
  Bot,
  Swords,
  User,
} from "lucide-react";

interface ReviewAuditorProps {
  onAnalyze: (
    reviews: Array<{
      reviewerName: string;
      rating: number;
      reviewText: string;
      productName: string;
    }>
  ) => Promise<void>;
  isAnalyzing: boolean;
}

const presets = [
  {
    title: "AI Bot Review",
    product: "ApexFit Watch 3",
    rating: 5,
    author: "DeceivedBot88",
    icon: Bot,
    accentClass: "border-l-teal-500",
    badgeBg: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    text: "I am absolutely delighted and thrilled with this premium wrist technology masterpiece. The exquisite bezel matches perfectly with organic styles. Operating system runs spectacularly smoothly and battery lifespan is extremely magnificent. I highly recommend purchasing this item with absolute confidence, worth every single penny spent!",
  },
  {
    title: "Smear Campaign",
    product: "SonicBlast Buds",
    rating: 1,
    author: "AggressedCompetitor",
    icon: Swords,
    accentClass: "border-l-rose-500",
    badgeBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    text: "This product is a total scam. Complete rubbish materials, the charger case literally exploded on my table. Absolute fraud company that pays for good metrics. Green battery drops to zero instantly. DO NOT BUY this trash!",
  },
  {
    title: "Genuine Feedback",
    product: "BrewPerfect Pro",
    rating: 4,
    author: "HumbleUser",
    icon: User,
    accentClass: "border-l-emerald-500",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    text: "Decent auto coffee maker for the price. Programming buttons were a bit tricky to memorize at first but now it works well. Coffee filters can bleed slightly if overfilled. Satisfied with overall extraction speed.",
  },
];

const STAR_COLORS = ["", "text-rose-400", "text-orange-400", "text-amber-400", "text-yellow-400", "text-teal-400"];

export default function ReviewAuditor({ onAnalyze, isAnalyzing }: ReviewAuditorProps) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [manualText, setManualText] = useState("");
  const [rating, setRating] = useState(5);
  const [productName, setProductName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "idle" | "success" | "error"; text: string }>({ type: "idle", text: "" });
  const [loadedFromCSV, setLoadedFromCSV] = useState<Array<{ name: string; text: string; rating: number; product: string }>>([]);
  const [lastPreview, setLastPreview] = useState<{ reviewerName: string; rating: number; reviewText: string; productName: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetSelect = (text: string, r: number, prod: string, author: string) => {
    setManualText(text);
    setRating(r);
    setProductName(prod);
    setAuthorName(author);
    setActiveTab("single");
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    const payload = [{ reviewerName: authorName.trim() || "Verified Buyer", rating, reviewText: manualText.trim(), productName: productName.trim() || "General Merchandise" }];
    setLastPreview(payload[0]);
    await onAnalyze(payload);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const parseCSVContent = (text: string) => {
    try {
      const lines = text.split("\n");
      const results: Array<{ name: string; text: string; rating: number; product: string }> = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 2) continue;
        results.push({
          rating: parseInt(matches[0]?.replace(/^"|"$/g, "")) || 5,
          name: matches[1]?.replace(/^"|"$/g, "") || "Imported Buyer",
          text: matches[2]?.replace(/^"|"$/g, "") || line,
          product: matches[3]?.replace(/^"|"$/g, "") || "Imported Product",
        });
      }
      if (results.length === 0) throw new Error("No readable records found. Check column order: Rating, Reviewer, Review, Product.");
      setLoadedFromCSV(results);
      setUploadStatus({ type: "success", text: `${results.length} reviews staged and ready for analysis.` });
    } catch (err: any) {
      setUploadStatus({ type: "error", text: err.message || "Column misalignment. Expected: Rating, Reviewer, Review, Product." });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && parseCSVContent(ev.target.result as string);
      reader.readAsText(file);
    } else {
      setUploadStatus({ type: "error", text: "Invalid format. Upload a .csv file." });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => ev.target?.result && parseCSVContent(ev.target.result as string);
    reader.readAsText(file);
  };

  const triggerCSVSubmit = async () => {
    if (!loadedFromCSV.length) return;
    await onAnalyze(loadedFromCSV.map(i => ({ reviewerName: i.name, rating: i.rating, reviewText: i.text, productName: i.product })));
    setLoadedFromCSV([]);
    setUploadStatus({ type: "idle", text: "" });
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">

      {/* ── Page Header ── */}
      <div className="mb-8 pb-6 border-b border-slate-800 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Review Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">Authenticity Auditor</h2>
          <p className="mt-1 text-sm text-slate-400 max-w-md leading-relaxed">
            Detect bot-generated reviews, smear campaigns, and inauthentic feedback using forensic language analysis.
          </p>
        </div>
        {/* Mode tabs — top-right aligned */}
        <div className="shrink-0 flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mt-1">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "single" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            <Text className="w-3.5 h-3.5" />
            Single Review
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "bulk" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Bulk CSV
          </button>
        </div>
      </div>

      {/* ── Single Review Tab ── */}
      {activeTab === "single" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — Form (3/5) */}
          <div className="lg:col-span-3">
            <form onSubmit={handleManualSubmit} className="space-y-5">

              {/* Product + Author row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ApexFit Watch 3"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-teal-500 px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-teal-500 px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Star Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`group relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                        star <= rating
                          ? "bg-slate-800 border-slate-600"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 transition-all ${
                          star <= rating
                            ? `fill-current ${STAR_COLORS[rating]}`
                            : "text-slate-700 group-hover:text-slate-500"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-semibold text-slate-300">{rating} / 5</span>
                  <span className={`ml-1 text-xs font-medium ${STAR_COLORS[rating]}`}>
                    {["", "Very negative", "Negative", "Mixed", "Positive", "Very positive"][rating]}
                  </span>
                </div>
              </div>

              {/* Review Textarea */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Review Content
                </label>
                <textarea
                  placeholder="Paste or type the full review text here..."
                  rows={7}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-teal-500 p-3.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none resize-none leading-relaxed transition-colors"
                />
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>{manualText.length} characters</span>
                  <span>{manualText.trim() ? manualText.trim().split(/\s+/).length : 0} words</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isAnalyzing || !manualText.trim() || !productName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 active:scale-[0.99] disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-3 rounded-xl transition-all text-sm cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12H4z" />
                    </svg>
                    <span>Analysing patterns...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Run Forensic Analysis</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right — Info Panel (2/5) */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Results card */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis Preview</span>
              </div>

              {!lastPreview ? (
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    After submitting a review, your forensic results will appear here — including authenticity scores, detected patterns, and recommended actions.
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Fake Probability", color: "bg-rose-500/20", width: "w-0" },
                      { label: "AI-Generated Score", color: "bg-amber-500/20", width: "w-0" },
                      { label: "Trust Index", color: "bg-teal-500/20", width: "w-0" },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                          <span>{m.label}</span>
                          <span>—</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800">
                          <div className={`h-full rounded-full ${m.color} ${m.width}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-white">{lastPreview.productName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lastPreview.reviewerName} · {lastPreview.rating}★
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 italic leading-relaxed border-l-2 border-slate-700 pl-3">
                    "{lastPreview.reviewText.slice(0, 140)}{lastPreview.reviewText.length > 140 ? "…" : ""}"
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Fake Probability", value: "—", color: "text-rose-400" },
                      { label: "AI-Generated Score", value: "—", color: "text-amber-400" },
                      { label: "Trust Index", value: "—", color: "text-teal-400" },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{m.label}</span>
                        <span className={`font-bold ${m.color}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tip card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="text-teal-400 font-semibold">Tip:</span> Use the demo presets below to instantly populate the form with known patterns — bot review, smear campaign, or genuine feedback.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ── Bulk CSV Tab ── */}
      {activeTab === "bulk" && (
        <div className="max-w-2xl space-y-5">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Import Marketplace Sheet</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a CSV with columns in order: <span className="text-slate-300 font-medium">Rating, Reviewer, Review, Product</span>. Supports up to 10,000 rows.
            </p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center gap-3 ${
              dragActive ? "border-teal-500 bg-teal-500/5" : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv" className="hidden" />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              dragActive ? "bg-teal-500/15 border-teal-500/30 text-teal-400" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}>
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Drop your CSV here, or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">Only .csv files are accepted</p>
            </div>
          </div>

          {uploadStatus.type !== "idle" && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs leading-relaxed ${
              uploadStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}>
              {uploadStatus.type === "success"
                ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{uploadStatus.text}</span>
            </div>
          )}

          {loadedFromCSV.length > 0 && (
            <button
              onClick={triggerCSVSubmit}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-3 rounded-xl transition-all text-sm cursor-pointer"
            >
              {isAnalyzing ? (
                <span>Processing rows...</span>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Analyse {loadedFromCSV.length} Reviews</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Demo Presets ── */}
      <div className="mt-10 pt-6 border-t border-slate-800/60 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick Demo Presets</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((tpl, idx) => {
            const Icon = tpl.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(tpl.text, tpl.rating, tpl.product, tpl.author)}
                className={`group text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer border-l-2 ${tpl.accentClass}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                    <span className="text-xs font-bold text-white">{tpl.title}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${tpl.badgeBg}`}>
                    {tpl.rating}★
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 group-hover:text-slate-400 line-clamp-2 leading-relaxed transition-colors">
                  {tpl.text}
                </p>
                <p className="mt-2 text-[10px] text-slate-600">{tpl.product}</p>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
