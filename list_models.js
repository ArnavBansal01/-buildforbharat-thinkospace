// listmodel.js
const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API KEY found in env");
  process.exit(1);
}

async function listModels() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
   
    if (data.error) {
      console.error("Error listing models:", data.error);
    } else {
      console.log("Available Groq Models:");
      if (data.data) {
        data.data.forEach(m => {
           console.log(`- ${m.id}`);
        });
      } else {
          console.log("No models found:", data);
      }
    }

  } catch (error) {
    console.error("Script Error:", error);
  }
}

listModels();