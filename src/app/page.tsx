"use client";
import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"book" | "manga" | "movie" | "tv">("manga");
  const [mode, setMode] = useState<"simple" | "detailed">("simple");
  const [pro, setPro] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, mode, pro }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setTitle("");
    setType("manga");
    setMode("simple");
    setData(null);
    setError(null);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-brand text-accent">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-brand/95 backdrop-blur-sm border-b-4 border-accent">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            <div className="size-8 text-accent group-hover:rotate-12 transition-transform">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">NOBIX</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-28 pb-40 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {!data && !error && (
            <div className="flex flex-col items-center text-center pt-16 animate-in fade-in zoom-in duration-500">
              <div className="mb-6 size-16 p-2 rounded-full border-4 border-accent">
                <svg className="size-full" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
                </svg>
              </div>
              <h2 className="text-4xl font-headline font-bold mb-4">Get an honest review</h2>
              <p className="text-lg font-body opacity-80">Enter a title below to generate an AI-powered synopsis</p>
            </div>
          )}

          {/* User Input Message */}
          {(data || error) && (
            <div className="flex items-start gap-4 p-4 animate-in slide-in-from-bottom-2 duration-300">
              <p className="font-bold text-lg pt-2 min-w-[80px]">[ You ]</p>
              <p className="text-lg leading-relaxed flex-1 font-medium">{title} ({type})</p>
            </div>
          )}

          {/* AI Response - Success */}
          {data && !error && (
            <div className="flex items-start gap-4 p-4 animate-in slide-in-from-bottom-2 duration-300">
              <p className="font-bold text-lg pt-2 min-w-[80px]">[ AI ]</p>
              <div className="flex-1 bg-accent text-highlight p-6 rounded-2xl border-4 border-accent shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
                <div className="space-y-4">
                  <div className="border-b-2 border-highlight/20 pb-3">
                    <p className="text-sm font-body uppercase tracking-wider opacity-70">{type}</p>
                    <h2 className="text-2xl font-headline font-bold mt-2">{title}</h2>
                  </div>
                  <p className="text-base leading-relaxed opacity-90">{data.summary}</p>
                  
                  {data.genres && data.genres.length > 0 && (
                    <div>
                      <p className="text-sm font-bold uppercase mb-2">Genres:</p>
                      <div className="flex gap-2 flex-wrap">
                        {data.genres.slice(0, 3).map((g: string) => (
                          <span key={g} className="bg-brand text-accent px-3 py-1 rounded-full text-xs font-bold border-2 border-accent">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {data.themes && data.themes.length > 0 && (
                    <div>
                      <p className="text-sm font-bold uppercase mb-2">Themes:</p>
                      <div className="flex gap-2 flex-wrap">
                        {data.themes.slice(0, 3).map((t: string) => (
                          <span key={t} className="bg-highlight/20 text-highlight px-3 py-1 rounded-full text-xs border border-highlight/40">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.consensus && (
                    <div className="pt-4 border-t-2 border-highlight/20">
                      <p className="text-sm font-bold uppercase mb-2">What people say:</p>
                      <p className="text-sm opacity-80">{data.consensus}</p>
                    </div>
                  )}

                  {Array.isArray(data.citations) && data.citations.length > 0 && (
                    <div className="pt-4">
                      <p className="text-sm font-bold uppercase mb-2">Sources:</p>
                      <ul className="list-disc ml-6 text-sm opacity-80 space-y-1">
                        {data.citations.slice(0, 3).map((u: string) => (
                          <li key={u}>
                            <a className="underline hover:opacity-60" href={u} target="_blank" rel="noreferrer">
                              {u}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Response - Error */}
          {error && (
            <div className="flex items-start gap-4 p-4 animate-in slide-in-from-bottom-2 duration-300">
              <p className="font-bold text-lg pt-2 min-w-[80px]">[ AI ]</p>
              <div className="flex-1 bg-accent/10 border-4 border-dashed border-accent p-6 rounded-2xl">
                <p className="font-body text-accent">Error: {error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-start gap-4 p-4 animate-pulse">
              <p className="font-bold text-lg pt-2 min-w-[80px]">[ AI ]</p>
              <div className="flex items-center gap-1 pt-3">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Input Form */}
      <footer className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 mb-2">
          <form 
            onSubmit={onSubmit}
            className="bg-brand p-2 rounded-full border-4 border-accent shadow-[6px_6px_0px_#000000] transition-transform focus-within:-translate-y-1"
          >
            <div className="flex items-center gap-2">
              <input 
                className="flex-1 bg-transparent text-lg font-body placeholder:text-accent/60 focus:outline-none px-4 py-2" 
                placeholder={loading ? "Analyzing..." : "Enter title (e.g., Naruto)"}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
              <select
                className="bg-accent text-highlight font-body text-sm px-3 py-2 rounded-full border-2 border-accent focus:outline-none"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                disabled={loading}
              >
                <option value="book">Book</option>
                <option value="manga">Manga</option>
                <option value="movie">Movie</option>
                <option value="tv">TV</option>
              </select>
              <button 
                type="submit"
                disabled={loading || !title.trim()}
                className="flex items-center justify-center size-12 shrink-0 rounded-full bg-accent text-brand hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-2xl"
              >
                {loading ? "⟳" : "↑"}
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
