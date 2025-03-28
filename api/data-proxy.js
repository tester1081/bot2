// This file serves as a proxy for the N3tdata API to avoid CORS issues
const https = require("https")

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    }
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body)

    // Create the request options for the N3tdata API
    const options = {
      hostname: "n3tdata.com",
      path: "/api/data",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token 3cfedeade5a3a75342ce13245ac4de9e9b3ca0aaf86a05a5aa1447c12d7d",
      },
    }

    // Make the request to the N3tdata API
    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          })
        })
      })

      req.on("error", (error) => {
        reject(error)
      })

      req.write(JSON.stringify(requestBody))
      req.end()
    })

    // Return the response from the N3tdata API
    return {
      statusCode: response.statusCode,
      headers: {
        "Content-Type": "application/json",
      },
      body: response.body,
    }
  } catch (error) {
    console.error("Error:", error)

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
    }
  }
}

