import { motion } from "motion/react";
import { Youtube, Heart, Sparkles, BookOpen, Scissors, ChefHat, PlayCircle } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
}

export default function Header({ activeTab, setActiveTab, favoritesCount }: HeaderProps) {
  const tabs = [
    { id: "recipes", label: "Recipes", icon: ChefHat },
    { id: "crafts", label: "Handicrafts", icon: Scissors },
    { id: "videos", label: "Video Hub", icon: PlayCircle },
    { id: "blog", label: "Design & Kitchen Blog", icon: BookOpen },
    { id: "assistant", label: "AI Creative Planner", icon: Sparkles },
  ];

  return (
    <header id="app-header" className="bg-white border-b border-stone-100 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      {/* Top Welcome Banner */}
      <div className="bg-stone-900 text-stone-100 text-xs py-2 px-4 text-center tracking-wider font-mono uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Crafting Culinary Masterpieces & Handmade Arts with Passion</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 gap-4">
          
          {/* Logo & Brand Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-serif text-2xl shadow-sm border border-amber-400">
              L
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
                Luxmi's Culinary & Crafts
              </h1>
              <p className="text-xs text-stone-500 font-mono flex items-center gap-1.5 mt-0.5">
                <span>Inspired by</span>
                <a 
                  href="https://www.youtube.com/@Luxmisculinary" 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer" 
                  className="text-amber-600 hover:text-amber-700 underline font-semibold flex items-center gap-0.5"
                >
                  <Youtube className="w-3 h-3 text-red-500" />
                  @Luxmisculinary
                </a>
                <span>• 120K+ Subscribers</span>
              </p>
            </div>
          </div>

          {/* Social Stats and Quick Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <a
              href="https://www.youtube.com/@Luxmisculinary?sub_confirmation=1"
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-sm hover:shadow active:scale-95"
            >
              <Youtube className="w-4 h-4" />
              Subscribe Channel
            </a>

            {/* Favorites Badge */}
            <button 
              onClick={() => setActiveTab("recipes")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200/60 transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
              <span>Saves</span>
              <span className="bg-stone-200 text-stone-800 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                {favoritesCount}
              </span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center overflow-x-auto scrollbar-none gap-2 pb-px border-t border-stone-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-4 text-sm font-medium tracking-wide flex items-center gap-2 whitespace-nowrap transition-colors focus:outline-none ${
                  isActive 
                    ? "text-amber-700 font-semibold" 
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
