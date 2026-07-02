import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
});

const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
        {
            role: 'user',
            content: "What is 2 + 2",
        },
    ],
});

console.log(response.choices[0].message.content);
