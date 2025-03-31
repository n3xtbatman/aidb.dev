console.log("app.js loaded");

let toolData = {};
let categoryData = {};

// Load JSON data
fetch("AIDB.json")
  .then((response) => response.json())
  .then((data) => {
    console.log("Loaded and converted AIDB.json:", data);
    toolData = data.Tools;
    categoryData = data.Categories;
  });

// Show/hide examples
function showExamples() {
  document.getElementById("exampleModal").classList.remove("hidden");
}
function hideExamples() {
  document.getElementById("exampleModal").classList.add("hidden");
}

// Generate Flowchart
function generateFlowchart() {
  const prompt = document.getElementById("promptInput").value.toLowerCase();
  const flowchartEl = document.getElementById("flowchart");
  flowchartEl.innerHTML = "";

  console.log("Generate button clicked");

  const matchedCategories = [];

  for (const category in categoryData) {
    const keywords = categoryData[category].Keywords.toLowerCase().split(",");
    if (keywords.some((k) => prompt.includes(k.trim()))) {
      matchedCategories.push(category);
    }
  }

  if (matchedCategories.length === 0) {
    flowchartEl.innerHTML =
      '<p class="text-red-500 mt-6 text-lg">No matching tools found.</p>';
    return;
  }

  let diagram = `graph TD\n  Start["User Prompt"]\n`;

  matchedCategories.forEach((category) => {
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
    const topTool = categoryData[category]["Top Tool"];
    const altTools = categoryData[category]["Alt Tools"]
      ? categoryData[category]["Alt Tools"].split(",").map((t) => t.trim())
      : [];

    diagram += `  ${category}["${catLabel}"]\n`;
    diagram += `  Start --> ${category}\n`;

    if (toolData[topTool]) {
      const link = toolData[topTool].Website;
      diagram += `  ${category}_top["<a href='${link}' target='_blank'><b>${topTool}</b></a>"]\n`;
      diagram += `  ${category} --> ${category}_top\n`;
    }

    altTools.forEach((alt, index) => {
      if (toolData[alt]) {
        const link = toolData[alt].Website;
        const id = `${category}_alt_${index}`;
        diagram += `  ${id}["<a href='${link}' target='_blank'>${alt}</a>"]\n`;
        diagram += `  ${category} --> ${id}\n`;
      }
    });
  });

  console.log("Mermaid diagram source:\n", diagram);

  try {
    mermaid.render("generatedFlowchart", diagram, (svgCode) => {
      flowchartEl.innerHTML = svgCode;
    });
  } catch (err) {
    console.error(err);
    flowchartEl.innerHTML = `<p class="text-red-500 mt-6 text-lg">Error rendering diagram.</p>`;
  }
}
