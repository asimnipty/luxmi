import { useState, useEffect } from "react";
import { VideoItem } from "../types";
import { Play, Calendar, Clock, Film, Youtube, Search, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface VideoHubProps {
  videos: VideoItem[];
  onNavigateTab: (tab: string) => void;
  targetVideoUrl?: string;
  clearTargetVideoUrl: () => void;
}

export default function VideoHub({ videos, onNavigateTab, targetVideoUrl, clearTargetVideoUrl }: VideoHubProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(videos[0] || {} as VideoItem);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync selected video if dynamic load updates the videos list
  useEffect(() => {
    if (videos.length > 0 && (!selectedVideo || !selectedVideo.id)) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);

  // Reset play state when video selection changes
  useEffect(() => {
    setIsPlaying(false);
  }, [selectedVideo]);

  // Hook to handle deep navigation from Recipes or Crafts list
  useEffect(() => {
    if (targetVideoUrl && videos.length > 0) {
      // Find matching mock video based on URL
      // (For this prototype, we cross-reference index tags or use fallback)
      const isCraft = targetVideoUrl.includes("craft");
      const matched = videos.find(v => {
        if (isCraft) return v.category === "Handicraft" && targetVideoUrl.includes(v.id.replace("vid_", ""));
        return v.category === "Culinary" && targetVideoUrl.includes(v.id.replace("vid_", ""));
      });

      if (matched) {
        setSelectedVideo(matched);
      } else {
        // Fallback to first matching category
        const fallback = videos.find(v => isCraft ? v.category === "Handicraft" : v.category === "Culinary");
        if (fallback) setSelectedVideo(fallback);
      }
      clearTargetVideoUrl();
    }
  }, [targetVideoUrl, videos]);

  // Filtering
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase()) || 
                          video.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || video.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full inline-block">Interactive Learning</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-950">Luxmi's Video Workshop</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Watch comprehensive step-by-step videos. Master traditional kitchen kneading, intricate vegetable cuts, or clay paint detailing.
        </p>
      </div>

      {/* Main Player Area */}
      <div id="video-theater" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Top: Interactive Active Player */}
        <div className="lg:col-span-2 space-y-5">
          <div 
            className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-950 shadow-md border border-stone-800 relative group"
          >
            {isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0 rounded-2xl"
              />
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center relative flex flex-col justify-between p-6 md:p-8 text-white"
                style={{ 
                  backgroundImage: selectedVideo.thumbnail ? `linear-gradient(to top, rgba(12, 10, 9, 0.95) 0%, rgba(12, 10, 9, 0.4) 40%, rgba(12, 10, 9, 0.65) 100%), url(${selectedVideo.thumbnail})` : 'none' 
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Youtube className="w-3 h-3 fill-white" />
                    <span>Interactive Workshop</span>
                  </span>
                  <span className="text-xs font-mono text-stone-300 flex items-center gap-1 bg-stone-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{selectedVideo.duration} mins</span>
                  </span>
                </div>

                {/* Central Play Trigger */}
                <div className="self-center flex flex-col items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer border-none"
                  >
                    <Play className="w-8 h-8 fill-white ml-1 text-white" />
                  </button>
                  <span className="text-[11.5px] uppercase tracking-widest text-stone-200 font-mono font-bold bg-stone-950/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-stone-800/60 shadow">
                    Click to Play Inline
                  </span>
                </div>

                {/* Title Overlay info */}
                <div className="space-y-1">
                  <p className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">{selectedVideo.category} Masterclass</p>
                  <h3 className="font-serif text-lg md:text-xl font-bold tracking-tight leading-tight">
                    {selectedVideo.title}
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Video Metadata / details */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-stone-950">{selectedVideo.title}</h3>
                <div className="flex items-center gap-3 text-xs text-stone-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-300" />
                    <span>Uploaded: {selectedVideo.publishDate}</span>
                  </span>
                  <span>•</span>
                  <span>Category: {selectedVideo.category}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://www.youtube.com/@Luxmisculinary`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
              {selectedVideo.description}
            </p>

            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/30 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-stone-600 leading-normal">
                <strong>Course Note:</strong> Pair this video tutorial with the text steps located inside our <button onClick={() => onNavigateTab(selectedVideo.category === "Culinary" ? "recipes" : "crafts")} className="text-amber-800 font-bold underline hover:text-amber-900 cursor-pointer">{selectedVideo.category === "Culinary" ? "Recipes Archive" : "Handicrafts Hub"}</button> to view ingredient quantities or stencil designs.
              </p>
            </div>
          </div>

          {/* Slogan line & Slicing/Sliding Thumb-line Carousel (Dynamic visual thumbnails from the youtube channel) */}
          <div className="bg-gradient-to-br from-amber-50/30 to-stone-50/60 p-5 rounded-2xl border border-stone-200/50 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">Featured Slogan</span>
                <h4 className="text-xs font-serif font-bold text-stone-900 italic leading-snug">
                  "Always hand-kneaded, always hand-crafted"
                </h4>
              </div>
              <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0">
                Official Tagline
              </span>
            </div>

            <div className="border-t border-stone-200/40 pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                  Visual Thumb-Line (Click to Quick-Load)
                </p>
                <span className="text-[9px] font-mono text-stone-400 animate-pulse">
                  Swipe or Scroll &rarr;
                </span>
              </div>
              
              {/* Horizontal Scroll Line of Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-2.5 scrollbar-thin scrollbar-thumb-amber-200/60 scrollbar-track-stone-100/60">
                {videos.map((v) => {
                  const isCurrent = v.id === selectedVideo.id;
                  return (
                    <button
                      key={`thumbline_${v.id}`}
                      onClick={() => setSelectedVideo(v)}
                      className={`flex-none w-36 text-left group transition-all focus:outline-none cursor-pointer ${
                        isCurrent ? "scale-95 opacity-90" : "hover:scale-[1.02]"
                      }`}
                    >
                      <div className={`aspect-video w-full rounded-lg bg-stone-950 relative overflow-hidden mb-2 shadow-sm border ${
                        isCurrent ? "border-amber-600 ring-2 ring-amber-500/40" : "border-stone-200"
                      }`}>
                        {v.thumbnail && (
                          <img 
                            src={v.thumbnail} 
                            alt={v.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/5 transition-colors" />
                        <div className="absolute bottom-1 right-1 bg-stone-950/85 px-1 py-0.5 rounded text-[8px] font-mono text-white font-semibold">
                          {v.duration}
                        </div>
                        {isCurrent && (
                          <div className="absolute inset-0 bg-amber-900/40 flex items-center justify-center">
                            <span className="bg-amber-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              PLAYING
                            </span>
                          </div>
                        )}
                      </div>
                      <h6 className={`text-[10px] font-serif font-bold line-clamp-2 leading-tight ${
                        isCurrent ? "text-amber-800 font-extrabold" : "text-stone-700 group-hover:text-amber-700 transition-colors"
                      }`}>
                        {v.title}
                      </h6>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Playlist Selection */}
        <div className="bg-white rounded-2xl border border-stone-200 flex flex-col h-[650px] overflow-hidden shadow-sm">
          
          {/* Header search inside playlist */}
          <div className="p-4 bg-stone-50 border-b border-stone-100 shrink-0 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">Workshop Playlist</h4>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search tutorials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-stone-200 focus:outline-none focus:border-amber-500 rounded-lg text-xs"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All</option>
                <option value="Culinary">Food</option>
                <option value="Handicraft">Craft</option>
              </select>
            </div>
          </div>

          {/* Scrollable list item stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredVideos.map((video) => {
              const isActive = video.id === selectedVideo.id;
              return (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors group cursor-pointer ${
                    isActive 
                      ? "bg-amber-50/50 hover:bg-amber-50" 
                      : "hover:bg-stone-50/40"
                  }`}
                >
                  {/* Miniature Box */}
                  <div className={`w-16 h-12 rounded-lg bg-stone-900 shrink-0 relative overflow-hidden shadow-sm border border-stone-100 ${
                    isActive ? "ring-2 ring-amber-500" : ""
                  }`}>
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-opacity"
                      />
                    ) : (
                      <Film className="w-4 h-4 text-stone-500 absolute inset-0 m-auto" />
                    )}
                    <Play className={`w-3.5 h-3.5 absolute inset-0 m-auto fill-white ${isActive ? "text-amber-500 scale-110" : "text-white opacity-0 group-hover:opacity-100 transition-opacity"}`} />
                  </div>

                  {/* Text Title */}
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wide">
                      {video.category} • {video.duration}m
                    </p>
                    <h5 className={`text-xs font-serif font-bold truncate leading-tight ${isActive ? "text-amber-800 font-extrabold" : "text-stone-800 group-hover:text-amber-800"}`}>
                      {video.title}
                    </h5>
                    <p className="text-[10px] text-stone-400 truncate leading-snug">
                      {video.description}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredVideos.length === 0 && (
              <div className="p-8 text-center text-stone-400 text-xs">
                No videos found matching your filters.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
