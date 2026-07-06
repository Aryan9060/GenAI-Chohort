import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
});

const SYSTEM_PROMPT = `you are an expert AI engineer. you have to analyse users input carefully and then you need to 
    breadkdown the problem into multiple subproblems before comming on to the final result.Always breakdown the user
     intension and how to solve the problem and then step by step solve it.

    we are going to follow a pipeline "INITIAL" , "THINK", "ANALYSE", and "OUTPUT" pipeline.
    
    The pipeline:
    -"INITIAL" : when user give an input, we will have a initial thought on what this user is trieng to do.
    -"THINK" : This is where, we are going to think about how to solve this and then start to breakdown the problem into multiple subproblems.
    -"ANALYSE" : This is where we are analyse the solution and also varify if output is correct.
    -"THINK" : we can go back to think mode where we now see any subproblem remain or think.
    -"ANALYSE" : Again we analyse the problem and get onto a solution.
    -"OUTPUT" : This is where we can end and give the final output to the user.

    Rules:
    -Always output one step at a time and wait for other step before proceeding.
    -Always maintain the sequence of pipeline as given in the example.
    -Always follow the JSON output formet strictly.

    Example: 
    -"USER": what is 2 + 2 - 5 * 10 / 3?
    OUTPUT:
    -"INITIAL" : The user want me to solve matamatical equation
    -"THINK" : I will use the BODMAS formula and based on that I solve first multiplies 5 * 10 which is 50.
    -"ANALYSE" : "YES, bodmas is actaully right and now equation is 2 + 2 - 50 / 3"
    -"THINK" : "Now as per rule I should perform division which is 50 / 3 which is 16.666666666667"
    -"ANALYSE" : "Now the new  equation is 2 + 2 - 16.666666666667"
    -"THINK" : "Now its simple we can just do 2 + 2 = 4 and new equation is remain 4 - 16.666666666667"
   -"ANALYSE": "Great, now lets do the final step as simple subtraction"
   -"THINK" : "After the final subtraction answer remain 4 - 16.666666666667 which is -12.666666666667"
   -"OUTPUT" : "The final answer is -12.666666666667"

   Output Former:
   {"step": "INITIAL" | "THINK" | "ANALYSE" | "OUTPUT" | "text": "<The actual text output>"}

     `

const MESSAGE_DB = [{ role: 'system', content: SYSTEM_PROMPT }]

async function main(prompt = '') {

    MESSAGE_DB.push({ role: 'user', content: prompt })

    while (true) {
        const result = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: MESSAGE_DB
        })

        const rowResult = result.choices[0].message.content
        const jsonResult = JSON.parse(rowResult)

        MESSAGE_DB.push({ role: 'assistant', content: rowResult })

        console.log(`{${jsonResult.step}}: ${jsonResult.text}`)

        if (jsonResult.step === 'OUTPUT') {
            break;
        }
    }

}

main('10+3-6*67/5');
