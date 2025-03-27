const fs = require("fs")
const path = require("path")

// Define the directory containing HTML files and the output directory
const htmlDir = "./"
const outputDir = "./"

// List of HTML files to process
const htmlFiles = [
  "index.html",
  "login.html",
  "admin.html",
  "data.html",
  "cable.html",
  "account.html",
  "fund-wallet.html",
]

// Process each HTML file
htmlFiles.forEach((htmlFile) => {
  const htmlPath = path.join(htmlDir, htmlFile)

  // Skip if file doesn't exist
  if (!fs.existsSync(htmlPath)) {
    console.log(`Warning: ${htmlFile} not found. Skipping.`)
    return
  }

  let htmlContent = fs.readFileSync(htmlPath, "utf8")

  // Replace environment variable placeholders
  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  }

  // Debug environment variables
  console.log(`Processing ${htmlFile}:`)
  Object.keys(envVars).forEach((varName) => {
    const value = envVars[varName]
    console.log(`  ${varName}: ${value ? "(set)" : "(not set)"}`)

    // Replace all occurrences of %VARIABLE_NAME% with the actual value
    const regex = new RegExp(`%${varName}%`, "g")
    htmlContent = htmlContent.replace(regex, value)
  })

  // Write the processed HTML back to the same file
  fs.writeFileSync(path.join(outputDir, htmlFile), htmlContent)
  console.log(`Processed ${htmlFile} successfully!`)
})

console.log("All HTML files processed successfully!")

