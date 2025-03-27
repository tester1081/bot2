const fs = require("fs")
const path = require("path")

// Define the directory containing HTML files
// This should be the root directory where your HTML files are located
const htmlDir = "./"

// List of HTML files to process
const htmlFiles = [
  "index.html",
  "login.html",
  "admin.html",
  "data.html",
  "cable.html",
  "account.html",
  "fund-wallet.html"
  "logo.png",
]

console.log(`Processing ${htmlFiles.length} HTML files`)

// Process each HTML file
htmlFiles.forEach((htmlFile) => {
  const htmlPath = path.join(htmlDir, htmlFile)

  // Skip if file doesn't exist
  if (!fs.existsSync(htmlPath)) {
    console.log(`Warning: ${htmlFile} not found. Skipping.`)
    return
  }

  console.log(`Processing ${htmlFile}...`)
  let htmlContent = fs.readFileSync(htmlPath, "utf8")

  // Replace environment variable placeholders
  const envVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  ]

  // Debug environment variables
  console.log("Environment Variables:")
  envVars.forEach((varName) => {
    const value = process.env[varName] || ""
    console.log(`${varName}: ${value ? "(set)" : "(not set)"}`)

    // Use a regular expression to replace all occurrences
    const regex = new RegExp(`%${varName}%`, "g")
    htmlContent = htmlContent.replace(regex, value)
  })

  // Write the processed HTML back to the same file
  fs.writeFileSync(htmlPath, htmlContent)
  console.log(`Processed ${htmlFile} successfully!`)
})

console.log("All HTML files processed successfully!")

