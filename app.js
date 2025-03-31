let toolData = {};
let categoryData = {};
let simplifiedPrompts = [
  "Create Game", "Generate Art", "Build Website", "Train Model", "Analyze Text", "Make Music", "Transcribe Audio",
  "Design Logo", "Build App", "Write Story", "Create Presentation", "Summarize Article", "Translate Text",
  "Edit Video", "Compose Email", "Make Animation", "Visualize Data", "Build Chatbot", "Code Assistant", "Draft Resume",
  "Mockup UI", "Detect Emotion", "Upscale Image", "Generate Voice", "Create 3D Model", "Script Generator", "Podcast Tool",
  "Generate Headline", "Write Blog", "Speech Synthesis", "Design Character", "Turn Notes into Slides", "Video to Text",
  "AI Scheduling", "Study Assistant", "Interview Prep", "Generate Thumbnail", "Make Comic", "Storyboard Assistant",
  "Legal Drafting", "Productivity Tools", "HR Screening", "Cover Letter Writer", "Job Description Generator",
  "Avatar Generator", "Photo Enhancer", "Game Dialogue Writer", "Brand Naming Tool", "Create Dataset", "Essay Feedback",
  "Fashion Design", "Music Remix", "Generate Sound FX", "Market Research", "SEO Optimization", "Voice Cloning",
  "Real-Time Translation", "Multilingual Chat", "Interactive Tutor", "Generate Infographic", "AI Whiteboard",
  "Handwriting to Text", "Write Novel", "Create Meme", "AI Therapist", "Meeting Summarizer", "AI Email Reply",
  "Smart Note-taking", "Text to SQL", "Code Debugger", "Scene Generator", "Game Level Designer", "Generate Mock Data",
  "Survey Generator", "Slide Creator", "Story Continuation", "Color Palette Generator", "Photo to Sketch", "Cartoon Avatar",
  "AI Dungeon Master", "AI Architect", "UX Writer", "VR World Builder", "AR Tool", "Fitness Plan Generator",
  "Meal Planner", "Math Solver", "Generate Lyrics", "Voiceover Tool", "Image Captioning", "Style Transfer",
  "Game Mechanics Designer", "Web Scraping Assistant", "Create Quiz", "Music Visualizer", "App Store Description Generator",
  "Social Media Caption", "Generate QR Code", "Contract Analyzer", "Build Portfolio Site", "News Summarizer", "Voice Bot"
];

window.onload = async () => {
  console.log("app.js loaded");
  try {
    const response = await fetch("data/AIDB.json");
    const json = await response.json();
    toolData = json.Tools || {};
    categoryData = json.Categories || {};
    console.log("Loaded and converted AIDB.json:", { toolData, categoryData });
  } catch (error) {
    console.error("Error loading AIDB.json:", error);
  }
};

function showExamples() {
  document.getElementById("exampleModal").classList.remove("hidden");
}
function hideExamples() {
  document.getElementById("exampleModal").classList.add("hidden");
}

function showAutocomplete(input) {
  const resultsEl = document.getElementById("autocompleteResults");
  if (!input) {
    resultsEl.classList.add("hidden");
    return;
  }
  const matches = simplifiedPrompts.filter(p => p.toLowerCase().includes(input.toLowerCase())).slice(0, 10);
  if (matches.length === 0) {
    resultsEl.classList.add("hidden");
    return;
  }
  resultsEl.innerHTML = matches.map(m => `<div onclick="selectAutocomplete('${m}')">${m}</div>`).join('');
  resultsEl.classList.remove("hidden");
}
function selectAutocomplete(value) {
  document.getElementById("promptInput").value = value;
  document.getElementById("autocompleteResults").classList.add("hidden");
  generateFlowchart();
}

function simplifyPrompt(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes("game")) return "Create Game";
  if (lower.includes("art")) return "Generate Art";
  if (lower.includes("music")) return "Make Music";
  if (lower.includes("sound")) return "Generate Sound FX";
  if (lower.includes("code") || lower.includes("app") || lower.includes("build") || lower.includes("website")) return "Build App";
  if (lower.includes("ai tool")) return "Create AI Tool";
  return prompt.trim().split(" ").slice(0, 3).join(" ");
}

function generateFlowchart() {
  const input = document.getElementById("promptInput").value.toLowerCase();
  const flowchartEl = document.getElementById("flowchart").firstElementChild;
  const matchedCategories = [];

  for (const [category, data] of Object.entries(categoryData)) {
    const keywords = data.Keywords.toLowerCase().split(",").map(k => k.trim());
    if (keywords.some(keyword => input.includes(keyword))) {
      matchedCategories.push({ category, ...data });
    }
  }

  if (matchedCategories.length === 0) {
    flowchartEl.innerHTML = `<p class="text-red-600 text-lg">No matching tools found.</p>`;
    return;
  }

  let diagram = "graph TD\n";
  const rootLabel = simplifyPrompt(input);
  diagram += `Start["${rootLabel}"]\n`;

  matchedCategories.forEach((match, index) => {
    const idPrefix = match.category.toLowerCase();
    const topToolName = match["Top Tool"];
    const altToolNames = (match["Alt Tools"] || "").split(",").map(t => t.trim());
    const topTool = toolData[topToolName];
    const topToolLabel = `<b>${topToolName}</b>`;
    const topToolUrl = topTool?.Website || "#";

    const topId = `${idPrefix}_top`;
    diagram += `Start --> ${idPrefix}\n`;
    diagram += `${idPrefix}["${match.category.toUpperCase()}"] --> ${topId}["<a href='${topToolUrl}' target='_blank'>${topToolLabel}</a>"]\n`;
    diagram += `class ${topId} top;\n`;

    altToolNames.forEach((alt, i) => {
      const altTool = toolData[alt];
      const altId = `${idPrefix}_alt_${i}`;
      const label = altTool ? `<a href='${altTool.Website}' target='_blank'>${alt}</a>` : alt;
      diagram += `${idPrefix} --> ${altId}["${label}"]\n`;
      diagram += `class ${altId} alt;\n`;
    });
  });

  diagram += `
classDef top fill:#bbf7d0,stroke:#22c55e,stroke-width:2px,color:#064e3b,font-weight:bold;
classDef alt fill:#e5e7eb,stroke:#6b7280,stroke-width:1px,color:#374151;
`;

  flowchartEl.innerHTML = `<div class="mermaid">${diagram}</div>`;
  mermaid.run();
}
