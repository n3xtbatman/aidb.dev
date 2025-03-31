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

  let tools = {};
  let categories = {};

  fetch('data/AIDB.json')
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch AIDB.json");
      return res.json();
    })
    .then(data => {
      tools = data.Tools || {};
      categories = data.Categories || {};
      console.log("✅ Loaded and parsed AIDB.json");
    })
    .catch(err => {
      console.error("❌ Error loading AIDB.json:", err);
      document.getElementById("flowchart").innerHTML = "<p class='text-red-600 mt-4'>Failed to load tool data.</p>";
    });

  function sanitizeId(str) {
    return str.replace(/[^a-zA-Z0-9]/g, "_");
  }

  function generateFlowchart() {
    console.log("🟢 Generate button clicked");

    const prompt = document.getElementById("promptInput").value.toLowerCase();
    const flowchartEl = document.getElementById("flowchart");

    if (!Object.keys(categories).length || !Object.keys(tools).length) {
      flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>Tool database not ready yet.</p>";
      return;
    }

    const matchedCategories = [];

    for (const [cat, info] of Object.entries(categories)) {
      const keywords = info["Keywords"].toLowerCase().split(',').map(k => k.trim());
      if (keywords.some(k => prompt.includes(k))) {
        matchedCategories.push(cat);
      }
    }

    if (matchedCategories.length === 0) {
      flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>No relevant categories found for this prompt.</p>";
      return;
    }

    // Start diagram
    let diagram = "graph TD\n";
    diagram += `Start["Your Prompt"]\n`;

    const nodeStyles = [];
    const links = [];

    matchedCategories.forEach((cat, i) => {
      const catId = sanitizeId(cat);
      diagram += `${catId}["${cat.charAt(0).toUpperCase() + cat.slice(1)}"]\n`;
      links.push(`Start --> ${catId}`);

      const topToolName = categories[cat]["Top Tool"];
      const topToolId = sanitizeId(`${cat}_top`);
      const topToolUrl = tools[topToolName]?.Website || "#";

      diagram += `${topToolId}["<a href='${topToolUrl}' target='_blank'><b>${topToolName}</b></a>"]\n`;
      links.push(`${catId} --> ${topToolId}`);
      nodeStyles.push(`${topToolId}:::green`);

      const altTools = (categories[cat]["Alt Tools"] || "").split(',').map(t => t.trim()).filter(t => t && t !== topToolName);
      altTools.forEach((alt, j) => {
        const altId = sanitizeId(`${cat}_alt_${j}`);
        const altUrl = tools[alt]?.Website || "#";
        diagram += `${altId}["<a href='${altUrl}' target='_blank'>${alt}</a>"]\n`;
        links.push(`${catId} --> ${altId}`);
        nodeStyles.push(`${altId}:::gray`);
      });
    });

    diagram += links.join("\n") + "\n";
    diagram += "classDef green fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#065f46,font-weight:bold;\n";
    diagram += "classDef gray fill:#e5e7eb,stroke:#6b7280,stroke-width:1px,color:#374151;\n";
    diagram += "class " + nodeStyles.join(", ") + ";\n";

    console.log("🧪 Mermaid Diagram:\n", diagram);
    flowchartEl.innerHTML = `<div class="mermaid">${diagram}</div>`;

    setTimeout(() => {
      try {
        mermaid.run();
      } catch (err) {
        console.error("❌ Mermaid render error:", err);
        flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>Diagram render failed.</p>";
      }
    }, 0);
  }

  window.generateFlowchart = generateFlowchart;
};
