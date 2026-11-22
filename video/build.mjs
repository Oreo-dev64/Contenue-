import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync('src.html', 'utf8');
s = s.replace(/url\(fonts\/([\w.]+)\)/g, (_, f) => `url(data:font/woff2;base64,${readFileSync('fonts/' + f).toString('base64')})`);
writeFileSync('kevin.html', s); console.log('kevin.html', s.length);
