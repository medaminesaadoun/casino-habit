const fs = require('fs');
const c = fs.readFileSync('src/App.jsx', 'utf8');
let depth = 0;
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  for (let j = 0; j < l.length; j++) {
    const ch = l[j];
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) {
      console.log('Extra ) at line', i + 1, 'pos', j + 1);
      depth = 0;
    }
  }
  if (depth > 0) console.log('Open parens depth', depth, 'at line', i + 1);
}
console.log('Final paren depth:', depth);
