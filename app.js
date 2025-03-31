console.log("app.js loaded");

let tools = {};
let categories = {};

fetch("AIDB.json")
  .then((res) => res.json())
  .then((data) => {
    tools = data.Tools;
    categories = data.Categories;
    console.log("Loaded and converted AIDB.json:", { tools, categories });
  });

mermaid.initialize({ startOnLoad: false });
console.log("Mermaid initialized");

function showExamples() {
  document.getElementById("exampleModal").classList.remove("hidden");
}

function hideExamples() {
  document.getElementById("exampleModal").classList.add("hidden");
}

function generateFlowchart() {
  const prompt = document.getElementById("promptInput").value.toLowerCase();
  console.log("Generate button clicked");

  const matchedCategories = Object.entries(categories).filter(([cat, config]) => {
    const keywords = config.Keywords.toLowerCase().split(/[, ]+/);
    return keywords.some((kw) => prompt.includes(kw));
  });

  if (matchedCategories.length === 0) {
    document.getElementById("flowchart").innerHTML =
      '<p class="text-red-500">No matching tools found.</p>';
    return;
  }

  let diagram = "graph TD\n";
  diagram += "  Start[\"User Prompt\"]\n";

  const clickDefs = [];
  const classDefs = [
    "classDef green fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#065f46,font-weight:bold;",
    "classDef gray fill:#f1f5f9,stroke:#64748b,stroke-width:1px,color:#374151;"
  ];

  matchedCategories.forEach(([cat, config]) => {
    const top = config["Top Tool"];
    const alts = config["Alt Tools"] ? config["Alt Tools"].split(",").map(t => t.trim()) : [];

    const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
    const topId = `${cat}_top`;

    diagram += `  ${cat}["${catLabel}"]\n`;
    diagram += `  ${topId}["${top}"]\n`;
    diagram += `  Start --> ${cat}\n`;
    diagram += `  ${cat} --> ${topId}\n`;

    const topUrl = tools[top]?.Website || "#";
    clickDefs.push(`click ${topId} "${topUrl}" _blank`);
    classDefs.push(`class ${topId} green`);

    alts.forEach((alt, j) => {
      const altId = `${cat}_alt_${j}`;
      diagram += `  ${altId}["${alt}"]\n`;
      diagram += `  ${cat} --> ${altId}\n`;
      const altUrl = tools[alt]?.Website || "#";
      clickDefs.push(`click ${altId} "${altUrl}" _blank`);
      classDefs.push(`class ${altId} gray`);
    });
  });

  const fullDiagram = [diagram, ...clickDefs, ...classDefs].join("\n");
  console.log("Mermaid diagram source:\n" + fullDiagram);

  mermaid.render("generatedFlowchart", fullDiagram, (svgCode) => {
    document.getElementById("flowchart").innerHTML = svgCode;
  });
}
