window.onload = () => {
  console.log("✅ app.js loaded");

  function showExamples() {
    document.getElementById("exampleModal").classList.remove("hidden");
  }

  function hideExamples() {
    document.getElementById("exampleModal").classList.add("hidden");
  }

  // Load tool data
  let toolData = [];

  fetch('data/AIDB.json')
    .then(res => res.json())
    .then(data => {
      toolData = data;
      console.log("✅ Loaded AIDB.json:", toolData);
    })
    .catch(err => {
      console.error("❌ Error loading AIDB.json:", err);
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
      flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>No matching tools found.</p>";
      return;
    }

    let diagram = 'graph TD\n    Start["User Prompt"]\n';
    matchedTools.forEach((tool, i) => {
      const label = `${tool.Name}`;
      diagram += `    Tool${i}["${label}"]\n`;
      diagram += `    Start --> Tool${i}\n`;
    });

    // Mermaid render
    if (typeof mermaid !== "undefined") {
      mermaid.render('generatedFlowchart', diagram, svg => {
        flowchartEl.innerHTML = svg;
      });
    } else {
      console.error("❌ Mermaid is not loaded");
      flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>Mermaid.js failed to load.</p>";
    }
  }

  // Attach function to global window so HTML can see it
  window.generateFlowchart = generateFlowchart;
  window.showExamples = showExamples;
  window.hideExamples = hideExamples;
};
