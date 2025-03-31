console.log('app.js loaded');

let tools = {};
let categories = {};

fetch('data/AIDB.json')
  .then(response => response.json())
  .then(data => {
    tools = data.Tools;
    categories = data.Categories;
    console.log('Loaded and converted AIDB.json:', { tools, categories });
  })
  .catch(error => console.error('Error loading AIDB.json:', error));

function showExamples() {
  document.getElementById("exampleModal").classList.remove("hidden");
}

function hideExamples() {
  document.getElementById("exampleModal").classList.add("hidden");
}

function generateFlowchart() {
  const prompt = document.getElementById("promptInput").value.toLowerCase();
  const flowchartEl = document.getElementById("flowchart");
  const usedCategories = [];

  for (const [cat, config] of Object.entries(categories)) {
    const keywords = config.Keywords.toLowerCase().split(/,\s*/);
    if (keywords.some(k => prompt.includes(k))) {
      usedCategories.push({
        name: cat,
        top: config["Top Tool"],
        alts: config["Alt Tools"].split(/,\s*/)
      });
    }
  }

  if (usedCategories.length === 0) {
    flowchartEl.innerHTML = '<p class="text-red-600 font-semibold">No matching tools found.</p>';
    return;
  }

  let diagram = "graph TD\nStart[\"User Prompt\"]\n";
  let styles = "";

  usedCategories.forEach((catObj, i) => {
    const cat = catObj.name;
    const topToolName = catObj.top;
    const topTool = tools[topToolName];
    const topId = `${cat}_top`;
    const catId = `${cat}_cat`;

    diagram += `${catId}["${cat.toUpperCase()}"]\n`;
    diagram += `${topId}["<a href='${topTool.Website}' target='_blank'><b>${topToolName}</b></a>"]\n`;
    diagram += `Start --> ${catId}\n`;
    diagram += `${catId} --> ${topId}\n`;

    styles += `class ${topId} green;\n`;

    catObj.alts.forEach((altName) => {
      const altTool = tools[altName];
      if (altTool) {
        const altId = `${cat}_alt_${altName.replace(/\\W/g, '')}`;
        diagram += `${altId}["<a href='${altTool.Website}' target='_blank'>${altName}</a>"]\n`;
        diagram += `${catId} --> ${altId}\n`;
        styles += `class ${altId} gray;\n`;
      }
    });
  });

  diagram += `classDef green fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#166534,font-weight:bold;\n`;
  diagram += `classDef gray fill:#e5e7eb,stroke:#6b7280,stroke-width:1px,color:#374151;\n`;
  diagram += styles;

  console.log("Mermaid Diagram:\n", diagram);

  mermaid.render('generatedFlowchart', diagram, (svgCode) => {
    flowchartEl.innerHTML = svgCode;
  });
}
