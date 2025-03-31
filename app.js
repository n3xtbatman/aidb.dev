// Keep these — unchanged
function showExamples() {
  document.getElementById("exampleModal").classList.remove("hidden");
}

function hideExamples() {
  document.getElementById("exampleModal").classList.add("hidden");
}

// NEW: Load tool data from AIDB.json
let toolData = [];

fetch('data/AIDB.json')
  .then(res => res.json())
  .then(data => {
    toolData = data;
    console.log("Loaded tools:", toolData);
  })
  .catch(err => console.error("Failed to load tool data:", err));

// NEW: Replace this function
function generateFlowchart() {
  const prompt = document.getElementById("promptInput").value.toLowerCase();
  const flowchartEl = document.getElementById("flowchart");

  const matchedTools = toolData.filter(tool =>
    tool["Use Cases"]
      .toLowerCase()
      .split(',')
      .some(tag => prompt.includes(tag.trim()))
  );

  if (matchedTools.length === 0) {
    flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>No matching tools found for that prompt.</p>";
    return;
  }

  let diagram = 'graph TD\n    Start["User Prompt"]\n';
  matchedTools.forEach((tool, i) => {
    diagram += `    Tool${i}["${tool.Name}"]\n`;
    diagram += `    Start --> Tool${i}\n`;
  });

  mermaid.render('generatedFlowchart', diagram, svg => {
    flowchartEl.innerHTML = svg;
  });
}
