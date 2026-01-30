import { useState } from "react";
import { ChefHat } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { PROMPTS } from "../services/prompts";

export function Chef() {
  const [ingredients, setIngredients] = useState("");
  const [preferences, setPreferences] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { apiKey } = useApiKey();

  const handleCook = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in the settings first.");
      return;
    }
    if (!ingredients.trim()) return;

    setLoading(true);
    try {
      const prompt = PROMPTS.chef(ingredients, preferences);
      const response = await generateText(prompt, apiKey);
      setOutput(response);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to create recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Voice append helpers
  const handleIngredientsVoice = (spokenText) => {
    if (!spokenText) return;
    setIngredients((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  const handlePreferencesVoice = (spokenText) => {
    if (!spokenText) return;
    setPreferences((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  return (
    <ToolLayout
      title="Chef"
      description="What can I make with these ingredients?"
      icon={ChefHat}
      color="text-orange-500"
    >
      <div className="space-y-6">
        {/* Ingredients */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ingredients</label>

          <Textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Chicken, rice, broccoli, soy sauce..."
            className="h-24"
          />

          <div className="flex items-center gap-2">
            <VoiceTypingButton
              onText={handleIngredientsVoice}
              lang="en-IN"
              className="border-orange-200 dark:border-orange-800"
            />

            <button
              type="button"
              onClick={() => setIngredients("")}
              className="text-sm px-3 py-2 rounded border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Dietary Preferences / Constraints (Optional)
          </label>

          <Input
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Gluten-free, spicy, quick meal..."
          />

          <div className="flex items-center gap-2">
            <VoiceTypingButton
              onText={handlePreferencesVoice}
              lang="en-IN"
              className="border-orange-200 dark:border-orange-800"
            />

            <button
              type="button"
              onClick={() => setPreferences("")}
              className="text-sm px-3 py-2 rounded border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              Clear
            </button>
          </div>
        </div>

        <Button
          onClick={handleCook}
          disabled={loading || !ingredients.trim()}
          className="bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 w-full"
          isLoading={loading}
        >
          Create Recipe
        </Button>

        {output && (
          <div className="animate-fade-in p-6 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800">
            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-200 mb-4">
              Here's your recipe:
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
  