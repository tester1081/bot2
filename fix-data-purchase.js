// This code fixes the network parameter issue in the processAutomaticRequest function
// and adds plan ID mapping to ensure correct data plans are used

// Map of plan names to their correct API IDs
const PLAN_ID_MAP = {
  // MTN SME
  "MTN SME 750MB": 1,
  "MTN SME 1GB": 2,
  "MTN SME 1.5GB": 3,
  "MTN SME 1.2GB": 4,
  "MTN SME 2GB": 5,
  "MTN SME 10GB": 6,

  // 9MOBILE GIFTING
  "9MOBILE GIFTING 1.5GB": 36,
  "9MOBILE GIFTING 2GB": 37,
  "9MOBILE GIFTING 3GB": 38,
  "9MOBILE GIFTING 4.5GB": 39,

  // AIRTEL COOPERATE GIFTING
  "AIRTEL COOPERATE GIFTING 500MB": 46,
  "AIRTEL COOPERATE GIFTING 1GB": 47,
  "AIRTEL COOPERATE GIFTING 2GB": 48,
  "AIRTEL COOPERATE GIFTING 5GB": 49,

  // MTN COOPERATE GIFTING
  "MTN COOPERATE GIFTING 500MB": 50,
  "MTN COOPERATE GIFTING 1GB": 51,
  "MTN COOPERATE GIFTING 2GB": 52,
  "MTN COOPERATE GIFTING 3GB": 53,
  "MTN COOPERATE GIFTING 5GB": 54,
  "MTN COOPERATE GIFTING 10GB": 55,

  // AIRTEL COOPERATE GIFTING
  "AIRTEL COOPERATE GIFTING 10GB": 56,

  // GLO COOPERATE GIFTING
  "GLO COOPERATE GIFTING 200MB": 57,
  "GLO COOPERATE GIFTING 500MB": 58,
  "GLO COOPERATE GIFTING 1GB": 59,
  "GLO COOPERATE GIFTING 2GB": 60,
  "GLO COOPERATE GIFTING 3GB": 61,
  "GLO COOPERATE GIFTING 5GB": 62,
  "GLO COOPERATE GIFTING 10GB": 63,

  // AIRTEL COOPERATE GIFTING
  "AIRTEL COOPERATE GIFTING 300MB": 70,
  "AIRTEL COOPERATE GIFTING 100MB": 71,

  // 9MOBILE COOPERATE GIFTING
  "9MOBILE COOPERATE GIFTING 500MB": 72,
  "9MOBILE COOPERATE GIFTING 1GB": 73,
  "9MOBILE COOPERATE GIFTING 2GB": 74,
  "9MOBILE COOPERATE GIFTING 3GB": 75,
  "9MOBILE COOPERATE GIFTING 5GB": 76,
  "9MOBILE COOPERATE GIFTING 10GB": 77,

  // AIRTEL GIFTING
  "AIRTEL GIFTING 300MB": 83,
  "AIRTEL GIFTING 600MB": 84,
  "AIRTEL GIFTING 1GB": 85,
  "AIRTEL GIFTING 2GB": 86,
  "AIRTEL GIFTING 3GB": 87,
  "AIRTEL GIFTING 7GB": 88,
  "AIRTEL GIFTING 10GB": 89,

  // GLO GIFTING
  "GLO GIFTING 1GB": 90,
  "GLO GIFTING 2GB": 91,
  "GLO GIFTING 3.5GB": 92,
  "GLO GIFTING 15GB": 93,

  // MTN GIFTING
  "MTN GIFTING 10GB": 103,
  "MTN GIFTING 3GB": 104,
}

// Assuming these are initialized elsewhere in your project
// For example, if you're using Firebase:
// import { db, auth, firebase } from './firebaseConfig'; // Or however you've configured it
// Or if they are globally available:
// const db = window.db;
// const currentUser = window.currentUser;
// const firebase = window.firebase;
// const updateBalanceDisplay = window.updateBalanceDisplay;
// const confirmationModal = document.getElementById('confirmationModal'); // Or however you get it

// Declare variables if they are not globally available or imported
let db
let currentUser
let firebase
let updateBalanceDisplay
let confirmationModal
let showToast
let fetchUserRequests

