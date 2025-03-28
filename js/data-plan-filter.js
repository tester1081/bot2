// Data Plan Filter - Filters data plans based on active plan types
class DataPlanFilter {
  constructor() {
    this.planTypeManager = new PlanTypeManager()
  }

  // Initialize the filter
  async initialize() {
    try {
      await this.planTypeManager.initPlanTypes()
    } catch (error) {
      console.error("Error initializing data plan filter:", error)
    }
  }

  // Filter plans based on active plan types
  async filterPlans(plans) {
    try {
      const activePlanTypes = await this.planTypeManager.getActivePlanTypes()
      const activePlanTypeIds = activePlanTypes.map((type) => type.id)

      // Filter plans based on category
      return plans.filter((plan) => {
        const category = plan.category.toLowerCase()

        // Check if the plan's category contains any active plan type
        return activePlanTypeIds.some((typeId) => category.includes(typeId))
      })
    } catch (error) {
      console.error("Error filtering plans:", error)
      return plans // Return all plans on error
    }
  }

  // Check if a specific category is active
  async isCategoryActive(category) {
    try {
      const categoryLower = category.toLowerCase()

      // Check which plan type this category belongs to
      let planTypeId = null

      if (categoryLower.includes("sme")) {
        planTypeId = "sme"
      } else if (categoryLower.includes("gifting")) {
        planTypeId = "gifting"
      } else if (categoryLower.includes("cooperate")) {
        planTypeId = "cooperate"
      } else if (categoryLower.includes("manual")) {
        planTypeId = "manual"
      }

      if (planTypeId) {
        return await this.planTypeManager.isPlanTypeActive(planTypeId)
      }

      return true // Default to active if category doesn't match any plan type
    } catch (error) {
      console.error("Error checking category status:", error)
      return true // Default to active on error
    }
  }
}

// Export the class
window.DataPlanFilter = DataPlanFilter

