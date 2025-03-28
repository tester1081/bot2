// Plan Type Manager - Handles enabling/disabling plan types

// Initialize Firebase (assuming Firebase is already loaded)
// Declare firebase if it's not already available globally
if (typeof firebase === "undefined") {
    console.error("Firebase is not initialized. Ensure Firebase SDK is included in your HTML.")
  }
  const db = firebase.firestore()
  
  // Plan type status collection
  const PLAN_TYPE_COLLECTION = "planTypeStatus"
  
  // Default plan types
  const DEFAULT_PLAN_TYPES = [
    { id: "mtn-sme", name: "MTN SME", status: true },
    { id: "mtn-cooperate", name: "MTN COOPERATE", status: true },
    { id: "mtn-gifting", name: "MTN GIFTING", status: true },
    { id: "airtel-sme", name: "AIRTEL SME", status: true },
    { id: "airtel-cooperate", name: "AIRTEL COOPERATE", status: true },
    { id: "airtel-gifting", name: "AIRTEL GIFTING", status: true },
    { id: "glo-cooperate", name: "GLO COOPERATE", status: true },
    { id: "glo-gifting", name: "GLO GIFTING", status: true },
    { id: "9mobile-cooperate", name: "9MOBILE COOPERATE", status: true },
    { id: "9mobile-gifting", name: "9MOBILE GIFTING", status: true },
    { id: "manual-1day", name: "MANUAL 1-DAY", status: true },
    { id: "manual-7day", name: "MANUAL 7-DAY", status: true },
    { id: "manual-14day", name: "MANUAL 14-DAY", status: true },
    { id: "manual-30day", name: "MANUAL 30-DAY", status: true },
  ]
  
  // Initialize plan types
  async function initializePlanTypes() {
    try {
      // Check if plan types collection exists
      const snapshot = await db.collection(PLAN_TYPE_COLLECTION).get()
  
      if (snapshot.empty) {
        // Add default plan types
        const batch = db.batch()
  
        DEFAULT_PLAN_TYPES.forEach((planType) => {
          const docRef = db.collection(PLAN_TYPE_COLLECTION).doc(planType.id)
          batch.set(docRef, planType)
        })
  
        await batch.commit()
        console.log("Default plan types initialized")
      }
    } catch (error) {
      console.error("Error initializing plan types:", error)
    }
  }
  
  // Get all plan types
  async function getAllPlanTypes() {
    try {
      const snapshot = await db.collection(PLAN_TYPE_COLLECTION).get()
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
      return []
    }
  }
  
  // Update plan type status
  async function updatePlanTypeStatus(planTypeId, status) {
    try {
      await db.collection(PLAN_TYPE_COLLECTION).doc(planTypeId).update({
        status: status,
      })
  
      return true
    } catch (error) {
      console.error("Error updating plan type status:", error)
      return false
    }
  }
  
  // Check if plan type is active
  async function isPlanTypeActive(planTypeId) {
    try {
      const doc = await db.collection(PLAN_TYPE_COLLECTION).doc(planTypeId).get()
  
      if (doc.exists) {
        return doc.data().status
      }
  
      return true // Default to active if not found
    } catch (error) {
      console.error("Error checking plan type status:", error)
      return true // Default to active on error
    }
  }
  
  // Export functions
  window.PlanTypeManager = {
    initializePlanTypes,
    getAllPlanTypes,
    updatePlanTypeStatus,
    isPlanTypeActive,
  }
  
  