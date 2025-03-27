const fs = require("fs")
const path = require("path")

// Define the directory containing HTML files and the output directory
const htmlDir = "./public"
const outputDir = "./.next/static"

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Read all HTML files from the directory
const htmlFiles = fs.readdirSync(htmlDir).filter((file) => file.endsWith(".html"))

// Process each HTML file
htmlFiles.forEach((htmlFile) => {
  const htmlPath = path.join(__dirname, "public", htmlFile)

  // Skip if file doesn't exist
  if (!fs.existsSync(htmlPath)) {
    console.log(`Warning: ${htmlFile} not found. Skipping.`)
    return
  }

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

  // Write the processed HTML to the output directory
  fs.writeFileSync(path.join(outputDir, htmlFile), htmlContent)
  console.log(`Processed ${htmlFile} successfully!`)
})

