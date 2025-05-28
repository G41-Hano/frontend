import { useState, useCallback } from "react"
import api from "../../api"
import { ENABLE_GEN_AI_API, OUTPUT_CHOICE } from "../../constants"

// helper function for making a prompt
const makePrompt = (prompt, system_message, temperature, max_tokens) => {
  return {
    "prompt": prompt, "system_message": system_message, "temperature": temperature, "max_tokens": max_tokens
  }
}

// frontend components
const DefinitionCard = ({definition, index, handleUpdateCustomWord}) => (
  <div className="h-fit w-full p-2 m-1 text-sm rounded-lg border-[#4C53B4] border-1
    cursor-pointer hover:bg-[#EEF1F5] transition"
    onClick={()=>{handleUpdateCustomWord(index, 'definition',definition)}}
  >
    <p>{definition}</p>
  </div>
)

// hook for different instance of getDefinition
export const useDefinitionFetcher = () => {
  const [error, setError] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [definitions, setDefinitions] = useState([])

  // helper function to call the API endpoint for Generative AI  
  const callAPI = useCallback(async (prompt) => {
    setLoading(true)
    setError(""); // Clear previous errors
    
    try {
      let result = ""
      let response = ""

      // GEN AI API is TURNED ON  // enable/disable at constants.js
      if (ENABLE_GEN_AI_API) {
        result = await api.post("/api/gen-ai/", prompt);
        response = result.data
      }
      // GEN AI API is TURNED OFF
      else {
        result = {"status":200}; 
        switch(OUTPUT_CHOICE) {
          case 1: 
            response = {"response":"```json\n{\n  \"is_valid\": true,\n  \"definitions\": [\n    \"A cozy piece of clothing made of wool or other soft material that keeps you warm in cold weather. You pull it over your head!\",\n    \"A long-sleeved shirt that you wear when it's chilly, like when you go outside to play in the fall.\",\n    \"Something you wear to stay warm and comfy, often knitted or crocheted. It's like a warm hug for your body!\"\n  ]\n}\n```"}
            break
          case 2:
            response = {"response":"```json\n{\n  \"is_valid\": false,\n  \"definitions\": []\n}\n```"}
            break
          case 3:
            response = {"response":"\n  \"is_valid\": true,\n  \"definitions\": [\n    \"A cozy piece of clothing made of wool or other soft material that keeps you warm in cold weather. You pull it over your head!\",\n    \"A long-sleeved shirt that you wear when it's chilly, like when you go outside to play in the fall.\",\n    \"Something you wear to stay warm and comfy, often knitted or crocheted. It's like a warm hug for your body!\"\n  ]"}
            break
        }
      }


      if (result.status === 200) {
        console.log("Raw API response:", response.response);

        let jsonDataString = response.response;

        // --- Cleaning Step ---
        let startIndex = jsonDataString.indexOf('{');
        let endIndex = jsonDataString.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          jsonDataString = jsonDataString.substring(startIndex, endIndex + 1);
        } else {
          // Handle cases where { or } might be missing, or in the wrong order
          console.warn("Could not find a valid JSON object within the string using {} delimiters.");
          setError("Failed to parse server response. The API response did not follow correct format. Please try again.")
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
        console.warn(`API returned status ${result.status}:`, response.response);
        setError(`An unexpected server response occurred (Status: ${result.status}).`);
      }
    } catch (err) {
      // ... (existing error handling for network, server errors)
      // Add a specific check for JSON parsing errors
      if (err instanceof SyntaxError) {
        console.error("JSON Parsing Error:", err.message);
        setError("Failed to parse server response. The API response did not follow correct format. Please try again.");
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
      // GEN AI API is TURNED ON  // enable/disable at constants.js
      if (ENABLE_GEN_AI_API) 
        setLoading(false);
      // GEN AI API is TURNED OFF
      else {
        setTimeout(() => {
          setLoading(false);
        }, 2000); // 2 seconds
      }
    }

    return null
  }, [])

  const getDefinition = useCallback(async (word) => {
    setDefinitions([])
    setError("")

    const w = word.trim()
    if (!w) {
      setError("Please enter a word.")
      return
    }

    const p = `For \"${word}\":\n1. Is it a real dictionary word? (true/false)\n2. If valid, give 3 distinct 3rd-grade definitions as JSON array [\"clue1\", \"clue2\", \"clue3\"]. If invalid, definitions are [].\n\nOutput ONLY a JSON object: {\"is_valid\": <boolean>, \"definitions\": <array>}`
    const system_message = "As a precise word validator and child-friendly definition expert, determine word validity and provide 3 distinct definitions for valid words. Output ONLY a JSON object with 'is_valid' (true/false) and 'definitions' (string array or empty array). No other text."
    
    const prompt = makePrompt(p, system_message, 0.5, 300)

    const data = await callAPI(prompt)

    if (data?.is_valid) {
      setDefinitions(data?.definitions)
    } else if (data && !data.is_valid) {
      setError("The word is not valid. Enter a new word");
    } else if (data === null && !error) { // Handle case where data is null but no specific error was set by callAPI
        setError("Failed to retrieve definitions. Please try again.");
    }
  }, [callAPI, error])

  return { isLoading, error, definitions, getDefinition };
}

export default function Definitions({isLoading, definitions, error, index, handleUpdateCustomWord}) {
  if (isLoading) {
    return <p className="w-full text-center text-sm">Loading definitions...</p>;
  }

  if (error) {
    return <p className="w-full text-center text-sm text-red-500">Error: {error}</p>;
  }

  if (definitions.length > 0) {
    return (
      <div className="w-full">
        {definitions.map((definition, def_index) => (
          <DefinitionCard key={def_index} definition={definition}
            index={index} handleUpdateCustomWord={handleUpdateCustomWord}
          />
        ))}
      </div>
    );
  }

  return null;
}