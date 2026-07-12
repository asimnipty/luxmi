import { useState } from "react";
import { BlogPost } from "../types";
import { Calendar, User, Clock, ArrowRight, BookOpen, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BlogSectionProps {
  blogs: BlogPost[];
}

export default function BlogSection({ blogs }: BlogSectionProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full inline-block">Design & Styling</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-950">Luxmi's Design & Kitchen Blog</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Deep dives into the philosophy of aesthetic presentation, eco-friendly kitchen hacks, and creating unforgettable hospitable atmospheres.
        </p>
      </div>

      {/* Main Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogs.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group"
          >
            {/* Visual Header */}
            <div className="h-48 overflow-hidden relative bg-stone-100">
              <img
                src={post.image}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white text-stone-900 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase font-mono shadow-xs">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                {/* Meta details */}
                <div className="flex items-center gap-3 text-[10px] font-mono text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-stone-500 text-xs leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>

              {/* View Trigger */}
              <button
                onClick={() => setSelectedPost(post)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-all cursor-pointer self-start border-b border-amber-700/0 hover:border-amber-700"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
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
              <div className="relative h-56 shrink-0 bg-stone-100">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  &times;
                </button>
                <div className="absolute bottom-5 left-6 right-6 text-white">
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-600 px-2.5 py-0.5 rounded-sm font-bold">
                    {selectedPost.category}
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl font-bold mt-1.5 drop-shadow-sm">{selectedPost.title}</h3>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* Meta bar */}
                <div className="flex items-center gap-4 text-xs font-mono text-stone-400 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-300" />
                    <span>Written by: {selectedPost.author}</span>
                  </div>
                  <span>•</span>
                  <div>Uploaded on {selectedPost.date}</div>
                  <span>•</span>
                  <div>{selectedPost.readTime}</div>
                </div>

                {/* Main Text Content */}
                <div className="space-y-4">
                  {selectedPost.content.map((p, i) => {
                    const isNumberedHeader = p.startsWith("1.") || p.startsWith("2.") || p.startsWith("3.") || p.startsWith("4.") || p.startsWith("5.");
                    if (isNumberedHeader) {
                      return (
                        <h4 key={i} className="text-sm font-bold text-stone-900 font-serif pt-3 border-b border-stone-50 pb-1 flex gap-2">
                          <span className="text-amber-700">✦</span>
                          <span>{p}</span>
                        </h4>
                      );
                    }
                    return (
                      <p key={i} className="text-stone-600 text-xs leading-relaxed">
                        {p}
                      </p>
                    );
                  })}
                </div>

                {/* Category tags */}
                <div className="flex gap-1.5 flex-wrap pt-4 border-t border-stone-100">
                  {selectedPost.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>

              {/* Action Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 shrink-0 flex justify-end">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
