import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, RefreshCw, AlertCircle, ChefHat, Scissors, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hello, fellow creators! I'm Luxmi. In my kitchen and crafting studio, art and cooking always go hand-in-hand! \n\nTell me what ingredients are inside your fridge, or what leftover craft supplies you have (like jute rope, scrap paper, or cardboard), and I will instantly plan a customized recipe or craft tutorial for you! How can we build something beautiful today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Suggestions tags
  const suggestions = [
    { label: "Leftovers: Mango, Yogurt, Honey", icon: ChefHat },
    { label: "Leftovers: Clay cups & acrylics", icon: Scissors },
    { label: "Table design tips for festival dinners", icon: HelpCircle },
    { label: "3 eco-friendly kitchen hacks", icon: HelpCircle }
  ];

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Submit message to express API proxy
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMessage: Message = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(1), // Exclude the first welcome message from API history
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the AI Planner server.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "model",
        text: "History cleared! Ask me anything about cooking traditional recipes, kitchen organizing, upcycling crafts, or beautiful food presentation."
      }
    ]);
    setError(null);
  };

  // Safe custom markdown parser for bullet lists, bold text, and headers
  const renderFormattedText = (rawText: string) => {
    return rawText.split("\n").map((line, idx) => {
      let currentLine = line;

      // Handle bold tags (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parsedParts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(currentLine)) !== null) {
        if (match.index > lastIndex) {
          parsedParts.push(currentLine.substring(lastIndex, match.index));
        }
        parsedParts.push(
          <strong key={match.index} className="font-bold text-stone-900">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < currentLine.length) {
        parsedParts.push(currentLine.substring(lastIndex));
      }

      // Render headers starting with ### or ##
      if (currentLine.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-stone-950 mt-4 mb-2 font-serif">
            {currentLine.replace("### ", "")}
          </h4>
        );
      }
      if (currentLine.startsWith("## ") || currentLine.startsWith("✨ ")) {
        return (
          <h3 key={idx} className="text-base font-bold text-amber-700 mt-4 mb-2 font-serif border-b border-stone-100 pb-1 flex items-center gap-1">
            {currentLine}
          </h3>
        );
      }

      // Render bullet points starting with - or *
      if (currentLine.trim().startsWith("- ") || currentLine.trim().startsWith("* ")) {
        const cleanBullet = currentLine.replace(/^[\s*-]+/, "").trim();
        return (
          <li key={idx} className="text-stone-700 text-xs ml-4 list-disc pl-1.5 py-0.5 leading-relaxed">
            {parsedParts.length > 0 ? parsedParts : cleanBullet}
          </li>
        );
      }

      // Default paragraph rendering
      return currentLine.trim() === "" ? (
        <div key={idx} className="h-2.5" />
      ) : (
        <p key={idx} className="text-stone-700 text-xs leading-relaxed py-0.5">
          {parsedParts.length > 0 ? parsedParts : currentLine}
        </p>
      );
    });
  };

  return (
    <div id="ai-planner-panel" className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 border-none outline-hidden">
      
      {/* Informative instructions side column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/60 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-950">AI Creative Planner</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Plan custom recipes and crafts in seconds! Powered by Gemini, Luxmi's AI helper cross-references her signature design tips with what you have on hand.
            </p>
          </div>

          <div className="border-t border-stone-200/60 pt-4 space-y-3.5">
            <div className="flex items-start gap-3">
              <ChefHat className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-800">What to cook?</h4>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">Enter whatever vegetables or dairy ingredients are nearing expiry.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scissors className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-800">What to craft?</h4>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">Suggest discarded jars, old rope, or newspaper to get rustic DIY ideas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Tags */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider pl-1 block">Try asking:</span>
          <div className="flex flex-col gap-2">
            {suggestions.map((sug, i) => {
              const SugIcon = sug.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug.label)}
                  className="w-full text-left p-3 rounded-xl border border-stone-200 bg-white hover:bg-amber-50/40 hover:border-amber-200 text-xs font-medium text-stone-700 transition-all flex items-center gap-2.5 shadow-xs cursor-pointer"
                >
                  <SugIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{sug.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 flex flex-col h-[580px] shadow-sm overflow-hidden">
        
        {/* Chat header */}
        <div className="px-5 py-4 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-stone-800">Luxmi Assistant</span>
          </div>

          <button 
            onClick={handleClearHistory}
            className="text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 text-[11px] font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Message bubble streams */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isBot = msg.role === "model";
            return (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isBot ? "self-start" : "self-end flex-row-reverse ml-auto"}`}
              >
                {/* Profile Icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                  isBot 
                    ? "bg-amber-100 border-amber-200 text-amber-700" 
                    : "bg-stone-100 border-stone-200 text-stone-700"
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble message body */}
                <div className={`p-4 rounded-2xl text-xs space-y-2 border ${
                  isBot 
                    ? "bg-stone-50/50 border-stone-100 text-stone-800 rounded-tl-sm" 
                    : "bg-amber-600 border-amber-600 text-white rounded-tr-sm"
                }`}>
                  {isBot ? (
                    renderFormattedText(msg.text)
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loader bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[80%] self-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-100 border border-amber-200 text-amber-700 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-sm bg-stone-50 border border-stone-100 text-stone-600 text-xs flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-300" />
                </div>
                <span>Luxmi is thinking...</span>
              </div>
            </div>
          )}

          {/* Error panel */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-start gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Communication Error</p>
                <p className="text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Message Input Panel */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about recipes, crafts, styling hacks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:hover:bg-stone-900 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-stone-400 text-center mt-2 font-mono">
            Protip: Enter your GEMINI_API_KEY in the Secrets menu to enable live answers.
          </p>
        </div>

      </div>
    </div>
  );
}
