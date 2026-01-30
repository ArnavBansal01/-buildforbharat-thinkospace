import axios from "axios";

export const fetchWebImage = async (query) => {
  const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  console.log("Unsplash key:", ACCESS_KEY);

  // 🧹 CLEANER: Remove words that confuse Unsplash
  const cleanQuery = query
    .replace(/diagram|chart|detailed|scientific|illustration|labeled|visual|structure|of|representing/gi, "")
    .trim();

  try {
    console.log(`🔍 Searching Unsplash for: "${cleanQuery}" (Original: "${query}")`);

    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query: cleanQuery, // Use the cleaned keyword
        per_page: 1,
        orientation: "landscape"
      },
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`
      }
    });

    // Return the image or a fallback if 0 results found
return {
  type: "image",
  url:
    response.data.results[0]?.urls?.regular ||
    `https://placehold.co/600x400?text=${encodeURIComponent(cleanQuery)}`,
  keyword: cleanQuery
};
  } catch (error) {
    console.warn("Unsplash Error (using fallback):", error);
return {
  type: "image",
  url: `https://placehold.co/600x400?text=${encodeURIComponent(cleanQuery)}`,
  keyword: cleanQuery
};
  }
};