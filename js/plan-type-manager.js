// Plan Type Manager - Handles enabling/disabling of plan types
class PlanTypeManager {
  constructor() {
    this.db = firebase.firestore()
    this.planTypesCollection = "planTypes"
    this.defaultPlanTypes = [
      { id: "sme", name: "SME", active: true },
      { id: "gifting", name: "Gifting", active: true },
      { id: "cooperate", name: "Cooperate Gifting", active: true },
      { id: "manual", name: "Manual Data", active: true },
    ]
  }

  // Initialize plan types in Firestore if they don't exist
  async initPlanTypes() {
    try {
      const snapshot = await this.db.collection(this.planTypesCollection).get()

      if (snapshot.empty) {
        const batch = this.db.batch()

        this.defaultPlanTypes.forEach((planType) => {
          const docRef = this.db.collection(this.planTypesCollection).doc(planType.id)
          batch.set(docRef, planType)
        })

        await batch.commit()
        console.log("Default plan types initialized")
      }
    } catch (error) {
      console.error("Error initializing plan types:", error)
      throw error
    }
  }

  // Get all plan types
  async getAllPlanTypes() {
    try {
      const snapshot = await this.db.collection(this.planTypesCollection).get()
      const planTypes = []

      snapshot.forEach((doc) => {
        planTypes.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      return planTypes
    } catch (error) {
      console.error("Error getting plan types:", error)
      throw error
    }
  }

  // Update plan type status
  async updatePlanTypeStatus(planTypeId, active) {
    try {
      await this.db.collection(this.planTypesCollection).doc(planTypeId).update({
        active: active,
      })

      return true
    } catch (error) {
      console.error("Error updating plan type status:", error)
      throw error
    }
  }

  // Check if a plan type is active
  async isPlanTypeActive(planTypeId) {
    try {
      const doc = await this.db.collection(this.planTypesCollection).doc(planTypeId).get()

      if (doc.exists) {
        return doc.data().active
      }

      return true // Default to active if not found
    } catch (error) {
      console.error("Error checking plan type status:", error)
      return true // Default to active on error
    }
  }

  // Get active plan types
  async getActivePlanTypes() {
    try {
      const snapshot = await this.db.collection(this.planTypesCollection).where("active", "==", true).get()

      const planTypes = []

      snapshot.forEach((doc) => {
        planTypes.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      return planTypes
    } catch (error) {
      console.error("Error getting active plan types:", error)
      throw error
    }
  }
}

// Export the class
window.PlanTypeManager = PlanTypeManager

