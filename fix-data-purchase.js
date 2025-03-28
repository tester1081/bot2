// This code fixes the network parameter issue in the processAutomaticRequest function
// Replace the existing function with this updated version

// Assuming these variables are defined elsewhere in your project
// For demonstration purposes, I'm adding placeholder declarations.
// Replace these with your actual implementations or imports.
const db = {
  collection: (collectionName) => {
    return {
      add: (data) => {
        return new Promise((resolve) => {
          console.log(`Simulating adding to ${collectionName}:`, data)
          resolve({ id: "fakeDocId" })
        })
      },
      doc: (docId) => {
        return {
          update: (data) => {
            return new Promise((resolve) => {
              console.log(`Simulating updating doc ${docId}:`, data)
              resolve()
            })
          },
        }
      },
    }
  },
}

const currentUser = {
  uid: "fakeUserId",
  balance: 1000,
}

const firebase = {
  firestore: {
    FieldValue: {
      serverTimestamp: () => {
        return new Date()
      },
    },
  },
}

function updateBalanceDisplay() {
  console.log("Simulating updating balance display")
}

const confirmationModal = {
  classList: {
    remove: (className) => {
      console.log(`Simulating removing class ${className} from confirmationModal`)
    },
    add: (className) => {
      console.log(`Simulating adding class ${className} to confirmationModal`)
    },
  },
}

function showToast(type, title, message) {
  console.log(`Simulating showing toast: Type=${type}, Title=${title}, Message=${message}`)
}

function fetchUserRequests() {
  console.log("Simulating fetching user requests")
}

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

      // Try to extract plan ID from the plan name
      if (planName.includes("500MB")) dataPlanId = 1
      else if (planName.includes("1GB")) dataPlanId = 2
      else if (planName.includes("2GB")) dataPlanId = 3
      else if (planName.includes("3GB")) dataPlanId = 4
      else if (planName.includes("5GB")) dataPlanId = 5
      else if (planName.includes("10GB")) dataPlanId = 6

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

