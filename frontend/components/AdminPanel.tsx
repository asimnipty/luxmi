import React, { useState, useRef } from "react";
import { 
  Upload, PlusCircle, Trash, Check, Loader, FileText, Image, 
  Video, Lock, Unlock, ChefHat, Scissors, PlayCircle, BookOpen, AlertCircle
} from "lucide-react";
import { Recipe, HandiCraft, VideoItem, BlogPost } from "../types";

interface AdminPanelProps {
  recipes: Recipe[];
  crafts: HandiCraft[];
  videos: VideoItem[];
  blogs: BlogPost[];
  onDataChange: () => void; // Callback to tell App to refresh data
}

export default function AdminPanel({ recipes, crafts, videos, blogs, onDataChange }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  
  // Tab states
  const [activeForm, setActiveForm] = useState<"recipe" | "craft" | "video" | "blog" | "manage">("recipe");
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // Forms states
  const [recipeForm, setRecipeForm] = useState({
    title: "",
    category: "Main Course" as Recipe["category"],
    prepTime: 20,
    cookTime: 15,
    difficulty: "Medium" as Recipe["difficulty"],
    ingredients: "", // split by newline or comma
    instructions: "", // split by newline
    image: "",
    description: "",
    tags: "Traditional, Homemade",
    tips: "",
    youtubeUrl: ""
  });

  const [craftForm, setCraftForm] = useState({
    title: "",
    category: "Kitchen DIY" as HandiCraft["category"],
    timeRequired: 30,
    difficulty: "Medium" as HandiCraft["difficulty"],
    materials: "", // split by comma
    steps: "", // split by newline
    image: "",
    description: "",
    tags: "Eco-Friendly, DIY",
    tips: "",
    youtubeUrl: ""
  });

  const [videoForm, setVideoForm] = useState({
    title: "",
    youtubeId: "", // if YT url
    category: "Culinary" as VideoItem["category"],
    duration: "5:00",
    description: "",
    thumbnail: "",
    directVideoUrl: "" // if directly uploaded
  });

  const [blogForm, setBlogForm] = useState({
    title: "",
    category: "Kitchen Hacks" as BlogPost["category"],
    author: "Luxmi",
    readTime: "5 min read",
    summary: "",
    content: "", // split by newline
    image: "",
    tags: "Kitchen, Styling, Decor"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "luxmi123") {
      setIsAuthenticated(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Incorrect passcode! Please try again.");
    }
  };

  // Direct file uploader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server responded with error status");
      }

      const data = await response.json();
      
      // Auto-populate image or video field depending on active form
      if (activeForm === "recipe") {
        setRecipeForm(prev => ({ ...prev, image: data.url }));
      } else if (activeForm === "craft") {
        setCraftForm(prev => ({ ...prev, image: data.url }));
      } else if (activeForm === "video") {
        if (file.type.startsWith("video/")) {
          setVideoForm(prev => ({ ...prev, directVideoUrl: data.url, thumbnail: "/uploads/video_placeholder.png" }));
        } else {
          setVideoForm(prev => ({ ...prev, thumbnail: data.url }));
        }
      } else if (activeForm === "blog") {
        setBlogForm(prev => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Failed to upload the file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit functions
  const submitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...recipeForm,
      prepTime: Number(recipeForm.prepTime),
      cookTime: Number(recipeForm.cookTime),
      ingredients: recipeForm.ingredients.split("\n").map(i => i.trim()).filter(Boolean),
      instructions: recipeForm.instructions.split("\n").map(i => i.trim()).filter(Boolean),
      tags: recipeForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      tips: recipeForm.tips ? recipeForm.tips.split("\n").map(t => t.trim()).filter(Boolean) : undefined
    };

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Recipe added successfully!");
        onDataChange();
        setRecipeForm({
          title: "",
          category: "Main Course",
          prepTime: 20,
          cookTime: 15,
          difficulty: "Medium",
          ingredients: "",
          instructions: "",
          image: "",
          description: "",
          tags: "Traditional, Homemade",
          tips: "",
          youtubeUrl: ""
        });
      }
    } catch (err) {
      alert("Failed to save recipe.");
    }
  };

  const submitCraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...craftForm,
      timeRequired: Number(craftForm.timeRequired),
      materials: craftForm.materials.split(",").map(m => m.trim()).filter(Boolean),
      steps: craftForm.steps.split("\n").map(s => s.trim()).filter(Boolean),
      tags: craftForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      tips: craftForm.tips ? craftForm.tips.split("\n").map(t => t.trim()).filter(Boolean) : undefined
    };

    try {
      const res = await fetch("/api/crafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Handicraft guide added successfully!");
        onDataChange();
        setCraftForm({
          title: "",
          category: "Kitchen DIY",
          timeRequired: 30,
          difficulty: "Medium",
          materials: "",
          steps: "",
          image: "",
          description: "",
          tags: "Eco-Friendly, DIY",
          tips: "",
          youtubeUrl: ""
        });
      }
    } catch (err) {
      alert("Failed to save handicraft guide.");
    }
  };

  const submitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract YouTube ID if full URL is entered
    let youtubeId = videoForm.youtubeId;
    if (youtubeId.includes("youtube.com") || youtubeId.includes("youtu.be")) {
      try {
        const urlObj = new URL(youtubeId);
        if (youtubeId.includes("youtu.be")) {
          youtubeId = urlObj.pathname.substring(1);
        } else {
          youtubeId = urlObj.searchParams.get("v") || "";
        }
      } catch (err) {
        // use raw value if invalid url
      }
    }

    const payload = {
      title: videoForm.title,
      youtubeId: youtubeId,
      category: videoForm.category,
      duration: videoForm.duration,
      description: videoForm.description,
      thumbnail: videoForm.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "/uploads/video_placeholder.png"),
      directVideoUrl: videoForm.directVideoUrl || undefined
    };

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Video added successfully!");
        onDataChange();
        setVideoForm({
          title: "",
          youtubeId: "",
          category: "Culinary",
          duration: "5:00",
          description: "",
          thumbnail: "",
          directVideoUrl: ""
        });
      }
    } catch (err) {
      alert("Failed to save video.");
    }
  };

  const submitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...blogForm,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      content: blogForm.content.split("\n").map(c => c.trim()).filter(Boolean),
      tags: blogForm.tags.split(",").map(t => t.trim()).filter(Boolean)
    };

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Blog article published successfully!");
        onDataChange();
        setBlogForm({
          title: "",
          category: "Kitchen Hacks",
          author: "Luxmi",
          readTime: "5 min read",
          summary: "",
          content: "",
          image: "",
          tags: "Kitchen, Styling, Decor"
        });
      }
    } catch (err) {
      alert("Failed to save blog post.");
    }
  };

  // Delete handlers
  const handleDelete = async (type: "recipes" | "crafts" | "videos" | "blogs", id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const res = await fetch(`/api/${type}/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        onDataChange();
      }
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl border border-stone-200 p-8 shadow-md text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto border border-amber-200/50">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Admin Workspace</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Please enter the admin passcode to unlock image and video uploads, content publishing, and management controls.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-stone-400 text-left uppercase tracking-wider mb-1.5 font-bold">Admin Passcode</label>
            <input 
              type="password"
              placeholder="e.g. luxmi123"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-sm transition-colors text-center font-mono tracking-widest"
              required
            />
          </div>

          {passcodeError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5 justify-center bg-red-50 py-2 rounded-lg border border-red-200/50">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{passcodeError}</span>
            </p>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            Unlock Controls
          </button>
        </form>
        <p className="text-[10px] text-stone-400 font-mono">Default passcode is <span className="font-bold">luxmi123</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-100 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full inline-block flex items-center gap-1.5 w-fit">
            <Unlock className="w-3 h-3 text-emerald-500" />
            <span>Admin Control Room</span>
          </span>
          <h2 className="font-serif text-3xl font-bold text-stone-950">Welcome, Luxmi!</h2>
          <p className="text-xs text-stone-500">
            Upload images, videos, write recipes, drafts, and manage existing channel resources effortlessly.
          </p>
        </div>

        <button 
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 text-stone-500 hover:text-stone-800 border border-stone-200 hover:bg-stone-50 text-xs font-mono font-bold rounded-xl transition-colors"
        >
          Logout Admin
        </button>
      </div>

      {/* Admin Action Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-2">
        <button
          onClick={() => setActiveForm("recipe")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeForm === "recipe" ? "bg-amber-100 text-amber-900 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>New Recipe</span>
        </button>
        <button
          onClick={() => setActiveForm("craft")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeForm === "craft" ? "bg-amber-100 text-amber-900 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>New Craft Guide</span>
        </button>
        <button
          onClick={() => setActiveForm("video")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeForm === "video" ? "bg-amber-100 text-amber-900 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>New Video Tutorial</span>
        </button>
        <button
          onClick={() => setActiveForm("blog")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeForm === "blog" ? "bg-amber-100 text-amber-900 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>New Blog Article</span>
        </button>
        <button
          onClick={() => setActiveForm("manage")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ml-auto cursor-pointer ${
            activeForm === "manage" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          <Trash className="w-4 h-4" />
          <span>Manage Existing ({recipes.length + crafts.length + videos.length + blogs.length})</span>
        </button>
      </div>

      {/* Master Upload Utility Drawer */}
      {activeForm !== "manage" && (
        <div className="bg-gradient-to-br from-amber-50/20 to-stone-50 p-6 rounded-2xl border border-stone-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                <span>Upload Media Center (Image or Video)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Simply select any image or video file from your phone or computer. We will upload and link it directly below.
              </p>
            </div>

            <div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-400 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Uploading file...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Select & Upload File</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {uploadError && (
            <p className="text-xs text-red-600 font-mono bg-red-50 p-2.5 rounded-lg border border-red-100">{uploadError}</p>
          )}

          {/* Quick Previews depending on active form */}
          {activeForm === "recipe" && recipeForm.image && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200/60 max-w-md">
              <img src={recipeForm.image} alt="Upload preview" className="w-16 h-12 object-cover rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-emerald-600 font-bold">Successfully Uploaded!</p>
                <p className="text-[10px] text-stone-500 truncate font-mono">{recipeForm.image}</p>
              </div>
            </div>
          )}

          {activeForm === "craft" && craftForm.image && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200/60 max-w-md">
              <img src={craftForm.image} alt="Upload preview" className="w-16 h-12 object-cover rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-emerald-600 font-bold">Successfully Uploaded!</p>
                <p className="text-[10px] text-stone-500 truncate font-mono">{craftForm.image}</p>
              </div>
            </div>
          )}

          {activeForm === "blog" && blogForm.image && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200/60 max-w-md">
              <img src={blogForm.image} alt="Upload preview" className="w-16 h-12 object-cover rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-emerald-600 font-bold">Successfully Uploaded!</p>
                <p className="text-[10px] text-stone-500 truncate font-mono">{blogForm.image}</p>
              </div>
            </div>
          )}

          {activeForm === "video" && videoForm.directVideoUrl && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200/60 max-w-md">
              <div className="w-16 h-12 bg-stone-900 rounded-md flex items-center justify-center text-white font-mono text-[9px]">VIDEO</div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-emerald-600 font-bold">Direct Video Uploaded!</p>
                <p className="text-[10px] text-stone-500 truncate font-mono">{videoForm.directVideoUrl}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORMS */}
      
      {/* 1. Recipe Form */}
      {activeForm === "recipe" && (
        <form onSubmit={submitRecipe} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Create New Recipe</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Recipe Title</label>
              <input 
                type="text"
                placeholder="e.g. Grandma's Famous Rice Flour Samosas"
                value={recipeForm.title}
                onChange={(e) => setRecipeForm({...recipeForm, title: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Category</label>
              <select
                value={recipeForm.category}
                onChange={(e) => setRecipeForm({...recipeForm, category: e.target.value as Recipe["category"]})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
              >
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Snack</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Preparation Time (Minutes)</label>
              <input 
                type="number"
                value={recipeForm.prepTime}
                onChange={(e) => setRecipeForm({...recipeForm, prepTime: Number(e.target.value)})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Cooking Time (Minutes)</label>
              <input 
                type="number"
                value={recipeForm.cookTime}
                onChange={(e) => setRecipeForm({...recipeForm, cookTime: Number(e.target.value)})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Difficulty</label>
              <select
                value={recipeForm.difficulty}
                onChange={(e) => setRecipeForm({...recipeForm, difficulty: e.target.value as Recipe["difficulty"]})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard (Artisanal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Image URL or Path</label>
              <input 
                type="text"
                placeholder="Upload file above, or paste an image URL directly"
                value={recipeForm.image}
                onChange={(e) => setRecipeForm({...recipeForm, image: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Short Description</label>
              <textarea 
                placeholder="A warm, enticing summary of the recipe to show in card listings..."
                value={recipeForm.description}
                onChange={(e) => setRecipeForm({...recipeForm, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-20 resize-none"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Ingredients (One ingredient per line)</label>
              <textarea 
                placeholder="e.g.&#10;2 cups Wheat flour&#10;1 tsp Salt&#10;1 cup Warm water"
                value={recipeForm.ingredients}
                onChange={(e) => setRecipeForm({...recipeForm, ingredients: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-32 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Step-by-Step Instructions (One step per line)</label>
              <textarea 
                placeholder="e.g.&#10;Mix flour and salt in a bowl.&#10;Slowly pour warm water and knead into a soft dough.&#10;Roast on a medium skillet."
                value={recipeForm.instructions}
                onChange={(e) => setRecipeForm({...recipeForm, instructions: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-40 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Chef Secrets / Tips (Optional - One per line)</label>
              <textarea 
                placeholder="e.g.&#10;Do not overwork the dough to keep it soft.&#10;Let the griddle be smoking hot before placing the bread."
                value={recipeForm.tips}
                onChange={(e) => setRecipeForm({...recipeForm, tips: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-24 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">YouTube Video Link (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                value={recipeForm.youtubeUrl}
                onChange={(e) => setRecipeForm({...recipeForm, youtubeUrl: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-4 cursor-pointer"
          >
            Publish Recipe Live
          </button>
        </form>
      )}

      {/* 2. Craft Form */}
      {activeForm === "craft" && (
        <form onSubmit={submitCraft} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Create New Crafting Guide</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Craft Title</label>
              <input 
                type="text"
                placeholder="e.g. Handmade Braided Jute Table Runner"
                value={craftForm.title}
                onChange={(e) => setCraftForm({...craftForm, title: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Category</label>
              <select
                value={craftForm.category}
                onChange={(e) => setCraftForm({...craftForm, category: e.target.value as HandiCraft["category"]})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
              >
                <option value="Kitchen DIY">Kitchen DIY</option>
                <option value="Clay Craft">Clay Craft</option>
                <option value="Paper Art">Paper Art</option>
                <option value="Home Decor">Home Decor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Time Required (Minutes)</label>
              <input 
                type="number"
                value={craftForm.timeRequired}
                onChange={(e) => setCraftForm({...craftForm, timeRequired: Number(e.target.value)})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Difficulty</label>
              <select
                value={craftForm.difficulty}
                onChange={(e) => setCraftForm({...craftForm, difficulty: e.target.value as HandiCraft["difficulty"]})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard (Artisanal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Materials Needed (Comma-separated)</label>
              <input 
                type="text"
                placeholder="e.g. Jute Rope, Hot Glue, Scissors, Cardboard"
                value={craftForm.materials}
                onChange={(e) => setCraftForm({...craftForm, materials: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Image URL or Path</label>
              <input 
                type="text"
                placeholder="Upload file above, or paste an image URL"
                value={craftForm.image}
                onChange={(e) => setCraftForm({...craftForm, image: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Short Summary</label>
              <textarea 
                placeholder="A neat, encouraging intro of the handicraft guide to display on lists..."
                value={craftForm.description}
                onChange={(e) => setCraftForm({...craftForm, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-20 resize-none"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Step-by-Step Instructions (One step per line)</label>
              <textarea 
                placeholder="e.g.&#10;Cut cardboard into a long rectangular strip.&#10;Braid three jute ropes tightly.&#10;Glue the braids across the cardboard base in rows."
                value={craftForm.steps}
                onChange={(e) => setCraftForm({...craftForm, steps: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-40 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Artisan Secrets / Tips (Optional - One per line)</label>
              <textarea 
                placeholder="e.g.&#10;Keep hot glue thin so it doesn't leak out of ropes.&#10;Let it set for 2 hours before placing hot items on top."
                value={craftForm.tips}
                onChange={(e) => setCraftForm({...craftForm, tips: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-24 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">YouTube Video Link (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                value={craftForm.youtubeUrl}
                onChange={(e) => setCraftForm({...craftForm, youtubeUrl: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-4 cursor-pointer"
          >
            Publish Crafting Guide Live
          </button>
        </form>
      )}

      {/* 3. Video Form */}
      {activeForm === "video" && (
        <form onSubmit={submitVideo} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Register New Video Tutorial</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Video Title</label>
              <input 
                type="text"
                placeholder="e.g. Perfect Sun-Dried Kashmiri Mango Pickling Guide"
                value={videoForm.title}
                onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">YouTube Video URL or YouTube Video ID</label>
              <input 
                type="text"
                placeholder="e.g. Jx4nsgQFweU OR https://www.youtube.com/watch?v=..."
                value={videoForm.youtubeId}
                onChange={(e) => setVideoForm({...videoForm, youtubeId: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-mono"
                required={!videoForm.directVideoUrl} // only required if direct video wasn't uploaded
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Category</label>
              <select
                value={videoForm.category}
                onChange={(e) => setVideoForm({...videoForm, category: e.target.value as VideoItem["category"]})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
              >
                <option value="Culinary">Culinary (Food)</option>
                <option value="Handicraft">Handicraft (DIY)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Duration (MM:SS)</label>
              <input 
                type="text"
                placeholder="e.g. 5:20"
                value={videoForm.duration}
                onChange={(e) => setVideoForm({...videoForm, duration: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Thumbnail Image URL (Optional)</label>
              <input 
                type="text"
                placeholder="Automatically fetched from YouTube if empty, or upload file above"
                value={videoForm.thumbnail}
                onChange={(e) => setVideoForm({...videoForm, thumbnail: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Video Description</label>
              <textarea 
                placeholder="Describe what viewers will learn in this step-by-step masterclass..."
                value={videoForm.description}
                onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-24 resize-none"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-4 cursor-pointer"
          >
            Publish Video Live
          </button>
        </form>
      )}

      {/* 4. Blog Form */}
      {activeForm === "blog" && (
        <form onSubmit={submitBlog} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Publish New Blog Article</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Article Title</label>
              <input 
                type="text"
                placeholder="e.g. Setting a Sustainable Thanksgiving Table"
                value={blogForm.title}
                onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Category</label>
              <select
                value={blogForm.category}
                onChange={(e) => setBlogForm({...blogForm, category: e.target.value as BlogPost["category"]})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
              >
                <option value="Kitchen Hacks">Kitchen Hacks</option>
                <option value="Handmade Design">Handmade Design</option>
                <option value="Food Styling">Food Styling</option>
                <option value="Eco-Friendly DIY">Eco-Friendly DIY</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Estimated Read Time</label>
              <input 
                type="text"
                placeholder="e.g. 5 min read"
                value={blogForm.readTime}
                onChange={(e) => setBlogForm({...blogForm, readTime: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Hero Image URL</label>
              <input 
                type="text"
                placeholder="Upload file above, or paste an image URL"
                value={blogForm.image}
                onChange={(e) => setBlogForm({...blogForm, image: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Article Summary</label>
              <textarea 
                placeholder="A compelling, short summary to show in card grids..."
                value={blogForm.summary}
                onChange={(e) => setBlogForm({...blogForm, summary: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-20 resize-none"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Article Body Content (One paragraph per line)</label>
              <textarea 
                placeholder="Type your paragraphs. Press ENTER to separate paragraphs.&#10;To write a bold list header, start the line with '1.', '2.', etc."
                value={blogForm.content}
                onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs h-56 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-stone-500 uppercase tracking-wide">Search Tags (Comma-separated)</label>
              <input 
                type="text"
                placeholder="e.g. Styling, Tableware, Eco-Friendly, Autumn"
                value={blogForm.tags}
                onChange={(e) => setBlogForm({...blogForm, tags: e.target.value})}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-4 cursor-pointer"
          >
            Publish Article Live
          </button>
        </form>
      )}

      {/* 5. Manage Panel */}
      {activeForm === "manage" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-8 shadow-sm">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="font-serif text-xl font-bold text-stone-900">Manage Your Content Hub</h3>
            <p className="text-xs text-stone-500 mt-1">Review, audit, or remove any live articles, recipes, or crafts instantly.</p>
          </div>

          {/* Recipes Stream */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50/70 px-3 py-1.5 rounded-lg w-fit">Recipes ({recipes.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map(recipe => (
                <div key={recipe.id} className="flex items-center gap-4 p-3 rounded-xl border border-stone-100 bg-stone-50/50 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={recipe.image} alt="" className="w-12 h-10 object-cover rounded-md bg-stone-200" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-stone-900 truncate font-serif">{recipe.title}</h5>
                      <p className="text-[10px] text-stone-400 font-mono uppercase">{recipe.category} • {recipe.difficulty}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete("recipes", recipe.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Handicraft Guides */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50/70 px-3 py-1.5 rounded-lg w-fit">Handicrafts ({crafts.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crafts.map(craft => (
                <div key={craft.id} className="flex items-center gap-4 p-3 rounded-xl border border-stone-100 bg-stone-50/50 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={craft.image} alt="" className="w-12 h-10 object-cover rounded-md bg-stone-200" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-stone-900 truncate font-serif">{craft.title}</h5>
                      <p className="text-[10px] text-stone-400 font-mono uppercase">{craft.category} • {craft.difficulty}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete("crafts", craft.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50/70 px-3 py-1.5 rounded-lg w-fit">Videos ({videos.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map(video => (
                <div key={video.id} className="flex items-center gap-4 p-3 rounded-xl border border-stone-100 bg-stone-50/50 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={video.thumbnail} alt="" className="w-12 h-10 object-cover rounded-md bg-stone-200" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-stone-900 truncate font-serif">{video.title}</h5>
                      <p className="text-[10px] text-stone-400 font-mono uppercase">{video.category} • {video.duration}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete("videos", video.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Blogs */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50/70 px-3 py-1.5 rounded-lg w-fit">Blog Posts ({blogs.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogs.map(blog => (
                <div key={blog.id} className="flex items-center gap-4 p-3 rounded-xl border border-stone-100 bg-stone-50/50 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={blog.image} alt="" className="w-12 h-10 object-cover rounded-md bg-stone-200" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-stone-900 truncate font-serif">{blog.title}</h5>
                      <p className="text-[10px] text-stone-400 font-mono uppercase">{blog.category} • {blog.readTime}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete("blogs", blog.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
