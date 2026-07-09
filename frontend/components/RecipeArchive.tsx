import { useState, useMemo } from "react";
import { RECIPES } from "../data";
import { Recipe } from "../types";
import { Heart, Clock, Award, BookOpen, UtensilsCrossed, Search, Filter, PlayCircle, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RecipeArchiveProps {
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  activeTab: string;
  onGoToVideo: (url: string) => void;
}

export default function RecipeArchive({ onToggleFavorite, favorites, onGoToVideo }: RecipeArchiveProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Categories
  const categories = ["All", "Dessert", "Main Course", "Snack", "Beverage"];

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return RECIPES.filter((recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase()) || 
                            recipe.description.toLowerCase().includes(search.toLowerCase()) ||
                            recipe.ingredients.some(ing => ing.toLowerCase().includes(search.toLowerCase())) ||
                            recipe.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === "All" || recipe.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "All" || recipe.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, categoryFilter, difficultyFilter]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full inline-block">The Taste of Tradition</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-950">Traditional Recipes</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Every recipe here is slow-cooked and beautifully structured. Use the search to locate specific ingredients or toggle between traditional main courses and delicate desserts.
        </p>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ingredients, spice, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs transition-colors"
          />
        </div>

        {/* Category select */}
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs appearance-none transition-colors cursor-pointer text-stone-700"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}s</option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="relative">
          <Award className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs appearance-none transition-colors cursor-pointer text-stone-700"
          >
            <option value="All">All Skill Levels</option>
            <option value="Easy">Easy Level</option>
            <option value="Medium">Medium Level</option>
            <option value="Hard">Artisanal (Hard)</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredRecipes.map((recipe) => {
            const isFav = favorites.includes(recipe.id);
            return (
              <motion.div
                layoutId={`recipe-card-${recipe.id}`}
                key={recipe.id}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group h-full"
              >
                {/* Image Stage */}
                <div className="relative h-60 w-full overflow-hidden bg-stone-100">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80" />

                  {/* Badges on top */}
                  <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                    <span className="bg-white/95 backdrop-blur-xs text-stone-900 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase font-mono shadow-xs">
                      {recipe.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase font-mono text-white shadow-xs ${
                      recipe.difficulty === "Easy" ? "bg-emerald-600/90" :
                      recipe.difficulty === "Medium" ? "bg-amber-600/90" : "bg-rose-700/90"
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Save favorite Button */}
                  <button
                    onClick={() => onToggleFavorite(recipe.id)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-rose-500 hover:bg-white shadow-sm transition-all cursor-pointer active:scale-90"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "text-rose-500 fill-rose-500" : ""}`} />
                  </button>

                  {/* Headline Title */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-serif text-lg font-bold tracking-tight leading-tight drop-shadow-xs">
                      {recipe.title}
                    </h3>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Meta properties */}
                  <div className="flex items-center gap-4 text-xs font-mono text-stone-400 py-2 border-y border-stone-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-300" />
                      <span>Prep: {recipe.prepTime}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-stone-300" />
                      <span>Cook: {recipe.cookTime}m</span>
                    </div>
                  </div>

                  {/* Footer links */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 underline transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Recipe Steps</span>
                    </button>

                    {recipe.youtubeUrl && (
                      <button
                        onClick={() => onGoToVideo(recipe.youtubeUrl!)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Watch Tutorial</span>
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
          <ChefHat className="w-10 h-10 text-stone-400 mx-auto stroke-1" />
          <p className="text-stone-700 font-serif text-base font-bold">No recipes matched your filters</p>
          <p className="text-stone-400 text-xs">Try clearing some tags or searching for a different ingredient!</p>
          <button
            onClick={() => { setSearch(""); setCategoryFilter("All"); setDifficultyFilter("All"); }}
            className="text-xs font-bold text-amber-700 underline hover:text-amber-800 mt-2"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
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
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent" />
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-900/65 hover:bg-stone-900 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  &times;
                </button>
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-600 px-2 py-0.5 rounded-sm font-bold">
                    {selectedRecipe.category}
                  </span>
                  <h3 className="font-serif text-xl font-bold mt-1.5 drop-shadow-sm">{selectedRecipe.title}</h3>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">Description</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1.5">{selectedRecipe.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Ingredients */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-1 flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-stone-400" />
                      <span>Ingredients</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="text-xs text-stone-700 flex items-start gap-1.5 leading-normal">
                          <span className="text-amber-600 mt-1 shrink-0">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cook metrics */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-1">Cooking Specs</h4>
                      <div className="space-y-1 text-xs text-stone-600 font-mono">
                        <div className="flex justify-between"><span className="text-stone-400">Preparation:</span><span>{selectedRecipe.prepTime} mins</span></div>
                        <div className="flex justify-between"><span className="text-stone-400">Cook Time:</span><span>{selectedRecipe.cookTime} mins</span></div>
                        <div className="flex justify-between"><span className="text-stone-400">Complexity:</span><span className="font-bold text-stone-800">{selectedRecipe.difficulty}</span></div>
                      </div>
                    </div>

                    {selectedRecipe.tips && (
                      <div className="space-y-1.5 bg-amber-50/50 rounded-xl p-3.5 border border-amber-200/40">
                        <h5 className="text-[11px] font-bold text-amber-900 font-mono uppercase tracking-wide">Chef's Secret Tips:</h5>
                        <ul className="space-y-1">
                          {selectedRecipe.tips.map((tip, idx) => (
                            <li key={idx} className="text-[10.5px] text-amber-800 leading-relaxed">
                              💡 {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                    <span>Step-by-Step Instructions</span>
                  </h4>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((step, idx) => (
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
                  onClick={() => onToggleFavorite(selectedRecipe.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-rose-500 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedRecipe.id) ? "text-rose-500 fill-rose-500" : ""}`} />
                  <span>{favorites.includes(selectedRecipe.id) ? "Saved in Favorites" : "Add to Favorites"}</span>
                </button>

                {selectedRecipe.youtubeUrl && (
                  <button
                    onClick={() => {
                      onGoToVideo(selectedRecipe.youtubeUrl!);
                      setSelectedRecipe(null);
                    }}
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Watch Cooking Video</span>
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
