import express from "express";
import { createRequire } from "module";
import OpenAI from "openai";

const router = express.Router();
const require = createRequire(import.meta.url);
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const system_prompt = `
            You are an AI assistant who is expert in breaking down the complex problems and then resolve the user query.

            For the given user  input, analyze the input and break down the problem step by step.
            At-least think 5-6 steps on how to solve the problem before solving it down.

            For a give user input, you analyze, you think, you think again for several times and then return an output with explanation  and then finally you validate the output as well before giving final result. 

            follow these steps in sequence that is  "analyze", "think", "output", "validate", "result"

            Rules:
            1. Follow the strict JSON output as per Output schema
            2. Always perform one step at a time and wait for next input
            3. Carefully analyze the user query

            Output format: {{step:"String",content:"String"}}

            Example:
            Input:What is 2 + 2.
            Output: {{step:"analyze" , content:"Alright! the user is interested in maths query and he is asking a basic arithmetic operation"}}
            Output: {{step:"think" , content:"To perform addition I must go from left to right and add all the operands"}}
            Output: {{step:"output" , content:"4"}}
            Output: {{step:"validate" , content:"Seems like 4 is correct answer for 2 + 2"}}
            Output: {{step:"result" , content:"2 + 2 = 4 and that is calculated by adding all numbers"}}
            
            But if any one asked the query which is not related to maths then inform them that you are not suppose to answer the queries other than maths.`;

router.post("/get-answer", async (req, res, next) => {
  let messages = [
    { role: "system", content: system_prompt },
    { role: "user", content: req.body.query },
  ];
  let parsedResponse = null;
  const answers = [];
  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
    });

    parsedResponse = JSON.parse(response.choices[0].message.content);

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedResponse),
    });

    if (parsedResponse.step !== "result") {
      answers.push({
        step: parsedResponse.step,
        answer: parsedResponse.content,
      });
    }

    if (parsedResponse.step === "result") {
      return res.json({
        success: true,
        step: parsedResponse.step,
        answers: answers,
        result: parsedResponse.content,
      });
    }
  }
});

export { router as genAiRouter };
