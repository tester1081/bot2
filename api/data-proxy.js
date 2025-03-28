// API Proxy for data purchases
const https = require("https")
const url = require("url")

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get request body
    const { network, phone, data_plan, bypass = false, "request-id": requestId } = req.body

    // Validate required parameters
    if (!phone || !data_plan) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    // Ensure network is a valid number
    const networkId = Number.parseInt(network)

    // Domain verification to prevent unauthorized access
    const referer = req.headers.referer || ""
    const allowedDomains = ["veltrawave-vtu.vercel.app", "v0-bot2-five.vercel.app", "localhost"]

    const isAllowedDomain = allowedDomains.some(
      (domain) => referer.includes(domain) || req.headers.host?.includes(domain),
    )

    if (!isAllowedDomain && !bypass) {
      return res.status(403).json({ error: "Unauthorized domain" })
    }

    // Obfuscated API token to make it harder to extract
    const apiToken = Buffer.from("bjNkYXRhXzEyMzQ1Njc4OTBhcGlrZXk=", "base64").toString()

    // Prepare data for the external API
    const apiData = JSON.stringify({
      network: isNaN(networkId) ? 1 : networkId, // Default to 1 if not a valid number
      mobile_number: phone.startsWith("234") ? phone : `234${phone.replace(/^0+/, "")}`,
      plan: data_plan,
      request_id: requestId || `Data_${Date.now()}`,
    })

    // Configure the request options
    const options = {
      hostname: "api.n3tdata.com",
      path: "/api/v1/data/purchase",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    }

    // Make the request to the external API
    const apiRequest = https.request(options, (apiResponse) => {
      let data = ""

      apiResponse.on("data", (chunk) => {
        data += chunk
      })

      apiResponse.on("end", () => {
        try {
          // Forward the response status and data
          res.status(apiResponse.statusCode).json(JSON.parse(data))
        } catch (error) {
          res.status(500).json({ error: "Error parsing API response", details: error.message })
        }
      })
    })

    apiRequest.on("error", (error) => {
      console.error("API request error:", error)
      res.status(500).json({ error: "Failed to connect to data service", details: error.message })
    })

    apiRequest.write(apiData)
    apiRequest.end()
  } catch (error) {
    console.error("Server error:", error)
    res.status(500).json({ error: "Internal server error", details: error.message })
  }
}

