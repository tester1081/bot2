const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace environment variable placeholders
const envVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

envVars.forEach(varName => {
  const value = process.env[varName] || '';
  htmlContent = htmlContent.replace(`%${varName}%`, value);
});

// Write the processed HTML to the output directory
const outputDir = path.join(__dirname, 'public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.writeFileSync(path.join(outputDir, 'index.html'), htmlContent);
console.log('Build completed successfully!');