#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, '../tests/ui-comprehensive/01-IntelSources.test.tsx');
let content = fs.readFileSync(testFile, 'utf8');

// Array of test patterns that need async/await fixing
const testsToFix = [
  { test: 'UI_007', searchPattern: /test\('UI_007:[^']*', \(\) => \{/ },
  { test: 'UI_008', searchPattern: /test\('UI_008:[^']*', \(\) => \{/ },
  { test: 'UI_009', searchPattern: /test\('UI_009:[^']*', \(\) => \{/ },
  { test: 'UI_010', searchPattern: /test\('UI_010:[^']*', \(\) => \{/ },
  { test: 'UI_011', searchPattern: /test\('UI_011:[^']*', \(\) => \{/ },
  { test: 'UI_012', searchPattern: /test\('UI_012:[^']*', \(\) => \{/ },
  { test: 'UI_013', searchPattern: /test\('UI_013:[^']*', \(\) => \{/ },
  { test: 'UI_014', searchPattern: /test\('UI_014:[^']*', \(\) => \{/ },
  { test: 'UI_015', searchPattern: /test\('UI_015:[^']*', \(\) => \{/ },
  { test: 'UI_016', searchPattern: /test\('UI_016:[^']*', \(\) => \{/ },
  { test: 'UI_017', searchPattern: /test\('UI_017:[^']*', \(\) => \{/ },
  { test: 'UI_018', searchPattern: /test\('UI_018:[^']*', \(\) => \{/ },
  { test: 'UI_019', searchPattern: /test\('UI_019:[^']*', \(\) => \{/ },
  { test: 'UI_020', searchPattern: /test\('UI_020:[^']*', \(\) => \{/ },
  { test: 'UI_021', searchPattern: /test\('UI_021:[^']*', \(\) => \{/ },
  { test: 'UI_025', searchPattern: /test\('UI_025:[^']*', \(\) => \{/ }
];

testsToFix.forEach(({ test, searchPattern }) => {
  const match = content.match(searchPattern);
  if (match) {
    // Replace with async function
    const replacement = match[0].replace('() => {', 'async () => {');
    content = content.replace(match[0], replacement);
    
    // Add await waitFor after render
    const renderPattern = new RegExp(`(test\\('${test}:[^']*', async \\(\\) => \\{[\\s\\S]*?render\\([\\s\\S]*?\\);)`, 'm');
    const renderMatch = content.match(renderPattern);
    if (renderMatch) {
      const waitForBlock = `
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('ESTABLISHING CONNECTIONS...')).not.toBeInTheDocument();
    }, { timeout: 5000 });`;
      
      content = content.replace(renderMatch[1], renderMatch[1] + waitForBlock);
    }
  }
});

fs.writeFileSync(testFile, content);
console.log('✅ Fixed async patterns in UI tests');
