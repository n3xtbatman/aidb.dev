window.onload = () => {
  console.log("✅ app.js loaded");

  if (typeof mermaid !== "undefined") {
    mermaid.initialize({ startOnLoad: false });
    console.log("✅ Mermaid initialized");
  } else {
    console.error("❌ Mermaid script not found!");
  }

  function showExamples() {
    document.getElementById("exampleModal").classList.remove("hidden");
  }

  function hideExamples() {
    document.getElementById("exampleModal").classList.add("hidden");
  }

  window.showExamples = showExamples;
  window.hideExamples = hideExamples;

  let toolData = [];

  fetch('data/AIDB.json')
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch AIDB.json");
      return res.json();
    })
    .then(data => {
      toolData = Object.entries(data.Sheet1 || {}).map(([name, details]) => ({ Name: name, ...details }));
      console.log("✅ Loaded and converted AIDB.json:", toolData);
    })
    .catch(err => {
      console.error("❌ Error loading AIDB.json:", err);
      document.getElementById("flowchart").innerHTML = "<p class='text-red-600 mt-4'>Failed to load tools. Check the console.</p>";
    });

  function generateFlowchart() {
    console.log("🟢 Generate button clicked");

    const prompt = document.getElementById("promptInput").value.toLowerCase();
    const flowchartEl = document.getElementById("flowchart");

    if (!Array.isArray(toolData) || toolData.length === 0) {
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

    // ✅ Mermaid v11.6.0 requires "graph TD" at start and no wrapping
    let diagram = 'graph TD\nStart["User Prompt"]\n';
    matchedTools.forEach((tool, i) => {
      diagram += `Tool${i}["${tool.Name}"]\n`;
      diagram += `Start --> Tool${i}\n`;
    });

    const graphHtml = `<div class="mermaid">${diagram}</div>`;
    flowchartEl.innerHTML = graphHtml;

    // ✅ Force render with Mermaid.run()
    setTimeout(() => {
      mermaid.run();
    }, 0);
  }

  window.generateFlowchart = generateFlowchart;
};
