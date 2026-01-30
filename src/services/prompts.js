export const PROMPTS = {
  magicToDo: (task) =>
    `Break down the following task into smaller, actionable subtasks. Return ONLY the list of tasks, one per line. Do not use bullets or numbers. Task: "${task}"`,

  formalizer: (text, tone) =>
    `Rewrite the following text to be ${tone}. Keep the meaning the same but adjust the tone accordingly. Return ONLY the rewritten text. Text: "${text}"`,

  judge: (text) =>
    `Analyze the execution, tone, and implicit meaning of the following text. Judge it. Text: "${text}" but dont write very big things just tell in 1 line for each in a very concise and formal way and also write each in new lines`,

  professor: (topic) =>
    `Explain "${topic}" in simple terms, like a professor teaching a student. Include key concepts and examples if useful. but have a very concise way of explanation and text should be in a good format`,

  consultant: (situation) =>
    `I need advice on this situation. act as a consultant and provide pros, cons, and a recommendation. Situation: "${situation}" and i am stuck in this problem and what advice you give me for this problem in a concise and formatted text way but keep the advice short and concise and motivating and motivate me as i am a adhd person`,

  estimator: (activity) =>
    `Estimate how long it would likely take to "${activity}". Provide a realistic time range and a brief explanation why.Answer in 1 or 2 lines but firstly tell the timings then explain in 1 line but start in two lines not the same line`,

  compiler: (braindump) =>
    `Turn the following brain dump into a compiled list of actionable tasks. Return ONLY the list of tasks, one per line. Brain dump: "${braindump}"`,

  chef: (ingredients, preferences) =>
    `Create a recipe using these ingredients: ${ingredients}. Dietary preferences: ${preferences || "none"}. Provide the Title, Ingredients list, and Instructions and in a short and concise way.`,

  /* ---------------------------------------------------- */
  /* 🛠️ FIXED: Visual Learner (Unsplash & Mermaid Safe)  */
  /* ---------------------------------------------------- */
  visualLearner: (topic) => `
    You are an expert visual teacher. Return STRICT JSON only. 
    
    IMPORTANT INSTRUCTIONS:
    1. "visuals": The "keyword" MUST be a short, single-phrase photographic search term (e.g., "Green Leaf", "Car Engine"). DO NOT use words like "diagram", "illustration", "vector", or "scientific". Unsplash does not understand them.
    2. "flow": This array drives a flowchart. Keep strings SHORT (max 4-5 words). DO NOT use bullet points, numbers, or special characters inside the strings.

    {
      "title": "${topic}",
      "summary": "Write a 3-4 sentence detailed educational summary of ${topic} here using **bolding** for key terms.",
      "visuals": [
        { "type": "image", "keyword": "${topic} close up" },
        { "type": "image", "keyword": "${topic} in nature/context" },
        { "type": "image", "keyword": "${topic} main subject" }
      ],
      "flow": ["Step 1", "Step 2", "Step 3"],
      "videoSearch": "${topic} explained simply"
    }
  `,

  doubtSolver: (topic, doubt) => 
    `### 💡 ${topic}: Quick Clear-Up\n\n` +
    `**The Doubt:** "${doubt}"\n\n` +
    `**The Explanation:**\n\n` +
    `Use bullet points and **bold text** to explain this clearly. End with a motivating emoji! 🚀 Keep the answer short, concise, and well-formatted.dont answer in long paragraph`
};