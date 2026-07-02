import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
});

async function main() {
    const result = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
            role: 'user',
            content: 'you are a expert developer Write a function in javascript that takes an array of numbers as input and returns a new array with all the zeros moved to the end while maintaining the relative order of the non-zero elements.'
        }]
    })

    console.log("Result from the AI --> ",result.choices[0].message.content)
}

main();
