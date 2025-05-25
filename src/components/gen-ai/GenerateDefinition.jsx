import { useState } from "react"
import api from "../../api"

// frontend component
const LoadingIcon = () => {
  return (
    <div className="flex items-center justify-center h-full">
      {/* <div className="animate-spin rounded-full w-5 h-5 border-t-2 border-b-2 border-white"/> */}
      <span className="loading loading-spinner loading-lg"/>
     </div>
  )
}

export default function GenerateDefinition({word}) {
  const [error, setError] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [definitions, setDefinitions] = useState([])

  // helper function for making a prompt
  const makePrompt = (prompt, system_message, temperature, max_tokens) => {
    return {
      "prompt": prompt, "system_message": system_message, "temperature": temperature, "max_tokens": max_tokens
    }
  }

  // helper function to call the API endpoint for Generative AI  
  const callAPI = async (prompt) => {
    setLoading(true)
    
    try {
      //      UNCOMMENT this and COMMENT OUT === DUMMY === to start utilizing Gen. AI API
      // const response = await api.post("/api/gen-ai/", prompt);

      // ========== DUMMY ========== // 
      //   -- correct output - word is valid
      const response = {"response":"```json\n{\n  \"is_valid\": true,\n  \"definitions\": [\n    \"A cozy piece of clothing made of wool or other soft material that keeps you warm in cold weather. You pull it over your head!\",\n    \"A long-sleeved shirt that you wear when it's chilly, like when you go outside to play in the fall.\",\n    \"Something you wear to stay warm and comfy, often knitted or crocheted. It's like a warm hug for your body!\"\n  ]\n}\n```", "status":200}
      //   -- correct output - word is invalid
      // const response = {"response":"```json\n{\n  \"is_valid\": false,\n  \"definitions\": []\n}\n```", "status":200}
      //   -- incorrect output - no curly brace { }
      // const response = {"response":"\n  \"is_valid\": true,\n  \"definitions\": [\n    \"A cozy piece of clothing made of wool or other soft material that keeps you warm in cold weather. You pull it over your head!\",\n    \"A long-sleeved shirt that you wear when it's chilly, like when you go outside to play in the fall.\",\n    \"Something you wear to stay warm and comfy, often knitted or crocheted. It's like a warm hug for your body!\"\n  ]", "status":200}
      // ========== DUMMY ========== // 

      if (response.status === 200) {
        console.log("Raw API response data:", response.response);

        let jsonDataString = response.response;

        // --- Cleaning Step ---
        let startIndex = jsonDataString.indexOf('{');
        let endIndex = jsonDataString.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          jsonDataString = jsonDataString.substring(startIndex, endIndex + 1);
        } else {
          // Handle cases where { or } might be missing, or in the wrong order
          console.warn("Could not find a valid JSON object within the string using {} delimiters.");
          return null
        }
        // Trim any extra whitespace around the string
        jsonDataString = jsonDataString.trim();

        console.log("Cleaned JSON string:", jsonDataString);

        // --- Parsing Step ---
        const parsedData = JSON.parse(jsonDataString);

        console.log("Parsed JSON object:", parsedData);

        return parsedData; // Return parsed object

      } else {
        console.warn(`API returned status ${response.status}:`, response.response);
        setError(`An unexpected server response occurred (Status: ${response.status}).`);
      }
    } catch (err) {
      // ... (existing error handling for network, server errors)
      // Add a specific check for JSON parsing errors
      if (err instanceof SyntaxError) {
        console.error("JSON Parsing Error:", err.message);
        setError("Failed to parse server response as JSON. The API response did not follow correct format.");
      } else {
        // ... (rest of error handling)
        if (err.response) {
          console.error("API Error - Response:", err.response);
          setError(err.response.data.message || `Error: ${err.response.status} - ${err.response.statusText}`);
        } else if (err.request) {
          console.error("API Error - No response:", err.request);
          setError("Network error: Please check your internet connection.");
        } else {
          console.error("API Error - Request setup:", err.message);
          setError(`An error occurred: ${err.message}`);
        }
      }
    } finally {
      // ========== DUMMY ========== // 
      setTimeout(() => {
      // ========== DUMMY ========== // 
      setLoading(false);
      // ========== DUMMY ========== // 
      }, 2000); // 2 seconds
      // ========== DUMMY ========== // 
    }

    return null
  }

  const getDefinition = async () => {
    setDefinitions([])
    setError("")

    const p = `For \"${word}\":\n1. Is it a real dictionary word? (true/false)\n2. If valid, give 3 distinct 3rd-grade definitions as JSON array [\"clue1\", \"clue2\", \"clue3\"]. If invalid, definitions are [].\n\nOutput ONLY a JSON object: {\"is_valid\": <boolean>, \"definitions\": <array>}`
    const system_message = "As a precise word validator and child-friendly definition expert, determine word validity and provide 3 distinct definitions for valid words. Output ONLY a JSON object with 'is_valid' (true/false) and 'definitions' (string array or empty array). No other text."
    
    const prompt = makePrompt(p, system_message, 0.5, 300)

    const data = await callAPI(prompt)

    if (data?.is_valid) {
      setDefinitions(data?.definitions)
    } else if (data && !data.is_valid) {
      setError("The word is not valid.");
    }
  }

  return <>
    <button className="btn w-1/4 rounded-3xl bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] text-white border-none py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mt-3" 
    onClick={()=>getDefinition()} disabled={isLoading}>{isLoading ? <LoadingIcon/> : "Click"}</button>

    {isLoading ? (
      <p>Loading definitions...</p>
    ) : definitions.length > 0 ? (
      definitions.map((definition, index) => (
        <p key={index}>{definition}</p>
      ))
    ) : null}

    <div className="w-full h-20">
      <div className="loading loading-spinner loading-md text-primary h-full"/>
    </div>
  </>

  // "prompt": `Give 3 3rd grade academic dictionary definitions to guess the word \"${word}\". Definitions should be distinct from words similar to it. Present the 3 clues in a JSON array format: [\"clue1\", \"clue2\", \"clue3\", \"clue4\", \"clue5\"].`,
  // "system_message": "You are an expert in creating age-appropriate and distinct dictionary definitions for elementary school children. Focus on providing clear, simple, and accurate clues that highlight unique characteristics without directly revealing the word or words that sound similar. No need to add explanations, just give the definitions directly. Dont add string formatting, just plain text",
  // "temperature": 0.7,
  // "max_tokens": 200
}