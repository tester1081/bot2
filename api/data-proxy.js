// API proxy for data purchases
// This file handles forwarding requests to the n3tdata.com API

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" })
  }

  // Basic security check - verify the request is coming from your domain
  const referer = req.headers.referer || ""
  const allowedDomains = ["veltrawave-vtu.vercel.app", "v0-bot2-five.vercel.app", "localhost"]
  const isAllowedDomain = allowedDomains.some((domain) => referer.includes(domain))

  if (!isAllowedDomain && process.env.NODE_ENV === "production") {
    return res.status(403).json({
      status: "error",
      message: "Unauthorized access",
    })
  }

  try {
    const { network, phone, data_plan, bypass, "request-id": requestId } = req.body

    // Validate required parameters
    if (!phone || !data_plan) {
      return res.status(400).json({
        status: "error",
        message: "Missing required parameters",
      })
    }

    // Ensure network is a valid number (default to 1 if invalid)
    const networkId = isNaN(Number.parseInt(network)) ? 1 : Number.parseInt(network)

    // Format phone number (ensure it starts with 234 instead of 0)
    const formattedPhone = phone.toString().replace(/^0/, "234")

    // Create the payload for the API
    const payload = {
      network: networkId,
      phone: formattedPhone,
      data_plan: Number.parseInt(data_plan),
      bypass: bypass || false,
      "request-id": requestId,
    }

    console.log("Forwarding request to n3tdata API:", payload)

    // API token for n3tdata.com
    const apiToken = "3cfedeade5a3a75342ce13245ac4de9e9b3ca0aaf86a05a5aa1447c12d7d"

    // Make the API call to n3tdata.com
    const response = await fetch("https://n3tdata.com/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiToken}`,
      },
      body: JSON.stringify(payload),
    })

    // Get the response data
    const data = await response.json()

    // Log success but don't include sensitive details
    if (data.status === "success") {
      console.log(`Data purchase successful for ${formattedPhone}`)
    } else {
      console.error("Data purchase failed:", data.message)
    }

    // Return the response to the client
    return res.status(response.status).json(data)
  } catch (error) {
    console.error("API proxy error:", error)
    return res.status(500).json({
      status: "error",
      message: "Failed to process data purchase request",
      error: error.message,
    })
  }
}

