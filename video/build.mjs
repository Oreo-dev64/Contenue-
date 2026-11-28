// node build.mjs [src.html out.html]  — inline lib.js, polices, images assets/, timings words/*.json
import { readFileSync, writeFileSync } from 'node:fs';
const [, , src = 'src.html', out = 'kevin.html'] = process.argv;
let s = readFileSync(src, 'utf8');
s = s.replace(/<script src="three\.min\.js"><\/script>/, () => `<script>\n${readFileSync('vendor/node_modules/three/build/three.min.js', 'utf8')}\n</script>`);
s = s.replace(/<script src="lib\.js"><\/script>/, () => `<script>\n${readFileSync('lib.js', 'utf8')}\n</script>`);
s = s.replace(/url\(fonts\/([\w.]+)\)/g, (_, f) => `url(data:font/woff2;base64,${readFileSync('fonts/' + f).toString('base64')})`);
s = s.replace(/"assets\/([\w.-]+\.(png|jpe?g))"/g, (_, f, ext) => `"data:image/${ext === 'png' ? 'png' : 'jpeg'};base64,${readFileSync('assets/' + f).toString('base64')}"`);
s = s.replace(/WORDS_JSON\("([\w-]+)"\)/g, (_, n) => JSON.stringify(JSON.parse(readFileSync(`words/${n}.json`, 'utf8')).words.filter(w => w.type === 'word').map(w => [w.text, w.start, w.end])));
writeFileSync(out, s); console.log(out, s.length);
