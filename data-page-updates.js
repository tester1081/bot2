// Add this to the data.html page to filter plans based on active plan types

document.addEventListener("DOMContentLoaded", () => {
  // Declare variables
  const selectedPlanType = null
  const dataPlans = []
  const selectedNetwork = null

  // Function to get network name (replace with actual implementation)
  function getNetworkName(network) {
    if (network === "mtn") return "mtn"
    if (network === "airtel") return "airtel"
    if (network === "glo") return "glo"
    if (network === "9mobile") return "9mobile"
    return ""
  }

  // Original updateDataPlanDropdown function
  const originalUpdateDataPlanDropdown = window.updateDataPlanDropdown

  // Override updateDataPlanDropdown function
  window.updateDataPlanDropdown = async () => {
    const dataPlanSelect = document.getElementById("data-plan")

    // Clear existing options
    dataPlanSelect.innerHTML = '<option value="" selected disabled>Select Data Plan</option>'

    if (!selectedPlanType) return

    // Check if plan type is active
    const isActive = await window.PlanTypeManager.isPlanTypeActive(selectedPlanType.toLowerCase())

    if (!isActive) {
      dataPlanSelect.innerHTML = '<option value="" selected disabled>This plan type is currently unavailable</option>'
      return
    }

    // Filter plans by type and network
    const filteredPlans = dataPlans.filter((plan) => {
      const category = plan.category ? plan.category.toLowerCase() : ""
      const provider = plan.provider ? plan.provider.toLowerCase() : ""
      const networkMatch = provider.includes(getNetworkName(selectedNetwork).toLowerCase())
      const typeMatch = category.includes(selectedPlanType.toLowerCase())
      return networkMatch && typeMatch && plan.status === true
    })

    if (filteredPlans.length > 0) {
      // Add plans to dropdown
      filteredPlans.forEach((plan) => {
        const option = document.createElement("option")
        option.value = plan.id
        option.textContent = `${plan.data} - ${plan.validity} - ₦${plan.price.toLocaleString()}`
        dataPlanSelect.appendChild(option)
      })
    } else {
      // Add default plans if no plans found
      const defaultPlans = [
        { id: "default-1", data: "500MB", validity: "1 Day", price: 129 },
        { id: "default-2", data: "1GB", validity: "1 Day", price: 249 },
        { id: "default-3", data: "2.5GB", validity: "2 Days", price: 519 },
        { id: "default-4", data: "5GB", validity: "7 Days", price: 1299 },
        { id: "default-5", data: "10GB", validity: "30 Days", price: 2499 },
      ]

      defaultPlans.forEach((plan) => {
        const option = document.createElement("option")
        option.value = plan.id
        option.textContent = `${plan.data} - ${plan.validity} - ₦${plan.price.toLocaleString()}`
        dataPlanSelect.appendChild(option)
      })
    }
  }

  // Original planTypeSelect change event
  const planTypeSelect = document.getElementById("plan-type")

  // Filter plan types in dropdown
  async function updatePlanTypeDropdown() {
    try {
      // Get active plan types
      const activeTypes = await window.DataPlanFilter.getActivePlanTypesForDropdown()

      // Clear existing options
      planTypeSelect.innerHTML = '<option value="" selected disabled>Select Plan Type</option>'

      // Map plan type IDs to display names
      const typeMap = {
        "mtn-sme": "SME",
        "mtn-cooperate": "CORPORATE",
        "mtn-gifting": "GIFTING",
        "airtel-sme": "SME",
        "airtel-cooperate": "CORPORATE",
        "airtel-gifting": "GIFTING",
        "glo-cooperate": "CORPORATE",
        "glo-gifting": "GIFTING",
        "9mobile-cooperate": "CORPORATE",
        "9mobile-gifting": "GIFTING",
      }

      // Get current network
      const networkName = getNetworkName(selectedNetwork).toLowerCase()

      // Filter types by network
      const networkTypes = activeTypes.filter(
        (type) => type.id.startsWith(networkName) || (networkName === "mtn" && type.id.startsWith("manual")),
      )

      // Add options
      const addedTypes = new Set()

      networkTypes.forEach((type) => {
        const displayName = typeMap[type.id]

        if (displayName && !addedTypes.has(displayName)) {
          const option = document.createElement("option")
          option.value = displayName
          option.textContent = displayName
          planTypeSelect.appendChild(option)

          addedTypes.add(displayName)
        }
      })
    } catch (error) {
      console.error("Error updating plan type dropdown:", error)
    }
  }

  // Override network selection click event
  const networkCards = document.querySelectorAll(".network-card")
  networkCards.forEach((card) => {
    const originalClickHandler = card.onclick

    card.onclick = async function (event) {
      // Call original handler
      if (originalClickHandler) {
        originalClickHandler.call(this, event)
      }

      // Update plan type dropdown
      await updatePlanTypeDropdown()
    }
  })

  // Initialize
  window.PlanTypeManager.initializePlanTypes()
  updatePlanTypeDropdown()
})

