export interface Recipe {
  id: string;
  title: string;
  category: "Dessert" | "Main Course" | "Appetizer" | "Snack" | "Beverage";
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: string[];
  instructions: string[];
  image: string;
  description: string;
  tags: string[];
  tips?: string[];
  youtubeUrl?: string;
}

export interface HandiCraft {
  id: string;
  title: string;
  category: "Home Decor" | "Clay Craft" | "Paper Art" | "Kitchen DIY" | "Greeting Cards";
  timeRequired: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  materials: string[];
  steps: string[];
  image: string;
  description: string;
  tags: string[];
  tips?: string[];
  youtubeUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: "Kitchen Hacks" | "Handmade Design" | "Food Styling" | "Eco-Friendly DIY";
  date: string;
  author: string;
  readTime: string;
  summary: string;
  content: string[];
  image: string;
  tags: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  category: "Culinary" | "Handicraft";
  duration: string;
  description: string;
  publishDate: string;
  thumbnail?: string;
}
