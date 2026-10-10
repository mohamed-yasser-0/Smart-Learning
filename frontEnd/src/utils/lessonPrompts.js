export const DEFAULT_ARTICLE_INSTRUCTIONS =
  "الشمولية والدقة أهم من الاختصار. يجب أن يتناسب طول المقال مع حجم الدرس وعمق محتواه؛ فالدرس الطويل يحتاج مقالًا مفصلًا، بينما الدرس القصير يحتاج مقالًا مناسبًا دون إطالة غير ضرورية.";

export const buildQuizPrompt = (questionsCount, lessonContent) => `
Generate a high-quality multiple-choice quiz based ONLY on the lesson content provided below.

Requirements:

* Generate exactly ${questionsCount} questions.
* Each question must have exactly 4 distinct options.
* Only one option must be correct.
* correctAnswer must exactly match one of the 4 options.
* Questions must be based ONLY on the lesson content. Never introduce external knowledge, assumptions, or facts not supported by the lesson.
* Use the same language as the lesson. If the lesson is in Arabic, write all questions and options in Arabic.
* Do not include explanations, hints, feedback, or introductory text.
* Do not use markdown.
* Return ONLY valid JSON matching the exact structure specified below.

QUESTION QUALITY RULES:

1. Prioritize deep understanding over memorization.
   Test whether the learner genuinely understands the concepts, relationships, mechanisms, and ideas explained in the lesson.

2. Focus on higher-order thinking:

   * Application: Present a new scenario and ask the learner to apply a concept from the lesson.
   * Analysis: Ask the learner to identify relationships, distinguish between similar concepts, or determine why a process works as described.
   * Inference: Ask questions whose answers require combining multiple pieces of information explicitly stated in the lesson.
   * Problem-solving: Present a problem that can be solved using the lesson's concepts.
   * Error detection: Present a statement or reasoning process containing a mistake related to the lesson and ask the learner to identify the incorrect part.
   * Prediction: Ask what would happen if a condition, input, or step described in the lesson changed, but only when the lesson provides enough information to determine the answer.
   * Comparison: Test meaningful differences between concepts, methods, or cases discussed in the lesson.

3. Avoid superficial questions.
   Do NOT ask questions such as:

   * "What is the topic of this lesson?"
   * "What is the definition of X?" when the answer only requires memorization.
   * "Which concept was mentioned in the lesson?"
   * Questions that simply repeat a sentence from the lesson.
   * Questions about the lesson's title, general subject, or trivial details.

4. Make the learner THINK.
   Whenever possible, require the learner to reason about a realistic example, analyze a situation, connect multiple concepts, or choose the best solution based on the lesson.

5. Use challenging but fair distractors.

   * All 4 options must be plausible to a learner who has partially understood the lesson.
   * Incorrect options should reflect realistic misunderstandings, confusion between related concepts, incorrect reasoning, or inappropriate application of a concept.
   * Avoid obviously absurd answers, jokes, unrelated options, and options that can be eliminated without understanding the lesson.
   * Ensure the correct option is not consistently longer, more detailed, or more specific than the other options.
   * Do not use "All of the above" or "None of the above".

6. Ensure conceptual precision.

   * Each question must have one unambiguously correct answer supported by the lesson.
   * Avoid ambiguous wording, trick questions, and questions that depend on external knowledge.
   * For scenario-based questions, include all information needed to answer the question in the lesson content or in the scenario itself.
   * Never invent technical details or claim that the lesson explains something it does not explain.

7. Maintain variety.

   * Avoid repeating the same concept or testing the same skill in multiple questions unless the lesson is sufficiently rich to justify it.
   * Mix application, analysis, inference, problem-solving, comparison, and error detection according to the actual content of the lesson.
   * Adapt the difficulty and question types to the subject and depth of the lesson.
   * If the lesson is technical or contains code, use code analysis, debugging scenarios, execution behavior, and practical applications when supported by the lesson.
   * If the lesson is theoretical, focus on reasoning, conceptual relationships, comparisons, and implications supported by the lesson.

8. Adapt difficulty to the available content.

   * Aim for a challenging assessment that distinguishes superficial familiarity from genuine understanding.
   * Prefer questions requiring multiple reasoning steps when the lesson supports them.
   * Do not manufacture difficulty by using confusing language or obscure wording.
   * If a concept is simple, test its meaningful application rather than inventing complexity.
   * If the lesson lacks enough information for a particular question type, use the most intellectually demanding questions that can be answered reliably from the available content.

9. Before producing the final JSON, internally verify that:

   * Every question tests understanding, reasoning, or meaningful application rather than merely recalling a topic or isolated phrase.
   * Every correct answer is explicitly supported by the lesson or logically follows from its content.
   * Each question has exactly 4 options and exactly one correct answer.
   * correctAnswer matches one option character-for-character.
   * No two questions are essentially duplicates.
   * The output is valid JSON and contains no text outside the JSON object.

Return exactly this structure:

{
"title": "اختبار الدرس",
"order": 1,
"type": "quiz",
"questions": [
{
"question": "Question text",
"options": [
"Option 1",
"Option 2",
"Option 3",
"Option 4"
],
"correctAnswer": "Option 1"
}
]
}

Lesson Content:
${lessonContent}

`;

export const buildArticlePrompt = (instructions, lessonContent) => `
Generate a comprehensive, well-organized educational article based ONLY on the lesson content.

Requirements:

* Cover all main topics, subtopics, concepts, explanations, examples, steps, rules, comparisons, and important details without omitting meaningful information.
* Do not add external knowledge, unsupported assumptions, or invented examples.
* Preserve the original meaning, technical terms, code, formulas, numbers, and procedural order.
* Write in the same language as the lesson, using clear, professional educational language.
* Create an accurate, descriptive title and a concise, lesson-specific description.
* Organize the article with an introduction, logical sections, clear headings, relevant lists, and a conclusion.
* Explain concepts clearly and connect related ideas without unnecessary repetition.
* Do not use emojis, decorative symbols, or Markdown.
* Adjust the article length to the lesson's content and depth. Prioritize completeness and accuracy over brevity without unnecessary expansion.
* Before responding, verify that all meaningful lesson information is covered, no external information is added, and the JSON is valid.
* Return ONLY valid JSON with no additional text.

IMPORTANT:
${instructions}

Return exactly this structure:
{
  "title": "عنوان المقال",
  "description": "وصف مختصر للمقال",
  "order": 1,
  "type": "article",
  "articleContent": "محتوى المقال"
}

Lesson Content:
${lessonContent}
`;