const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'app/api/halaxy/patients/route.ts.new');
const destPath = path.join(__dirname, 'app/api/halaxy/patients/route.ts');

// Read the source file
const content = fs.readFileSync(sourcePath, 'utf8');

// Write to the destination file
fs.writeFileSync(destPath, content);

console.log('File replaced successfully!');
