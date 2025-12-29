const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateQuizQuestions(topic, count = 5, questionTypes = ["mcq"]) {
    try {
      const prompt = `
        Generate ${count} quiz questions about "${topic}".
        
        Include these question types: ${questionTypes.join(", ")}.
        
        For each question, provide:
        1. Question text
        2. Question type (${questionTypes.join(", ")})
        3. Options (for MCQ and multiple-correct)
        4. Correct answer(s)
        5. Explanation
        
        Return the response in valid JSON format like this:
        {
          "questions": [
            {
              "questionText": "string",
              "questionType": "mcq" | "multiple-correct" | "fill-blank" | "descriptive",
              "options": [
                {"text": "string", "isCorrect": boolean},
                ...
              ],
              "correctAnswers": ["string"],
              "explanation": "string"
            },
            ...
          ]
        }
        
        Rules:
        - For MCQ: exactly 4 options, only one correct
        - For multiple-correct: 4-6 options, at least 2 correct
        - For fill-blank: provide the blank text with underscores and correct answer
        - For descriptive: provide sample answer points
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Invalid response format from Gemini");
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate questions");
    }
  }

  async generateQuestionFromText(context, questionType = "mcq") {
    try {
      const prompt = `
        Based on this context: "${context}"
        
        Generate a ${questionType} question with:
        1. Question text
        2. Options (if applicable)
        3. Correct answer(s)
        4. Explanation
        
        Return in JSON format:
        {
          "questionText": "string",
          "questionType": "${questionType}",
          "options": [{"text": "string", "isCorrect": boolean}, ...],
          "correctAnswers": ["string"],
          "explanation": "string"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate question");
    }
  }
}

module.exports = new GeminiService();
