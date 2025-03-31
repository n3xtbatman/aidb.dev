console.log("app.js loaded");

let toolsData = {};
let categoryData = {};

// Load JSON and initialize Mermaid
fetch("AIDB.json")
  .then((response) => response.json())
  .then((json) => {
    toolsData = json.Tools;
    categoryData = json.Categories;
    console.log("Loaded and converted AIDB.json:", {
      tools: toolsData,
      categories: categoryData,
    });
  })
  .catch((err) => console.error("Error loading JSON:", err));

mermaid.initialize({ startOnLoad: false });
console.log("Mermaid initialized");

function showExamples() {
  document.getElementById("exampleModal").classList.remove("hidden");
}

function hideExamples() {
  document.getElementById("exampleModal").classList.add("hidden");
}

function generateFlowchart() {
  console.log("Generate button clicked");
  const prompt = document.getElementById("promptInput").value.toLowerCase();
  const flowchartEl = document.getElementById("flowchart");
  flowchartEl.innerHTML = "";

  let matchedCategories = [];

  for (const [category, data] of Object.entries(categoryData)) {
    const keywords = data.Keywords.toLowerCase().split(",");
    if (keywords.some((k) => prompt.includes(k.trim()))) {
      matchedCategories.push({ name: category, data });
    }
  }

  if (matchedCategories.length === 0) {
    flowchartEl.innerHTML =
      '<p class="text-red-500 text-center mt-6">No matching tools found.</p>';
    return;
  }

  let diagram = `graph TD
Start["User Prompt"]
`;

  let classDefs = [];
  let connections = [];

  matchedCategories.forEach((cat, index) => {
    const name = cat.name;
    const top = cat.data["Top Tool"];
    const alts = cat.data["Alt Tools"].split(",").map((a) => a.trim());

    const topLink = toolsData[top]?.Website || "#";
    const altLinks = alts.map((a) => ({
      name: a,
      link: toolsData[a]?.Website || "#",
    }));

    const topNode = `${name}_top["<a href='${topLink}' target='_blank'><b>${top}</b></a>"]`;
    diagram += `${name}["${name.charAt(0).toUpperCase() + name.slice(1)}"]
${name}_top${topNode}
`;
    connections.push(`Start --> ${name}`, `${name} --> ${name}_top`);
    classDefs.push(`class ${name}_top green;`);

    altLinks.forEach((alt, i) => {
      const nodeName = `${name}_alt_${i}`;
      diagram += `${nodeName}["<a href='${alt.link}' target='_blank'>${alt.name}</a>"]
`;
      connections.push(`${name} --> ${nodeName}`);
      classDefs.push(`class ${nodeName} gray;`);
    });
  });

  diagram += connections.join("
") + "
";
  diagram += "classDef green fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#065f46,font-weight:bold;
";
  diagram += "classDef gray fill:#f3f4f6,stroke:#d1d5db,stroke-width:1px,color:#374151;
";
  diagram += classDefs.join("
");

  console.log("Mermaid diagram source:\n", diagram);

  mermaid.render("generatedFlowchart", diagram, (svgCode) => {
    flowchartEl.innerHTML = svgCode;
  });
}