// Process automatic data request
function processAutomaticRequest(requestData, amount) {
  // First save the request to Firestore
  db.collection("dataRequests")
    .add(requestData)
    .then((docRef) => {
      console.log("Automatic request saved with ID:", docRef.id)

      // Determine data plan ID for API based on the selected plan
      let dataPlanId = 1 // Default
      const planName = requestData.planName

      // Use the plan ID map to get the correct API plan ID
      if (PLAN_ID_MAP[planName]) {
        dataPlanId = PLAN_ID_MAP[planName]
        console.log(`Found plan ID ${dataPlanId} for plan "${planName}"`)
      } else {
        // Fallback to the old method if plan not found in map
        if (planName.includes("500MB")) dataPlanId = 1
        else if (planName.includes("1GB")) dataPlanId = 2
        else if (planName.includes("2GB")) dataPlanId = 3
        else if (planName.includes("3GB")) dataPlanId = 4
        else if (planName.includes("5GB")) dataPlanId = 5
        else if (planName.includes("10GB")) dataPlanId = 6
        console.log(`Using fallback plan ID ${dataPlanId} for plan "${planName}"`)
      }

      console.log("Making API call with plan ID:", dataPlanId)

      // Create payload for API - FIX: Ensure network is a valid number
      const networkId = Number.parseInt(requestData.networkId) || 1 // Default to 1 (MTN) if parsing fails

      const payload = {
        network: networkId,
        phone: requestData.phoneNumber.replace(/^0/, "234"), // Convert 07067479043 to 2347067479043 format
        data_plan: dataPlanId,
        bypass: false,
        "request-id": requestData.requestId,
      }

      console.log("API Payload:", payload)

      // Make API call through our proxy
      return fetch("/api/data-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          console.log("API Response status:", response.status)
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          console.log("API Response data:", data)

          // Check if the API call was successful
          if (data.status === "success") {
            // Deduct amount from user's balance
            const newBalance = currentUser.balance - amount

            // Update user's balance in Firestore
            return db
              .collection("users")
              .doc(currentUser.uid)
              .update({
                balance: newBalance,
                updated_at: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then(() => {
                // Update local user object
                currentUser.balance = newBalance

                // Update balance display
                updateBalanceDisplay()

                // Update request status in Firestore
                return db.collection("dataRequests").doc(docRef.id).update({
                  status: "completed",
                  apiResponse: data,
                  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                })
              })
              .then(() => {
                // Close modal
                confirmationModal.classList.remove("show")

                // Show success toast
                showToast("success", "Purchase Successful", "Your data purchase has been processed successfully")

                // Reset form
                document.getElementById("data-form").reset()
                document.getElementById("data-plan").innerHTML =
                  '<option value="" selected disabled>Select Data Plan</option>'

                // Refresh requests
                fetchUserRequests()
              })
          } else {
            // API call failed
            throw new Error(data.message || "API call failed")
          }
        })
        .catch((error) => {
          console.error("API Error:", error)

          // Update request status in Firestore
          return db
            .collection("dataRequests")
            .doc(docRef.id)
            .update({
              status: "failed",
              error: error.message,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(() => {
              // Close modal
              confirmationModal.classList.remove("show")

              // Check if error is due to insufficient funds or admin-related
              if (
                error.message &&
                (error.message.toLowerCase().includes("insufficient") ||
                  error.message.toLowerCase().includes("balance") ||
                  error.message.toLowerCase().includes("wallet"))
              ) {
                showToast("error", "Error 404", "Contact admin for assistance")
              } else {
                showToast("error", "Failed", "Failed to process your data purchase. Please try again.")
              }
            })
        })
    })
    .catch((error) => {
      console.error("Error saving automatic request:", error)

      // Reset confirm button
      document.getElementById("confirm-purchase").innerHTML = '<i class="fas fa-check-circle"></i> Confirm'
      document.getElementById("confirm-purchase").disabled = false

      // Close modal
      confirmationModal.classList.remove("show")

      // Show error toast
      showToast("error", "Failed", "Failed to process your request. Please try again.")
    })
    .finally(() => {
      // Reset confirm button
      document.getElementById("confirm-purchase").innerHTML = '<i class="fas fa-check-circle"></i> Confirm'
      document.getElementById("confirm-purchase").disabled = false
    })
}

// Override the original processAutomaticRequest function
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof window.processAutomaticRequest === "function") {
      console.log("Overriding processAutomaticRequest function with fixed version")
      window.processAutomaticRequest = processAutomaticRequest
    }
  })
}

