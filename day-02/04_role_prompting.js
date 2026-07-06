import OpenAI from 'openai';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
});

async function getWeatherData(cityName) {
    const url = `https://wttr.in/${cityName}?format=%C+%t`;
    const response = await axios.get(url, { responseType: 'text' });
    return JSON.stringify({ cityName, weatherInfo: response.data });
}

async function executeCommandOnCli(cmd) {
    return new Promise((res, rej) => {
        exec(cmd, (err, out) => {
            if (err) return res(`There was an Error ${err}`);
            else return res(out);
        });
    });
}

const SYSTEM_PROMPT = `

    you are an expert AI engineer.Only and only answer questions related to the coding and enginnering.
    don't answer anything else.
    
    Persona: you are a sinear softwar developer.
    Persona Traits: 
    - You always sound tachnical and use jargens.
    - You never ansewe back to personal thing and you don't have a personal life.
    - All you know is how and what code is.

    you have to analyse users input carefully and then you need to 
    breadkdown the problem into multiple subproblems before comming on to the final result.Always breakdown the user
     intension and how to solve the problem and then step by step solve it.

    we are going to follow a pipeline "INITIAL" , "THINK","TOOL_REQUEST", "ANALYSE", and "OUTPUT" pipeline.
    
    The pipeline:
    -"INITIAL" : when user give an input, we will have a initial thought on what this user is trieng to do.
    -"THINK" : This is where, we are going to think about how to solve this and then start to breakdown the problem into multiple subproblems.
    -"ANALYSE" : This is where we are analyse the solution and also varify if output is correct.
    -"THINK" : we can go back to think mode where we now see any subproblem remain or think.
    -"ANALYSE" : Again we analyse the problem and get onto a solution.
    -"TOOL_REQUEST" : use this for colling or requesting a tool, The formet of outupt would be
    {"step": "TOOL_REQUEST" , "functionName" : "getWeatherData", input : "cityName"}
    -"OUTPUT" : This is where we can end and give the final output to the user.

    Available Tools:
    - "getWeatherData" : getWeatherData(cityName : string) : Return the realtime information of the city.

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

   Example: 
   -"User" what is wether of delhi?
   OUTPUT:
    - "INITIAL" : "The user want me to fatch wether of delhi"
    - "THINK" : "From the tool I can see we have a tool name getWeatherData which can be collected"
    - "ANALYSE" : "We are going right we can call getWeatherData with "delhi" as input"
    - "TOOL_REQUEST" : {"functionName" : "getWeatherData", input : "delhi"}
    - "TOOL_OUTPUT" : "The wether of delhi is sunny and temperature is 30 degree celcius"
    - "THINK" : "We get the wether info"
    - "OUTPUT" : "The wether of delhi is sunny with some 30 degree C, Its to hott"

    Example: 
    -"User" what is meaning of love?
    OUTPUT:
    - "INITIAL" : "The user want me to fatch meaning of love"
    - "OUTPUT" : "I am here to assist with technical and enginnering related questions only.

   Output Former:
   {"step": "INITIAL" | "THINK" | "ANALYSE" | "OUTPUT" | "TOOL_REQUEST" | "text": "<The actual text output>", "functionName" : "<NAME OF FUNCTION>" , "Input" : "<INPUT PARAM OF FUNCTION>"}

     `

const MESSAGES_DB = [{ role: 'system', content: SYSTEM_PROMPT }]

async function main(prompt = '') {

    MESSAGES_DB.push({ role: 'user', content: prompt })

    while (true) {
        const result = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: MESSAGES_DB
        })

        const rowResult = result.choices[0].message.content
        const jsonResult = JSON.parse(rowResult)

        MESSAGES_DB.push({ role: 'assistant', content: rowResult })

        console.log(`{${jsonResult.step}}: ${jsonResult.text}`)

        if (jsonResult.step.toUpperCase() === 'OUTPUT') {
            break;
        }

        if (jsonResult.step.toUpperCase() === 'TOOL_REQUEST') {
            const { finctionName, input } = jsonResult

            if (jsonResult.step.toUpperCase() === 'TOOL_REQUEST') {
                const { functionName, input } = jsonResult;

                switch (functionName) {
                    case 'executeCommandOnCli': {
                        try {
                            const toolResult = await executeCommandOnCli(input);
                            console.log(`🛠️(${functionName}):${input}`, toolResult);
                            MESSAGES_DB.push({
                                role: 'developer',
                                content: JSON.stringify({
                                    step: 'TOOL_OUTPUT',
                                    output: toolResult,
                                }),
                            });
                        } catch (error) {
                            MESSAGES_DB.push({
                                role: 'developer',
                                content: JSON.stringify({ status: 'error', error }),
                            });
                        }

                        continue;
                    }
                    case 'getWeatherData':
                        {
                            const toolResult = await getWeatherData(input);
                            console.log(`🛠️(${functionName}):${input}`, toolResult);
                            MESSAGES_DB.push({
                                role: 'developer',
                                content: JSON.stringify({
                                    step: 'TOOL_OUTPUT',
                                    output: toolResult,
                                }),
                            });
                            continue;
                        }
                        break;
                }
            }

        }

    }

}
// main('10+3-6*67/5');
main('what is wether of aurangabad,mumbai,delhi?');
// main('what is js');
