let toolData = {};
let categoryData = {};

window.onload = async () => {
  console.log("app.js loaded");
  try {
    const response = await fetch("data/AIDB.json");
    const json = await response.json();
    toolData = json.Tools || {};
    categoryData = json.Categories || {};
    console.log("Loaded and parsed AIDB.json:", { toolData, categoryData });
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

function generateFlowchart() {
  const input = document.getElementById("promptInput").value.toLowerCase();
  const flowchartEl = document.getElementById("flowchart");

  const matchedCategories = [];

  for (const [category, data] of Object.entries(categoryData)) {
    const keywords = data.Keywords.toLowerCase().split(",").map(k => k.trim());
    if (keywords.some(keyword => input.includes(keyword))) {
      matchedCategories.push({ category, ...data });
    }
  }

  if (matchedCategories.length === 0) {
    flowchartEl.innerHTML = `<p class="text-red-600">No matching tools found.</p>`;
    return;
  }

  // Build Mermaid diagram
  let diagram = "graph TD\n";
  diagram += `Start["User Prompt"]\n`;

  const nodes = [];

  matchedCategories.forEach((match, index) => {
    const idPrefix = match.category.toLowerCase();
    const topToolName = match["Top Tool"];
    const altToolNames = (match["Alt Tools"] || "").split(",").map(t => t.trim());

    const topTool = toolData[topToolName];
    const topToolLabel = `<b>${topToolName}</b>`;
    const topToolUrl = topTool?.Website || "#";

    const topId = `${idPrefix}_top`;
    nodes.push(`${idPrefix}["${match.category.charAt(0).toUpperCase() + match.category.slice(1)}"]`);
    nodes.push(`${topId}["<a href='${topToolUrl}' target='_blank'>${topToolLabel}</a>"]`);
    diagram += `Start --> ${idPrefix}\n${idPrefix} --> ${topId}\n`;

    altToolNames.forEach((alt, i) => {
      const altTool = toolData[alt];
      const altId = `${idPrefix}_alt_${i}`;
      const label = altTool ? `<a href='${altTool.Website}' target='_blank'>${alt}</a>` : alt;
      nodes.push(`${altId}["${label}"]`);
      diagram += `${idPrefix} --> ${altId}\n`;
    });

    diagram += `class ${topId} top;\n`;
    altToolNames.forEach((_, i) => diagram += `class ${idPrefix}_alt_${i} alt;\n`);
  });

  // Add class defs
  diagram += `
classDef top fill:#bbf7d0,stroke:#22c55e,stroke-width:2px,color:#064e3b,font-weight:bold;
classDef alt fill:#e5e7eb,stroke:#6b7280,stroke-width:1px,color:#374151;
`;

  flowchartEl.innerHTML = `<div class="mermaid">${diagram}</div>`;
  mermaid.run();
}
