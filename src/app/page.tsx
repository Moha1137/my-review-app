"use client";
import { useState, useRef, useEffect } from "react";

type MediaType = "book" | "manga" | "movie" | "tv";

export default function Home() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("manga");
  
  const [showReview, setShowReview] = useState(true);
  const [showSynopsis, setShowSynopsis] = useState(false);
  const [spoilerMode, setSpoilerMode] = useState(false);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const toggleSpoiler = () => {
    if (!spoilerMode) {
      const confirmSpoiler = window.confirm("Are you sure you want to be spoiled?");
      if (confirmSpoiler) setSpoilerMode(true);
    } else {
      setSpoilerMode(false);
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          type, 
          mode: showSynopsis ? "detailed" : "simple", 
          spoiler: spoilerMode, 
          pro: true 
        }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData({ ...json, title });
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (data && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }, 100);
    }
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#C5C5C5] p-4 font-sans relative overflow-x-hidden">
      
      {/* Animated purple blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute animate-blob-1"
          style={{ 
            top: '15%',
            left: '20%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(130, 120, 200, 0.9) 0%, rgba(130, 120, 200, 0.4) 40%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform'
          }}
        />
        
        <div
          className="absolute animate-blob-2"
          style={{ 
            top: '0',
            right: '5%',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(160, 150, 240, 0.8) 0%, rgba(160, 150, 240, 0.35) 40%, transparent 70%)',
            filter: 'blur(70px)',
            willChange: 'transform'
          }}
        />

        <div
          className="absolute animate-blob-3"
          style={{ 
            bottom: '5%',
            left: '0',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(140, 130, 220, 0.85) 0%, rgba(140, 130, 220, 0.4) 40%, transparent 70%)',
            filter: 'blur(70px)',
            willChange: 'transform'
          }}
        />
      </div>

      {/* Header */}
      <header className="w-full text-center pt-4 md:pt-4 pb-2 z-10">
        <h1 className="text-2xl md:text-4xl tracking-wide text-[#333333]" style={{ fontFamily: "'BlueRabbit', sans-serif" }}>
          reevyou
        </h1>
      </header>

      <main className="w-full max-w-3xl flex flex-col items-center z-10 mt-6 md:mt-8">
        
        <div className="text-center mt-40 mb-12 md:mb-10 space-y-2 px-4">
          <h2 className="font-serif text-4xl md:text-6xl text-white drop-shadow-sm tracking-wider leading-tight" style={{ fontFamily: "'Abril Fatface', 'DM Serif Display', serif" }}>
            GET HONEST REVIEWS!
          </h2>
          <p className="text-white text-base md:text-lg font-light tracking-wide opacity-95">
            Enter title below to generate synopsis
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-20 mb-3 w-full px-2">
          <button
            type="button"
            onClick={() => setShowReview(!showReview)}
            className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-200 ${
              showReview ? "bg-[#2a2a2a] text-white shadow-md scale-105" : "bg-[#6B6B6B]/50 text-white/90 hover:bg-[#6B6B6B]/70"
            }`}
          >
            Review
          </button>
          
          <button
            type="button"
            onClick={() => setShowSynopsis(!showSynopsis)}
            className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-200 ${
              showSynopsis ? "bg-[#2a2a2a] text-white shadow-md scale-105" : "bg-[#6B6B6B]/50 text-white/90 hover:bg-[#6B6B6B]/70"
            }`}
          >
            Synopsis
          </button>

          <button
            type="button"
            onClick={toggleSpoiler}
            className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-200 ${
              spoilerMode ? "bg-[#2a2a2a] text-white border border-white/20 shadow-md scale-105" : "bg-[#6B6B6B]/50 text-white/90 hover:bg-[#6B6B6B]/70"
            }`}
          >
            Spoiler
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="w-full max-w-xl bg-[#58585a] rounded-full p-1.5 pl-4 md:pl-6 flex items-center shadow-xl transition-all hover:shadow-2xl mb-12"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="Enter Title..."
            className="flex-grow bg-transparent text-white placeholder-gray-300/80 outline-none text-base md:text-lg font-normal tracking-wide min-w-0"
            disabled={loading}
          />
          
          <div className="flex items-center gap-2 pr-1 shrink-0">
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MediaType)}
                className="appearance-none bg-[#d1d1d1] text-[#333] font-bold py-2 pl-3 pr-7 md:pl-4 md:pr-8 rounded-full cursor-pointer hover:bg-white transition outline-none text-xs md:text-sm"
                disabled={loading}
              >
                <option value="book">Book</option>
                <option value="manga">Manga</option>
                <option value="movie">Movie</option>
                <option value="tv">TV</option>
              </select>
              <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`bg-[#d1d1d1] rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-[#333] hover:bg-white hover:scale-105 transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="w-full max-w-xl text-red-600 bg-red-100 px-6 py-3 rounded-xl shadow-sm animate-fade-in font-medium mb-6">
            {error}
          </div>
        )}

        {data && (
          <div 
            ref={resultsRef}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl animate-pop-in text-gray-800 border border-white/40 mb-20 transition-all duration-500 ease-in-out"
          >
            <div className="flex justify-between items-start mb-6 border-b border-gray-200/60 pb-6">
              <div className="pr-4">
                <span className="uppercase text-xs font-bold tracking-widest text-gray-500 mb-2 block">
                  {type} Result
                </span>
                <h3 className="text-2xl md:text-4xl font-serif text-gray-900 leading-tight break-words">
                  {data.title || title}
                </h3>
              </div>
              <div className="flex flex-col items-center bg-gray-100 px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl shadow-inner min-w-[70px] md:min-w-[100px] text-center shrink-0">
                <span className="text-base md:text-lg font-bold text-gray-800 leading-tight">
                  {data.rating || "N/A"}
                </span>
                <span className="text-[8px] md:text-[10px] uppercase text-gray-500 font-bold tracking-wider mt-1">Score</span>
              </div>
            </div>

            {showReview && (
              <div className="mb-8 animate-fade-in">
                <h4 className="font-bold text-xs uppercase text-gray-400 mb-3 tracking-widest">Verdict (Review)</h4>
                <p className="text-lg md:text-xl font-medium italic text-gray-700 leading-relaxed border-l-4 border-[#8278C8] pl-4">
                  "{data.consensus || "No consensus provided."}"
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                   <div className="bg-green-50/80 p-5 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-xs uppercase text-green-800 mb-4 tracking-widest flex items-center gap-2">
                       Hits
                    </h4>
                    <ul className="space-y-3">
                      {Array.isArray(data.themes) && data.themes.slice(0, 3).map((pro: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2.5">
                          <span className="text-green-500 mt-1.5 text-xs shrink-0">●</span>
                          <span className="leading-snug">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50/80 p-5 rounded-2xl border border-red-100">
                    <h4 className="font-bold text-xs uppercase text-red-800 mb-4 tracking-widest flex items-center gap-2">
                       Misses
                    </h4>
                    <ul className="space-y-3">
                       <li className="text-sm text-gray-500">No major misses highlighted.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {showSynopsis && (
              <div className="mb-8 border-t border-gray-200/60 pt-8 animate-fade-in">
                <h4 className="font-bold text-xs uppercase text-gray-400 mb-3 tracking-widest">Synopsis</h4>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg font-light">{data.summary}</p>
                
                {Array.isArray(data.character_insights) && (
                  <div className="mt-6">
                     <h5 className="font-bold text-xs uppercase text-gray-400 mb-2 tracking-widest">Character Insights</h5>
                     <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                        {data.character_insights.slice(0, 3).map((c:string, i:number) => <li key={i}>{c}</li>)}
                     </ul>
                  </div>
                )}
              </div>
            )}

            {spoilerMode && (
              <div className="mb-8 border-t border-red-200/60 pt-8 animate-fade-in bg-red-50/30 p-4 rounded-xl border border-red-100">
                <h4 className="font-bold text-xs uppercase text-red-500 mb-3 tracking-widest flex items-center gap-2">
                  ⚠️ Spoilers
                </h4>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {data.spoilers || "No spoilers generated. Try requesting again with Spoiler mode active."}
                </p>
              </div>
            )}

            {Array.isArray(data.citations) && data.citations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200/60">
                <h4 className="font-bold text-xs uppercase text-gray-400 mb-3 tracking-widest">Sources</h4>
                <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1 break-all">
                  {data.citations.map((u: string, i: number) => (
                    <li key={i}>
                      {/^https?:\/\//i.test(u) ? (
                        <a className="underline hover:text-gray-500" href={u} target="_blank" rel="noreferrer">{u}</a>
                      ) : (
                        <span className="text-gray-500">{u}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-4 text-center w-full pointer-events-none z-0">
      </footer>
    </div>
  );
}
