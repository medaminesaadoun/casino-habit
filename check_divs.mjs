import { readFileSync } from 'fs';

const c = readFileSync('src/App.jsx', 'utf8');
const lines = c.split('\n');

// Desktop section: lines 959-1206 (0-indexed: 958-1205)
let divOpens = 0, divCloses = 0;
let mDivOpens = 0, mDivCloses = 0;
let jsxExprOpen = 0, jsxExprClose = 0;
let inComment = false;

for (let i = 958; i <= 1205; i++) {
  const l = lines[i];
  if (!l) continue;
  
  divOpens += (l.match(/<div[ >]/g) || []).length;
  divCloses += (l.match(/<\/div>/g) || []).length;
  mDivOpens += (l.match(/<motion\.div[ >]/g) || []).length;
  mDivCloses += (l.match(/<\/motion\.div>/g) || []).length;
  
  // Count JSX expression brackets
  for (let j = 0; j < l.length; j++) {
    if (l[j] === '{' && l[j+1] !== '/') jsxExprOpen++;
    else if (l[j] === '}' && l[j-1] !== '*') {
      jsxExprClose++;
      // Remove JSX comment /*...*/ matches
    }
  }
  
  // Track line-by-line balance
  const net = divOpens + mDivOpens - divCloses - mDivCloses;
  if (net < 0) console.log('NEGATIVE at line', i + 1, 'net:', net, 'divOpens:', divOpens, 'divCloses:', divCloses, 'mDivOpens:', mDivOpens, 'mDivCloses:', mDivCloses);
}

console.log('Desktop section 959-1206:');
console.log('  <div> opens:', divOpens, 'closes:', divCloses, 'diff:', divOpens - divCloses);
console.log('  <motion.div> opens:', mDivOpens, 'closes:', mDivCloses, 'diff:', mDivOpens - mDivCloses);
console.log('  Combined net:', divOpens + mDivOpens - divCloses - mDivCloses);
