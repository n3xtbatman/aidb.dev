let toolData = {};
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
  try {
    const response = await fetch("https://raw.githubusercontent.com/n3xtbatman/aidb.dev/main/data/AIDB.json?cache=");
    const json = await response.json();
    toolData = json.Sheet11 || {};
    console.log("Loaded tools:", toolData);
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
  document.getElementById("autocompleteResults").classList.add("hidden");
  const flowchartEl = document.getElementById("flowchart-inner");
  flowchartEl.innerHTML = "";

  const rootLabel = simplifyPrompt(input);
  let diagram = `graph TD\nStart[\"${rootLabel}\"]\n`;

  const grouped = {};
  for (const [toolName, tool] of Object.entries(toolData)) {
    const key = `${tool.Category}__${tool.Subcategory}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ name: toolName, ...tool });
  }

  Object.entries(grouped).forEach(([groupKey, tools], i) => {
    const [cat, sub] = groupKey.split("__");
    const catId = `cat${i}`;
    const top = tools.find(t => t["Primary?"] === true);
    const alts = tools.filter(t => t["Primary?"] !== true);

    diagram += `Start --> ${catId}[\"${cat.toUpperCase()} - ${sub}\"]\n`;

    if (top) {
      const topId = `${catId}_top`;
      diagram += `${catId} --> ${topId}[\"<a href='${top.Website}' target='_blank'><b>${top.name}</b></a><br/>${top.Description}\"]\n`;
      diagram += `class ${topId} top;\n`;
    }

    alts.forEach((alt, j) => {
      const altId = `${catId}_alt${j}`;
      diagram += `${catId} --> ${altId}[\"<a href='${alt.Website}' target='_blank'>${alt.name}</a><br/>${alt.Description}\"]\n`;
      diagram += `class ${altId} alt;\n`;
    });
  });

  diagram += `\nclassDef top fill:#bbf7d0,stroke:#22c55e,stroke-width:2px,color:#064e3b,font-weight:bold;\n`;
  diagram += `classDef alt fill:#e5e7eb,stroke:#6b7280,stroke-width:1px,color:#374151;\n`;

  flowchartEl.innerHTML = `<div class='mermaid'>${diagram}</div>`;
  mermaid.run();
}
