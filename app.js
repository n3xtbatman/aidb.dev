window.onload = () => {
  console.log("✅ app.js loaded");

  if (typeof mermaid !== "undefined") {
    mermaid.initialize({ startOnLoad: false });
    console.log("✅ Mermaid initialized");
  } else {
    console.error("❌ Mermaid not found!");
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
    .then(res => res.json())
    .then(data => {
      tools = data.Tools || {};
      categories = data.Categories || {};
      console.log("✅ Loaded and converted AIDB.json:", { tools, categories });
    })
    .catch(err => {
      console.error("❌ Error loading AIDB.json:", err);
      document.getElementById("flowchart").innerHTML = "<p class='text-red-600 mt-4'>Failed to load tool data.</p>";
    });

  function sanitizeId(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, "_");
  }

  function generateFlowchart() {
    console.log("🟢 Generate button clicked");

    const prompt = document.getElementById("promptInput").value.toLowerCase().trim();
    const flowchartEl = document.getElementById("flowchart");

    if (!Object.keys(categories).length || !Object.keys(tools).length) {
      flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>Tool database not ready yet.</p>";
      return;
    }

    const matchedCategories = [];

    for (const [cat, info] of Object.entries(categories)) {
      const keywords = (info["Keywords"] || "").toLowerCase().split(',').map(k => k.trim());
      const matches = keywords.some(k => prompt.includes(k));
      if (matches) {
        matchedCategories.push(cat);
      }
    }

    if (matchedCategories.length === 0) {
      flowchartEl.innerHTML = "<p class='text-red-600 mt-4'>No matching tools found.</p>";
      return;
    }

    let diagram = "graph TD\n";
    diagram += `Start["User Prompt"]\n`;

    const nodeStyles = [];
    const clickDirectives = [];
    const links = [];

    matchedCategories.forEach((cat) => {
      const catId = sanitizeId(cat);
      diagram += `${catId}["${cat.charAt(0).toUpperCase() + cat.slice(1)}"]\n`;
      links.push(`Start --> ${catId}`);

      const topToolName = categories[cat]["Top Tool"];
      const topToolId = sanitizeId(`${cat}_top`);
      diagram += `${topToolId}["${topToolName}"]\n`;
      links.push(`${catId} --> ${topToolId}`);
      nodeStyles.push(`${topToolId}:::green`);

      const topUrl = tools[topToolName]?.Website || "#";
      clickDirectives.push(`click ${topToolId} "${topUrl}" _blank`);

      const altTools = (categories[cat]["Alt Tools"] || "").split(',').map(t => t.trim()).filter(t => t && t !== topToolName);
      altTools.forEach((alt, j) => {
        const altId = sanitizeId(`${cat}_alt_${j}_${alt}`);
        diagram += `${altId}["${alt}"]\n`;
        links.push(`${catId} --> ${altId}`);
        nodeStyles.push(`${altId}:::gray`);
        const altUrl = tools[alt]?.Website || "#";
        clickDirectives.push(`click ${altId} "${altUrl}" _blank`);
      });
    });

    diagram += links.join("\n") + "\n";
    diagram += "classDef green fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#065f46,font-weight:bold;\n";
    diagram += "classDef gray fill:#e5e7eb,stroke:#6b7280,stroke-width:1px,color:#374151;\n";
    if (nodeStyles.length) {
      diagram += "class " + nodeStyles.join(", ") + ";\n";
    }
    diagram += clickDirectives.join("\n") + "\n";

    console.log("🧪 Mermaid diagram source:\n", diagram);
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
