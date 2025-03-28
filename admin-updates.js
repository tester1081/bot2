// Add this to the dataA.html page to enable plan type management

// Mock implementations for showLoading, hideLoading, and showToast
// In a real application, these would be replaced with actual implementations
function showLoading() {
  console.log("showLoading")
}

function hideLoading() {
  console.log("hideLoading")
}

function showToast(message, type) {
  console.log(`showToast: ${message} (type: ${type})`)
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize plan types
  window.PlanTypeManager.initializePlanTypes()

  // Add Plan Type Management tab
  const tabs = document.querySelector(".tabs")
  const planTypeTab = document.createElement("div")
  planTypeTab.className = "tab"
  planTypeTab.setAttribute("data-tab", "plan-types")
  planTypeTab.textContent = "Plan Types"
  tabs.appendChild(planTypeTab)

  // Add Plan Type Management tab content
  const tabContents = document.querySelector(".tab-content").parentNode
  const planTypeContent = document.createElement("div")
  planTypeContent.className = "tab-content"
  planTypeContent.id = "plan-types-tab"

  planTypeContent.innerHTML = `
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">Plan Type Management</h3>
        <div class="table-actions">
          <button class="btn btn-secondary" id="refresh-plan-types-btn">
            <i class="fas fa-sync"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>
      <p style="margin-bottom: 20px;">Enable or disable specific plan types to control which plans are visible to users.</p>
      <table class="table" id="plan-types-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="plan-types-table-body">
          <!-- Plan types will be loaded dynamically -->
        </tbody>
      </table>
    </div>
  `

  tabContents.appendChild(planTypeContent)

  // Load plan types
  loadPlanTypes()

  // Add event listener to refresh button
  document.getElementById("refresh-plan-types-btn").addEventListener("click", () => {
    loadPlanTypes()
  })

  // Add event listener to tab
  planTypeTab.addEventListener("click", function () {
    const tabId = this.getAttribute("data-tab")

    // Remove active class from all tabs and contents
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))

    // Add active class to clicked tab and corresponding content
    this.classList.add("active")
    document.getElementById(`${tabId}-tab`).classList.add("active")
  })
})

// Load plan types
async function loadPlanTypes() {
  try {
    showLoading()

    const planTypes = await window.PlanTypeManager.getAllPlanTypes()
    const tableBody = document.getElementById("plan-types-table-body")

    tableBody.innerHTML = ""

    if (planTypes.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No plan types found</td></tr>'
      hideLoading()
      return
    }

    planTypes.forEach((planType) => {
      const row = document.createElement("tr")

      const statusClass = planType.status ? "status-active" : "status-inactive"
      const statusText = planType.status ? "Active" : "Inactive"
      const buttonText = planType.status ? "Deactivate" : "Activate"
      const buttonClass = planType.status ? "btn-danger" : "btn-primary"

      row.innerHTML = `
        <td>${planType.id}</td>
        <td>${planType.name}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn ${buttonClass} btn-sm toggle-plan-type" data-id="${planType.id}" data-active="${planType.status}">
            ${buttonText}
          </button>
        </td>
      `

      tableBody.appendChild(row)

      // Add event listener to toggle status button
      const toggleBtn = row.querySelector(".toggle-plan-type")
      toggleBtn.addEventListener("click", function () {
        const planTypeId = this.getAttribute("data-id")
        const currentStatus = this.getAttribute("data-active") === "true"
        togglePlanTypeStatus(planTypeId, !currentStatus)
      })
    })

    hideLoading()
  } catch (error) {
    console.error("Error loading plan types:", error)
    showToast("Failed to load plan types", "error")
    hideLoading()
  }
}

// Toggle plan type status
async function togglePlanTypeStatus(planTypeId, newStatus) {
  try {
    showLoading()

    const success = await window.PlanTypeManager.updatePlanTypeStatus(planTypeId, newStatus)

    if (success) {
      showToast(`Plan type ${newStatus ? "activated" : "deactivated"} successfully`, "success")

      // Reload plan types
      await loadPlanTypes()
    } else {
      showToast(`Failed to ${newStatus ? "activate" : "deactivate"} plan type`, "error")
    }

    hideLoading()
  } catch (error) {
    console.error("Error toggling plan type status:", error)
    showToast(`Failed to ${newStatus ? "activate" : "deactivate"} plan type`, "error")
    hideLoading()
  }
}