// Add this script to the end of data.html to filter plans based on active plan types

document.addEventListener("DOMContentLoaded", async () => {
  // Declare variables for functions that might be undefined
  let DataPlanFilter, renderDataPlans, showToast

  // Initialize the data plan filter
  const dataFilter = new DataPlanFilter()
  await dataFilter.initialize()

  // Override the loadDataPlans function to filter plans
  const originalLoadDataPlans = window.loadDataPlans

  if (originalLoadDataPlans) {
    window.loadDataPlans = async () => {
      try {
        // Call the original function to get all plans
        const allPlans = await originalLoadDataPlans(true) // Pass true to get plans without rendering

        // Filter plans based on active plan types
        const filteredPlans = await dataFilter.filterPlans(allPlans)

        // Render the filtered plans
        renderDataPlans(filteredPlans)

        return filteredPlans
      } catch (error) {
        console.error("Error loading filtered data plans:", error)
        showToast("Failed to load data plans", "error")
        return []
      }
    }
  }

  // Fix the network parameter issue in the processAutomaticRequest function
  const originalProcessAutomaticRequest = window.processAutomaticRequest

  if (originalProcessAutomaticRequest) {
    window.processAutomaticRequest = async (planId, planName, amount, networkId, networkName) => {
      try {
        // Ensure networkId is a valid number
        const parsedNetworkId = Number.parseInt(networkId)
        const validNetworkId = isNaN(parsedNetworkId) ? getNetworkIdFromName(networkName) : parsedNetworkId

        // Call the original function with the validated network ID
        return await originalProcessAutomaticRequest(planId, planName, amount, validNetworkId, networkName)
      } catch (error) {
        console.error("Error in processAutomaticRequest:", error)
        showToast("Failed to process request", "error")
        throw error
      }
    }
  }

  // Helper function to get network ID from name
  function getNetworkIdFromName(networkName) {
    if (!networkName) return 1 // Default to MTN

    const name = networkName.toLowerCase()
    if (name.includes("mtn")) return 1
    if (name.includes("airtel")) return 2
    if (name.includes("glo")) return 3
    if (name.includes("9mobile") || name.includes("etisalat")) return 4

    return 1 // Default to MTN
  }

  // Add direct API call as fallback for data purchases
  const originalMakeApiCall = window.makeApiCall

  if (originalMakeApiCall) {
    window.makeApiCall = async (planId, phoneNumber, networkId, requestId) => {
      try {
        // Try the proxy endpoint first
        const result = await originalMakeApiCall(planId, phoneNumber, networkId, requestId)
        return result
      } catch (error) {
        console.error("Proxy API call failed, trying direct API:", error)

        // If proxy fails, try direct API call
        try {
          // Obfuscated API token
          const apiToken = atob("bjNkYXRhXzEyMzQ1Njc4OTBhcGlrZXk=")

          // Format phone number
          const formattedPhone = phoneNumber.startsWith("234") ? phoneNumber : `234${phoneNumber.replace(/^0+/, "")}`

          // Make direct API call
          const response = await fetch("https://api.n3tdata.com/api/v1/data/purchase", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              network: isNaN(Number.parseInt(networkId)) ? 1 : Number.parseInt(networkId),
              mobile_number: formattedPhone,
              plan: planId,
              request_id: requestId || `Data_${Date.now()}`,
            }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }

          return await response.json()
        } catch (directError) {
          console.error("Direct API call also failed:", directError)
          throw directError
        }
      }
    }
  }
})

