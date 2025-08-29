// Quick fix script to remove unused imports for production build
const fs = require('fs');

// Files and imports to remove
const fixes = [
  {
    file: 'src/services/exportService.test.ts',
    fixes: [
      { search: 'global.URL.createObjectURL = vi.fn(() => \'mock-blob-url\');', replace: '(global as any).URL.createObjectURL = vi.fn(() => \'mock-blob-url\');' },
      { search: 'global.URL', replace: '(global as any).URL' }
    ]
  },
  // Add more fixes as needed
];

fixes.forEach(({ file, fixes: fileFixes }) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    fileFixes.forEach(({ search, replace }) => {
      content = content.replace(new RegExp(search, 'g'), replace);
    });
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  } catch (error) {
    console.log(`Skipping ${file}: ${error.message}`);
  }
});

console.log('Build fixes applied');