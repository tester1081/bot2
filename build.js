const fs = require('fs');
const path = require('path');

// Read the HTML files
const htmlFiles = ["index.html", "fund-wallet.html", "data.html", "cable.html", "account.html", "admin.html, login.html"]
const outputDir = path.join(__dirname, 'public');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Process each HTML file
htmlFiles.forEach(htmlFile => {
  const htmlPath = path.join(__dirname, htmlFile);
  
  // Skip if file doesn't exist
  if (!fs.existsSync(htmlPath)) {
    console.log(`Warning: ${htmlFile} not found. Skipping.`);
    return;
  }
  
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Replace environment variable placeholders
  const envVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'
  ];

  envVars.forEach(varName => {
    const value = process.env[varName] || '';
    htmlContent = htmlContent.replace(`%${varName}%`, value);
  });

  // Write the processed HTML to the output directory
  fs.writeFileSync(path.join(outputDir, htmlFile), htmlContent);
  console.log(`Processed ${htmlFile} successfully!`);
});

// Copy logo.png if it exists
const logoPath = path.join(__dirname, 'logo.png');
const logoOutputPath = path.join(outputDir, 'logo.png');

if (fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, logoOutputPath);
  console.log('Logo copied successfully!');
} else {
  console.log('Warning: logo.png not found. Please add it to your project.');
}

// Create API directory and config.js
const apiDir = path.join(outputDir, 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir);
}

// Create config.js file
const configJsContent = `
export default function handler(req, res) {
  res.status(200).json({
    FIREBASE_API_KEY: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}",
    FIREBASE_AUTH_DOMAIN: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}",
    FIREBASE_PROJECT_ID: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}",
    FIREBASE_STORAGE_BUCKET: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}",
    FIREBASE_MESSAGING_SENDER_ID: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
    FIREBASE_APP_ID: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}",
    PAYSTACK_PUBLIC_KEY: "${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''}"
  });
}
`;

fs.writeFileSync(path.join(apiDir, 'config.js'), configJsContent);
console.log('API config.js created successfully!');

console.log('Build completed successfully!');
