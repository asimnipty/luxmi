import { useState, useMemo } from "react";
import { HandiCraft } from "../types";
import { Heart, Clock, Award, Scissors, BookOpen, Search, Filter, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CraftShowcaseProps {
  crafts: HandiCraft[];
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  onGoToVideo: (url: string) => void;
}

export default function CraftShowcase({ crafts, onToggleFavorite, favorites, onGoToVideo }: CraftShowcaseProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedCraft, setSelectedCraft] = useState<HandiCraft | null>(null);

  // Categories
  const categories = ["All", "Clay Craft", "Paper Art", "Kitchen DIY"];

  // Filtered handicrafts
  const filteredCrafts = useMemo(() => {
    return crafts.filter((craft) => {
      const matchesSearch = craft.title.toLowerCase().includes(search.toLowerCase()) || 
                            craft.description.toLowerCase().includes(search.toLowerCase()) ||
                            craft.materials.some(mat => mat.toLowerCase().includes(search.toLowerCase())) ||
                            craft.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === "All" || craft.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [crafts, search, categoryFilter]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full inline-block">Hand-Crafted Art</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-950">Aesthetic Upcycling & Handicrafts</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          From discarded earthen tea cups (Kullhads) to leftover cardboard and natural jute cords, explore sustainable craft guides that decorate your rooms with minimal expense.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by supplies, rope, clay, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs appearance-none transition-colors cursor-pointer text-stone-700"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredCrafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredCrafts.map((craft) => {
            const isFav = favorites.includes(craft.id);
            return (
              <motion.div
                layoutId={`craft-card-${craft.id}`}
                key={craft.id}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group h-full"
              >
                {/* Image Stage */}
                <div className="relative h-52 w-full overflow-hidden bg-stone-100">
                  <img
                    src={craft.image}
                    alt={craft.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-xs text-stone-900 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase font-mono shadow-xs">
                      {craft.category}
                    </span>
                  </div>

                  {/* Save favorite Button */}
                  <button
                    onClick={() => onToggleFavorite(craft.id)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-rose-500 hover:bg-white shadow-sm transition-all cursor-pointer active:scale-90"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "text-rose-500 fill-rose-500" : ""}`} />
                  </button>

                  {/* Headline Title */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-serif text-base font-bold tracking-tight leading-tight drop-shadow-xs">
                      {craft.title}
                    </h3>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                    {craft.description}
                  </p>

                  {/* Meta properties */}
                  <div className="flex items-center gap-4 text-xs font-mono text-stone-400 py-2 border-y border-stone-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-300" />
                      <span>Time: {craft.timeRequired}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-stone-300" />
                      <span>{craft.difficulty} Skill</span>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedCraft(craft)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 underline transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Craft Steps</span>
                    </button>

                    {craft.youtubeUrl && (
                      <button
                        onClick={() => onGoToVideo(craft.youtubeUrl!)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Watch Video</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-stone-50 rounded-2xl border border-dashed border-stone-300 py-16 text-center space-y-3">
          <Scissors className="w-10 h-10 text-stone-400 mx-auto stroke-1" />
          <p className="text-stone-700 font-serif text-base font-bold">No craft matches your parameters</p>
          <p className="text-stone-400 text-xs">Try searching for materials like 'rope', 'paint' or 'paper'.</p>
          <button
            onClick={() => { setSearch(""); setCategoryFilter("All"); }}
            className="text-xs font-bold text-amber-700 underline hover:text-amber-800 mt-2"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedCraft && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCraft(null)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 relative z-10"
            >
              {/* Header Visual */}
              <div className="relative h-48 shrink-0 bg-stone-100">
                <img
                  src={selectedCraft.image}
                  alt={selectedCraft.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent" />
                <button
                  onClick={() => setSelectedCraft(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-900/65 hover:bg-stone-900 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  &times;
                </button>
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-600 px-2 py-0.5 rounded-sm font-bold">
                    {selectedCraft.category}
                  </span>
                  <h3 className="font-serif text-xl font-bold mt-1.5 drop-shadow-sm">{selectedCraft.title}</h3>
                </div>
              </div>

              {/* Scrollable Details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">Description</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1.5">{selectedCraft.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Supplies */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-1 flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-stone-400" />
                      <span>Materials Needed</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedCraft.materials.map((mat, i) => (
                        <li key={i} className="text-xs text-stone-700 flex items-start gap-1.5 leading-normal">
                          <span className="text-amber-600 mt-1 shrink-0">•</span>
                          <span>{mat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Craft statistics */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-1">Craft Metrics</h4>
                      <div className="space-y-1 text-xs text-stone-600 font-mono">
                        <div className="flex justify-between"><span className="text-stone-400">Est. Time:</span><span>{selectedCraft.timeRequired} mins</span></div>
                        <div className="flex justify-between"><span className="text-stone-400">Difficulty:</span><span className="font-bold text-stone-800">{selectedCraft.difficulty}</span></div>
                      </div>
                    </div>

                    {selectedCraft.tips && (
                      <div className="space-y-1.5 bg-amber-50/50 rounded-xl p-3.5 border border-amber-200/40">
                        <h5 className="text-[11px] font-bold text-amber-900 font-mono uppercase tracking-wide">Artisan Tips:</h5>
                        <ul className="space-y-1">
                          {selectedCraft.tips.map((tip, idx) => (
                            <li key={idx} className="text-[10.5px] text-amber-800 leading-relaxed">
                              💡 {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                    <span>Tutorial Steps</span>
                  </h4>
                  <ol className="space-y-3">
                    {selectedCraft.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-xs leading-relaxed text-stone-700">
                        <span className="w-5 h-5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <p className="pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 shrink-0 flex justify-between items-center">
                <button
                  onClick={() => onToggleFavorite(selectedCraft.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-rose-500 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedCraft.id) ? "text-rose-500 fill-rose-500" : ""}`} />
                  <span>{favorites.includes(selectedCraft.id) ? "Saved in Favorites" : "Add to Favorites"}</span>
                </button>

                {selectedCraft.youtubeUrl && (
                  <button
                    onClick={() => {
                      onGoToVideo(selectedCraft.youtubeUrl!);
                      setSelectedCraft(null);
                    }}
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Watch Crafting Video</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
