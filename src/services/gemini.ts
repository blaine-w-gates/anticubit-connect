import { GoogleGenerativeAI } from '@google/generative-ai';

const MIN_DELAY_MS = 2000;
let lastCallTime = 0;

interface VttCue {
    start: number;
    end: number;
    text: string;
}

export const GemininService = {
    /**
     * Rate Limiter: Ensures we don't hit 429 errors.
     */
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;

        if (timeSinceLastCall < MIN_DELAY_MS) {
            const waitTime = MIN_DELAY_MS - timeSinceLastCall;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        lastCallTime = Date.now();
    },

    /**
     * JSON Sanitizer
     */
    cleanJson(text: string): string {
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    },

    /**
     * Main Analysis Function
     */
    async analyzeTranscript(
        apiKey: string,
        transcriptText: string,
        modelName: string = "gemini-1.5-flash-001" // <--- CRITICAL FIX
    ): Promise<any> {
        await this.enforceRateLimit();

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
      You are an expert video analyst. 
      Analyze the following transcript and extract distinct "Tasks" or "Topics" discussed.
      For each task, provide a timestamp (find the closest match in the text), a name, and a description.
      
      RETURN ONLY A JSON ARRAY. NO MARKDOWN.
      Format: [{ "task_name": "...", "timestamp_seconds": 12.5, "description": "..." }]

      TRANSCRIPT:
      ${transcriptText.substring(0, 30000)}
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;

            if (response.promptFeedback?.blockReason) {
                console.warn("Gemini Safety Block:", response.promptFeedback);
                return [{
                    id: crypto.randomUUID(),
                    task_name: "Content Blocked",
                    timestamp_seconds: 0,
                    description: "This content was blocked by AI safety policies.",
                    screenshot_base64: ""
                }];
            }

            const text = response.text();
            const cleanedJson = this.cleanJson(text);

            try {
                const tasks = JSON.parse(cleanedJson);
                return tasks.map((t: any) => ({
                    ...t,
                    id: crypto.randomUUID(),
                    screenshot_base64: ""
                }));
            } catch (parseError) {
                console.error("JSON Parse Fail:", text);
                throw new Error("Failed to parse AI response.");
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    },

    /**
     * Cubit Generation
     */
    async generateSubSteps(
        apiKey: string,
        taskName: string,
        contextDescription: string
    ): Promise<string[]> {
        await this.enforceRateLimit();

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" }); // <--- CRITICAL FIX

        const prompt = `
      TASK: "${taskName}"
      CONTEXT: "${contextDescription}"
      
      INSTRUCTION: Break this task down into exactly 4 clear, actionable sub-steps for a beginner.
      RETURN ONLY A JSON ARRAY OF STRINGS. NO MARKDOWN.
      Example: ["Step 1...", "Step 2...", "Step 3...", "Step 4..."]
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = this.cleanJson(result.response.text());
            const steps = JSON.parse(text);

            if (Array.isArray(steps) && steps.length > 0) {
                return steps.slice(0, 4);
            }
            return ["Could not generate steps.", "Please try again."];
        } catch (error) {
            console.error("Cubit Gen Failed:", error);
            return ["Error generating steps.", "Check API Key or Network."];
        }
    }
};
