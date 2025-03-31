console.log("✅ app.js loaded");

function showExamples() {
  document.getElementById("exampleModal").classList.remove("hidden");
}

function hideExamples() {
  document.getElementById("exampleModal").classList.add("hidden");
}

// Load the tool data from AIDB.json
let toolData = [];

fetch('data/AIDB.json')
  .then(res => {
    if (!res.ok) throw new Error("Failed to load AIDB.json");
    return res.json();
  })
  .then(data => {
    toolData = data;
    console.log("✅ Loaded AIDB.json:", toolData);
  })
  .catch(err => {
    console.error("❌ Error loading AIDB.json:", err);
    document.getElementById("flowchart").innerHTML = "<p class='text-red-600 mt-4'>Failed to load tools. Check the console.</p>";
  });

function generateFlowchart() {
  console.log("🟢 Generate button clicked");

  const prompt = document.getElementById("promptInput").value.toLowerCase();
  const flowchartEl = document.getElementById("flowchart");

  if (!toolData || toolData.length === 0) {
    flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>Tool database not loaded yet.</p>";
    return;
  }

  const matchedTools = toolData.filter(tool => {
    const useCases = tool["Use Cases"] || "";
    return useCases.toLowerCase().split(',').some(tag => prompt.includes(tag.trim()));
  });

  if (matchedTools.length === 0) {
    flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>No matching tools found for that prompt.</p>";
    return;
  }

  // Build Mermaid diagram
  let diagram = 'graph TD\n    Start["User Prompt"]\n';
  matchedTools.forEach((tool, i) => {
    const label = `${tool.Name}`; // you can add more info here if needed
    diagram += `    Tool${i}["${label}"]\n`;
    diagram += `    Start --> Tool${i}\n`;
  });

  mermaid.render('generatedFlowchart', diagram, svg => {
    flowchartEl.innerHTML = svg;
  });
}
