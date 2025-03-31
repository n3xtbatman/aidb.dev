<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Flowchart Generator</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    #autocompleteResults {
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      width: 100%;
      max-height: 200px;
      overflow-y: auto;
      z-index: 50;
      text-align: left;
    }
    #autocompleteResults div {
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
    #autocompleteResults div:hover {
      background-color: #f3f4f6;
    }
    #flowchart svg {
      width: 100%;
    }
  </style>
</head>
<body class="bg-white text-gray-900 font-sans">
  <div class="container mx-auto py-16 px-4 text-center">
    <h1 class="text-3xl font-bold mb-8">Generate a Flowchart</h1>

    <div class="max-w-xl mx-auto relative">
      <input id="promptInput" type="text" placeholder="Type your prompt..." class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" oninput="showAutocomplete(this.value)" onkeydown="if(event.key === 'Enter') generateFlowchart()" />
      <div id="autocompleteResults" class="hidden"></div>
      <button onclick="generateFlowchart()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">Generate Flowchart</button>
      <p class="mt-4 text-sm text-blue-500 cursor-pointer" onclick="showExamples()">Example Prompts</p>
    </div>

    <div id="flowchart" class="mt-12 w-full overflow-x-auto"><div class="mx-auto" style="max-width: 1000px;"></div></div>
  </div>

  <!-- Modal -->
  <div id="exampleModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md">
      <h2 class="text-xl font-semibold mb-4">Example Prompts</h2>
      <ul class="text-left space-y-2">
        <li>🎮 "I want to make a game"</li>
        <li>🎨 "What tools generate concept art?"</li>
        <li>🎧 "Find AI music generators"</li>
      </ul>
      <button onclick="hideExamples()" class="mt-6 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">Close</button>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.0/dist/mermaid.min.js"></script>
  <script src="app.js" defer></script>
</body>
</html>
