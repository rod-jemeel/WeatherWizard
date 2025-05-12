import { config } from "./env";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize the LangChain Chat Model with OpenAI
const model = new ChatOpenAI({
  openAIApiKey: config.openAiApiKey,
  modelName: "gpt-4o",
  temperature: 0.7,
  maxTokens: 200,
});

const outputParser = new StringOutputParser();

// Create a prompt template for weather descriptions
const weatherPromptTemplate = PromptTemplate.fromTemplate(`
As a meteorologist, provide a helpful, informative, and conversational description of the current weather in {location_name}, {country}.

Current conditions:
- Temperature: {temp}°C (feels like {feels_like}°C)
- Weather: {weather_main} ({weather_desc})
- Humidity: {humidity}%
- Wind Speed: {wind_speed} m/s

Include:
1. A brief summary of the current conditions
2. How it feels outside (hot, cold, pleasant, etc.)
3. Any relevant advice based on the weather (e.g., umbrella needed, sunscreen recommended)
4. A brief comment on how this weather might affect outdoor activities

Keep your response concise (3-4 sentences) and friendly. Do not include any data beyond what's provided.
`);

export async function generateWeatherDescription(weatherData: any) {
  try {
    // Extract relevant weather information for the prompt
    const {
      location: { name: locationName, country },
      current: {
        temp,
        feels_like,
        humidity,
        wind_speed,
        weather: { main: weatherMain, description: weatherDesc },
      },
    } = weatherData;

    // Create the chain
    const chain = weatherPromptTemplate.pipe(model).pipe(outputParser);

    // Execute the chain
    const description = await chain.invoke({
      location_name: locationName,
      country,
      temp,
      feels_like,
      weather_main: weatherMain,
      weather_desc: weatherDesc,
      humidity,
      wind_speed,
    });

    return description.trim();
  } catch (error) {
    console.error("Error generating weather description:", error);
    // Fallback to a basic description if AI fails
    return generateFallbackDescription(weatherData);
  }
}

function generateFallbackDescription(weatherData: any) {
  try {
    const {
      location: { name: locationName, country },
      current: {
        temp,
        weather: { description: weatherDesc, main: weatherMain },
      },
    } = weatherData;

    let description = `Currently in ${locationName}, ${country}, it's ${temp}°C with ${weatherDesc}.`;

    // Add advice based on temperature
    if (temp < 5) {
      description +=
        " It's very cold, so bundle up with warm layers if you're heading outside.";
    } else if (temp < 15) {
      description +=
        " It's cool, so a jacket would be recommended for outdoor activities.";
    } else if (temp < 25) {
      description +=
        " The temperature is mild, good for most outdoor activities.";
    } else {
      description +=
        " It's warm, ideal for outdoor activities but remember to stay hydrated.";
    }

    // Add advice based on weather conditions
    const weatherMainLower = weatherMain.toLowerCase();
    if (weatherMainLower.includes("rain")) {
      description += " Don't forget your umbrella!";
    } else if (weatherMainLower.includes("snow")) {
      description += " Be careful of slippery conditions if you're going out.";
    } else if (weatherMainLower.includes("clear") && temp > 20) {
      description +=
        " Sunscreen would be a good idea if you're spending time outside.";
    }

    return description;
  } catch (error) {
    console.error("Error generating fallback description:", error);
    return "Weather information is currently available. Please check the displayed data for details.";
  }
}
