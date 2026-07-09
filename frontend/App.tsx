import { useState, useEffect } from "react";
import Header from "./components/Header";
import RecipeArchive from "./components/RecipeArchive";
import CraftShowcase from "./components/CraftShowcase";
import VideoHub from "./components/VideoHub";
import BlogSection from "./components/BlogSection";
import AiAssistant from "./components/AiAssistant";
import { Heart, Youtube, ExternalLink, Sparkles, ChefHat, Scissors, Film, BookOpen } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("recipes");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [targetVideoUrl, setTargetVideoUrl] = useState<string | undefined>(undefined);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("luxmi_favs");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Could not parse favorites:", e);
    }
  }, []);

  // Handle toggling favorites
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) 
        ? prev.filter((item) => item !== id) 
        : [...prev, id];
      
      try {
        localStorage.setItem("luxmi_favs", JSON.stringify(updated));
      } catch (e) {
        console.error("Could not save favorites:", e);
      }
      return updated;
    });
  };

  // Safe navigation directly into the video hub
  const handleGoToVideo = (youtubeUrl: string) => {
    setTargetVideoUrl(youtubeUrl);
    setActiveTab("videos");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-stone-50/30 text-stone-900 selection:bg-amber-100 selection:text-amber-900 flex flex-col">
      {/* Brand Header & Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        favoritesCount={favorites.length} 
      />

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {activeTab === "recipes" && (
          <RecipeArchive 
            onToggleFavorite={handleToggleFavorite} 
            favorites={favorites} 
            activeTab={activeTab}
            onGoToVideo={handleGoToVideo}
          />
        )}

        {activeTab === "crafts" && (
          <CraftShowcase 
            onToggleFavorite={handleToggleFavorite} 
            favorites={favorites} 
            onGoToVideo={handleGoToVideo}
          />
        )}

        {activeTab === "videos" && (
          <VideoHub 
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            targetVideoUrl={targetVideoUrl}
            clearTargetVideoUrl={() => setTargetVideoUrl(undefined)}
          />
        )}

        {activeTab === "blog" && (
          <BlogSection />
        )}

        {activeTab === "assistant" && (
          <AiAssistant />
        )}
      </main>

      {/* Channel-branded visual Footer */}
      <footer id="app-footer" className="bg-white border-t border-stone-100 mt-20 py-12 px-4 sm:px-6 lg:px-8 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-stone-950">Luxmi's Culinary & Crafts</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              An offline-first aesthetic companion platform celebrating traditional culinary art and sustainable craft tutorials. 
              Always hand-kneaded, always hand-crafted.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">Hub Quick Links</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => { setActiveTab("recipes"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-stone-500 hover:text-amber-700 text-left transition-colors flex items-center gap-1"><ChefHat className="w-3.5 h-3.5 text-stone-400" />Recipes</button>
              <button onClick={() => { setActiveTab("crafts"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-stone-500 hover:text-amber-700 text-left transition-colors flex items-center gap-1"><Scissors className="w-3.5 h-3.5 text-stone-400" />Handicrafts</button>
              <button onClick={() => { setActiveTab("videos"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-stone-500 hover:text-amber-700 text-left transition-colors flex items-center gap-1"><Film className="w-3.5 h-3.5 text-stone-400" />Video Hub</button>
              <button onClick={() => { setActiveTab("blog"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-stone-500 hover:text-amber-700 text-left transition-colors flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-stone-400" />Blog</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">Join Our Creative Guild</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Explore step-by-step videos and share your plate styles. Subscribing to the channel directly supports free, quality handiwork tutorials!
            </p>
            <div className="flex gap-3 pt-1.5">
              <a 
                href="https://www.youtube.com/@Luxmisculinary" 
                target="_blank" 
                referrerPolicy="no-referrer"
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 underline"
              >
                <Youtube className="w-4 h-4" />
                <span>Visit Channel page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-stone-100 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-400 font-mono gap-4">
          <span>&copy; {new Date().getFullYear()} Luxmi's Culinary & Crafts. All Rights Reserved.</span>
          <span className="flex items-center gap-1">
            <span>Powered by Gemini 3.5 & AI Studio</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </span>
        </div>
      </footer>
    </div>
  );
}
