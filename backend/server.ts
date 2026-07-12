import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Setup uploads directory
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max payload to support direct video file uploads
  },
});

// Helper to read database
function readDatabase() {
  const dbPath = path.join(process.cwd(), "backend", "db.json");
  try {
    const raw = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read database:", error);
    return { recipes: [], handicrafts: [], blogs: [], videos: [] };
  }
}

// Helper to write database
function writeDatabase(data: any) {
  const dbPath = path.join(process.cwd(), "backend", "db.json");
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write database:", error);
    return false;
  }
}

// GET all dynamic data
app.get("/api/data", (req, res) => {
  res.json(readDatabase());
});

// POST upload file
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// POST new recipe
app.post("/api/recipes", (req, res) => {
  const db = readDatabase();
  const newRecipe = {
    id: "rec_" + Date.now(),
    ...req.body,
  };
  db.recipes.unshift(newRecipe);
  writeDatabase(db);
  res.json(newRecipe);
});

// DELETE recipe
app.delete("/api/recipes/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  db.recipes = db.recipes.filter((item: any) => item.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// POST new handicraft
app.post("/api/crafts", (req, res) => {
  const db = readDatabase();
  const newCraft = {
    id: "craft_" + Date.now(),
    ...req.body,
  };
  db.handicrafts.unshift(newCraft);
  writeDatabase(db);
  res.json(newCraft);
});

// DELETE handicraft
app.delete("/api/crafts/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  db.handicrafts = db.handicrafts.filter((item: any) => item.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// POST new video
app.post("/api/videos", (req, res) => {
  const db = readDatabase();
  const newVideo = {
    id: "vid_" + Date.now(),
    ...req.body,
  };
  db.videos.unshift(newVideo);
  writeDatabase(db);
  res.json(newVideo);
});

// DELETE video
app.delete("/api/videos/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  db.videos = db.videos.filter((item: any) => item.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// POST new blog post
app.post("/api/blogs", (req, res) => {
  const db = readDatabase();
  const newBlog = {
    id: "blog_" + Date.now(),
    ...req.body,
  };
  db.blogs.unshift(newBlog);
  writeDatabase(db);
  res.json(newBlog);
});

// DELETE blog post
app.delete("/api/blogs/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  db.blogs = db.blogs.filter((item: any) => item.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// Initialize Gemini SDK lazily to handle missing keys gracefully
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// AI Kitchen and Craft Planner API Endpoint
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAiClient();

    if (!ai) {
      // Graceful fallback when the user has not set up their GEMINI_API_KEY in the Secrets panel yet.
      // This ensures a beautiful, fully functional preview experience at all times!
      console.log("GEMINI_API_KEY is not configured. Providing a helpful fallback tip.");
      
      const promptLower = message.toLowerCase();
      let responseText = "";

      if (promptLower.includes("recipe") || promptLower.includes("cook") || promptLower.includes("eat") || promptLower.includes("mango") || promptLower.includes("fish") || promptLower.includes("sweet")) {
        responseText = `✨ **[Simulated AI Assistant - Setup a Gemini Key in Secrets to enable live AI!]**\n\nBased on your culinary interest, here is an exclusive tip from Luxmi's kitchen:\n\n*When cooking traditional dishes like Mustard Hilsa (Shorshe Ilish), always soak yellow and black mustard seeds in warm water with a pinch of salt and grind them with a green chili. This completely neutralizes any bitter taste and leaves you with an exceptionally smooth, pungent, and fragrant sauce.* \n\nTry asking about handicrafts, or enter your API key in the Secrets panel to unlock custom cooking recommendations!`;
      } else if (promptLower.includes("craft") || promptLower.includes("diy") || promptLower.includes("decor") || promptLower.includes("paint") || promptLower.includes("paper")) {
        responseText = `✨ **[Simulated AI Assistant - Setup a Gemini Key in Secrets to enable live AI!]**\n\nBased on your hand-craft interest, here is a special crafting tip from Luxmi's studio:\n\n*If you are painting baked earthen clay cups (Kullhads), always start with a solid coat of white acrylic paint. Since raw baked clay is highly porous, it absorbs acrylics rapidly, making colors look dull. A white primer base ensures that your final mandala dots and gold flourishes look incredibly bright and radiant!* \n\nTry asking about recipes, or connect your API key to get customized step-by-step craft plans based on materials in your house!`;
      } else {
        responseText = `✨ **[Simulated AI Assistant - Setup a Gemini Key in Secrets to enable live AI!]**\n\nWelcome to Luxmi's Culinary & Crafts Hub!\n\nI can help you plan customized dinners, match recipes with hand-crafted plate designs, or discover sustainable upcycling ideas. To unlock live, personalized answers from Gemini, please enter your **GEMINI_API_KEY** in the **Settings > Secrets** panel in the AI Studio interface.\n\nIn the meantime, feel free to explore our searchable recipe database, step-by-step handicraft guides, and YouTube video collection!`;
      }

      return res.json({ text: responseText });
    }

    // Configure system instruction to fit the exact persona of Luxmi's channel
    const systemInstruction = `You are Luxmi, the warm, expert, creative, and highly encouraging host of the "Luxmi's Culinary & Crafts" YouTube channel (https://www.youtube.com/@Luxmisculinary). 
Your channel blends beautiful traditional culinary recipes (especially Indian and Bengali cuisines, dessert art, and innovative food presentation) with delightful handmade crafts (clay work, upcycling, jute work, origami table settings, and boho-chic home decors).

Guidelines for your answers:
1. Speak directly, warmly, and encouragingly, using words like "Hello, fellow creators!", "In my kitchen...", "In my crafting studio..." or "Warmly, Luxmi".
2. When asked for recipes, provide structured lists of ingredients and simple step-by-step cooking steps. Suggest elegant plating or food-styling touches (such as incorporating organic shapes, serving in odd numbers, or utilizing raw clay Kullhads).
3. When asked for handicrafts, list accessible materials (such as cardboard, jute rope, acrylic paints, scrap paper, glass jars) and list numbered steps. Give useful hacks (e.g., priming baked clay with white paint, drilling slowly to prevent cracks).
4. Feel free to cross-recommend! If someone asks for a recipe, suggest a beautiful companion handmade table decor (e.g., "This Mango Lassi tastes divine when served in my hand-painted Kullhads, which we decorated in my craft tutorial!").
5. Keep your answers concise, exceptionally clean, and formatted with elegant Markdown bullet points. Avoid clinical jargon; write in an artistic, rustic, yet polished voice.`;

    // Construct the contents for generateContent. Include conversational history if provided.
    let contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((turn: any) => {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }],
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "I'm sorry, I couldn't generate a tip right now. Please try again!";
    res.json({ text });
  } catch (error: any) {
    console.error("Error communicating with Gemini:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Setup Vite Dev server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
