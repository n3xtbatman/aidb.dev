window.onload = () => {
  console.log("✅ app.js loaded");

  // Show/hide example prompt modal
  function showExamples() {
    document.getElementById("exampleModal").classList.remove("hidden");
  }

  function hideExamples() {
    document.getElementById("exampleModal").classList.add("hidden");
  }

  // Make functions globally accessible from HTML
  window.showExamples = showExamples;
  window.hideExamples = hideExamples;

  // Load the tool database
  let toolData = [];

  fetch('data/AIDB.json')
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch AIDB.json");
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

  // Main flowchart generation function
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
      diagram += `    Tool${i}["${tool.Name}"]\n`;
      diagram += `    Start --> Tool${i}\n`;
    });

    // Safe Mermaid render
    if (typeof mermaid !== "undefined") {
      mermaid.initialize({ startOnLoad: false }); // Ensure it's ready
      mermaid.render('generatedFlowchart', diagram, svg => {
        flowchartEl.innerHTML = svg;
      });
    } else {
      console.error("❌ Mermaid is not defined");
      flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>Mermaid.js failed to load.</p>";
    }
  }

  // Expose this globally so the HTML button can call it
  window.generateFlowchart = generateFlowchart;
};
