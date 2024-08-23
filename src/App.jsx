import { useState } from "react";
import "./App.css";
import Notionkanban from "./components/Notionkanban";
import axios from "axios";
import logo from "./assets/logo.png";
function App() {
  const [message, setMessage] = useState("");
  const [res, setRes] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchdata(message);
  };

  const fetchdata = async (question) => {
    const url = "https://codesnips-backend.onrender.com/chat";
    const data = {
      message: `Please provide data in the following format:
  [
    { title: "backlog1", id: "1", column: "todo" },
    { title: "doing1", id: "9", column: "todo" },
  ]
  The data should be pure raw array data with column names of type "todo" no matter what all type should be of todo and max id should be 20. No additional headings or explanations. The topic is: ${question}`,
    };

    try {
      let response = await axios.post(url, data);

      // Log the raw response for debugging
      console.log("Raw API Response:", response.data.response);

      let rawData = response.data.response;

      if (typeof rawData === "string") {
        // Clean the JSON string by removing unwanted newlines, tabs, and spaces
        rawData = rawData
          .replace(/(\w+):/g, '"$1":') // Add quotes around keys
          .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas before } or ]
          .replace(/[\n\r\t]+/g, "") // Remove newlines, tabs, etc.
          .trim();

        // Ensure the JSON string starts and ends with brackets
        if (rawData.startsWith("[") && rawData.endsWith("]")) {
          try {
            // Parse the cleaned JSON string
            let parsedData = JSON.parse(rawData);

            // Check if the parsed data is an array
            if (Array.isArray(parsedData)) {
              setRes(parsedData);
            } else {
              throw new Error("Parsed data is not an array.");
            }
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            setError("Error parsing JSON data from the response.");
          }
        } else {
          console.error("Data format is incorrect:", rawData);
          setError("Data format is incorrect.");
        }
      } else {
        console.error("Unexpected response type:", typeof rawData);
        setError("Unexpected response type.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data from the API.");
    }
  };

  return (
    <div className="bg-[#171717] ">
      <form
        onSubmit={handleSubmit}
        className="flex justify-center items-center gap-4 mt-6 mb-4"
      >
        <img src={logo} alt="" srcset="" className=" size-44" />
        <input
          type="text"
          placeholder="Get your Plan PLANNED by AI"
          className="w-96 p-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-300 transition-colors"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg shadow-md hover:bg-gradient-to-l hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          Submit
        </button>
      </form>
      <div>
        {error && <p className="text-red-500">{error}</p>}
        <Notionkanban initialCards={res} />
      </div>
    </div>
  );
}

export default App;
