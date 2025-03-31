
function showExamples() {
  document.getElementById("exampleModal").classList.remove("hidden");
}

function hideExamples() {
  document.getElementById("exampleModal").classList.add("hidden");
}

function generateFlowchart() {
  const prompt = document.getElementById("promptInput").value.toLowerCase();
  let tools = [];

  if (prompt.includes("image") || prompt.includes("art")) {
    tools = ["DALL·E", "Midjourney"];
  } else if (prompt.includes("code")) {
    tools = ["GitHub Copilot", "Codex"];
  } else if (prompt.includes("voice") || prompt.includes("speech")) {
    tools = ["Whisper"];
  } else {
    tools = ["ChatGPT"];
  }

  const flowchartEl = document.getElementById("flowchart");
  const nodes = tools.map((tool, i) => `    Tool${i}["${tool}"]`).join("\n");
  const edges = tools.map((_, i) => `    Start --> Tool${i}`).join("\n");

  const diagram = `
    graph TD
    Start["User Prompt"]
${nodes}
${edges}
  `;

  mermaid.render('generatedFlowchart', diagram, (svgCode) => {
    flowchartEl.innerHTML = svgCode;
  });
}
