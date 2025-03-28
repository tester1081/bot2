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
    console.log("Proxy received request:", JSON.stringify(requestBody))

    // Validate the request body
    if (!requestBody.network || !requestBody.phone || !requestBody.data_plan) {
      console.error("Invalid request body:", JSON.stringify(requestBody))
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Bad Request",
          message: "Missing required fields: network, phone, or data_plan",
          status: "failed",
        }),
      }
    }

    // Format the phone number correctly (ensure it starts with 234)
    if (typeof requestBody.phone === "string" && !requestBody.phone.startsWith("234")) {
      requestBody.phone = requestBody.phone.replace(/^0/, "234")
    }

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

    console.log("Making request to N3tdata API with options:", JSON.stringify(options))
    console.log("Request payload:", JSON.stringify(requestBody))

    // Make the request to the N3tdata API
    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          console.log("N3tdata API response status:", res.statusCode)
          console.log("N3tdata API response body:", data)

          try {
            // Try to parse the response as JSON
            const jsonData = JSON.parse(data)
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
            })
          } catch (e) {
            console.error("Error parsing API response:", e)
            console.error("Raw response:", data)
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: JSON.stringify({
                status: "failed",
                message: "Invalid response from API",
                raw: data,
              }),
            })
          }
        })
      })

      req.on("error", (error) => {
        console.error("Request error:", error)
        reject(error)
      })

      // Set a timeout for the request (15 seconds)
      req.setTimeout(15000, () => {
        req.abort()
        reject(new Error("Request to N3tdata API timed out"))
      })

      req.write(JSON.stringify(requestBody))
      req.end()
    })

    console.log("Returning response to client")

    // Check if the response is a success or failure
    try {
      const responseData = JSON.parse(response.body)
      if (responseData.status !== "success") {
        console.log("API returned failure:", responseData)
        // If the error is related to insufficient funds or admin issues, format it specially
        if (
          responseData.message &&
          (responseData.message.toLowerCase().includes("insufficient") ||
            responseData.message.toLowerCase().includes("balance") ||
            responseData.message.toLowerCase().includes("wallet"))
        ) {
          return {
            statusCode: 400,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "failed",
              message: "Error 404: Contact admin for assistance",
              originalMessage: responseData.message,
              adminError: true,
            }),
          }
        }
      }
    } catch (e) {
      console.error("Error processing response:", e)
    }

    // Return the response from the N3tdata API
    return {
      statusCode: response.statusCode,
      headers: {
        "Content-Type": "application/json",
      },
      body: response.body,
    }
  } catch (error) {
    console.error("Error in proxy:", error)

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        status: "failed",
      }),
    }
  }
}

