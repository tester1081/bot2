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

    // Map the data_plan to the correct API plan ID based on the provided list
    // This ensures we're using the correct plan IDs from the website
    const planIdMap = {
      // MTN SME
      1: 1, // MTN SME 750MB
      2: 2, // MTN SME 1GB
      3: 3, // MTN SME 1.5GB
      4: 4, // MTN SME 1.2GB
      5: 5, // MTN SME 2GB
      6: 6, // MTN SME 10GB

      // 9MOBILE GIFTING
      36: 36, // 9MOBILE GIFTING 1.5GB
      37: 37, // 9MOBILE GIFTING 2GB
      38: 38, // 9MOBILE GIFTING 3GB
      39: 39, // 9MOBILE GIFTING 4.5GB

      // AIRTEL COOPERATE GIFTING
      46: 46, // AIRTEL COOPERATE GIFTING 500MB
      47: 47, // AIRTEL COOPERATE GIFTING 1GB
      48: 48, // AIRTEL COOPERATE GIFTING 2GB
      49: 49, // AIRTEL COOPERATE GIFTING 5GB

      // MTN COOPERATE GIFTING
      50: 50, // MTN COOPERATE GIFTING 500MB
      51: 51, // MTN COOPERATE GIFTING 1GB
      52: 52, // MTN COOPERATE GIFTING 2GB
      53: 53, // MTN COOPERATE GIFTING 3GB
      54: 54, // MTN COOPERATE GIFTING 5GB
      55: 55, // MTN COOPERATE GIFTING 10GB

      // AIRTEL COOPERATE GIFTING
      56: 56, // AIRTEL COOPERATE GIFTING 10GB

      // GLO COOPERATE GIFTING
      57: 57, // GLO COOPERATE GIFTING 200MB
      58: 58, // GLO COOPERATE GIFTING 500MB
      59: 59, // GLO COOPERATE GIFTING 1GB
      60: 60, // GLO COOPERATE GIFTING 2GB
      61: 61, // GLO COOPERATE GIFTING 3GB
      62: 62, // GLO COOPERATE GIFTING 5GB
      63: 63, // GLO COOPERATE GIFTING 10GB

      // AIRTEL COOPERATE GIFTING
      70: 70, // AIRTEL COOPERATE GIFTING 300MB
      71: 71, // AIRTEL COOPERATE GIFTING 100MB

      // 9MOBILE COOPERATE GIFTING
      72: 72, // 9MOBILE COOPERATE GIFTING 500MB
      73: 73, // 9MOBILE COOPERATE GIFTING 1GB
      74: 74, // 9MOBILE COOPERATE GIFTING 2GB
      75: 75, // 9MOBILE COOPERATE GIFTING 3GB
      76: 76, // 9MOBILE COOPERATE GIFTING 5GB
      77: 77, // 9MOBILE COOPERATE GIFTING 10GB

      // AIRTEL GIFTING
      83: 83, // AIRTEL GIFTING 300MB
      84: 84, // AIRTEL GIFTING 600MB
      85: 85, // AIRTEL GIFTING 1GB
      86: 86, // AIRTEL GIFTING 2GB
      87: 87, // AIRTEL GIFTING 3GB
      88: 88, // AIRTEL GIFTING 7GB
      89: 89, // AIRTEL GIFTING 10GB

      // GLO GIFTING
      90: 90, // GLO GIFTING 1GB
      91: 91, // GLO GIFTING 2GB
      92: 92, // GLO GIFTING 3.5GB
      93: 93, // GLO GIFTING 15GB

      // MTN GIFTING
      103: 103, // MTN GIFTING 10GB
      104: 104, // MTN GIFTING 3GB
    }

    // Get the correct plan ID or use the original if not in the map
    const apiPlanId = planIdMap[data_plan] || data_plan

    // Create the payload for the API
    const payload = {
      network: networkId,
      phone: formattedPhone,
      data_plan: Number.parseInt(apiPlanId),
      bypass: bypass || false,
      "request-id": requestId,
    }

    console.log("Forwarding request to n3tdata API:", payload)

    // API token for n3tdata.com
    const apiToken = process.env.DATA_API_KEY || "3cfedeade5a3a75342ce13245ac4de9e9b3ca0aaf86a05a5aa1447c12d7d"

    // Make the API call to n3tdata.com
    const response = await fetch(process.env.DATA_API_URL || "https://n3tdata.com/api/data", {
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

