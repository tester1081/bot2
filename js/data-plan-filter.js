// Data Plan Filter - Filters data plans based on active plan types

// Initialize Firebase (assuming Firebase is already loaded)
const firebase = window.firebase // Assuming Firebase is loaded globally
const db = firebase.firestore()

// Filter data plans based on active plan types
async function filterDataPlansByActiveTypes() {
  try {
    // Get all data plans
    const plansSnapshot = await db.collection("dataPlans").get()
    const allPlans = []

    plansSnapshot.forEach((doc) => {
      allPlans.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    // Get all plan types
    const planTypes = await window.PlanTypeManager.getAllPlanTypes()
    const activeTypeIds = planTypes.filter((type) => type.status).map((type) => type.id)

    // Filter plans by active types
    const filteredPlans = allPlans.filter((plan) => {
      return activeTypeIds.includes(plan.category)
    })

    return filteredPlans
  } catch (error) {
    console.error("Error filtering data plans:", error)
    return []
  }
}

// Get active plan types for dropdown
async function getActivePlanTypesForDropdown() {
  try {
    // Get all plan types
    const planTypes = await window.PlanTypeManager.getAllPlanTypes()

    // Filter active types
    return planTypes.filter((type) => type.status)
  } catch (error) {
    console.error("Error getting active plan types:", error)
    return []
  }
}

// Export functions
window.DataPlanFilter = {
  filterDataPlansByActiveTypes,
  getActivePlanTypesForDropdown,
}

