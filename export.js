const zip = new require('node-zip')();
const fs = require('fs');

const addToZip = (path) => {
    const file = fs.readFileSync(`dist/${path}`);
    zip.file(path, file);
}

addToZip('index.html');

addToZip('src/index.js');
addToZip('src/enigma.js');

const svgs = [
    'assets/and-off.svg',
    'assets/and-on.svg',
    'assets/bg.svg',
    'assets/buffer-off.svg',
    'assets/buffer-on.svg',
    'assets/ground.svg',
    'assets/led-off.svg',
    'assets/led-on.svg',
    'assets/nand-off.svg',
    'assets/nand-on.svg',
    'assets/not-off.svg',
    'assets/not-on.svg',
    'assets/nor-off.svg',
    'assets/nor-on.svg',
    'assets/or-off.svg',
    'assets/or-on.svg',
    'assets/switch-off.svg',
    'assets/switch-on.svg',
    'assets/vcc.svg',
    'assets/wire-bl-off.svg',
    'assets/wire-bl-on.svg',
    'assets/wire-br-off.svg',
    'assets/wire-br-on.svg',
    'assets/wire-h-off.svg',
    'assets/wire-h-on.svg',
    'assets/wire-tl-off.svg',
    'assets/wire-tl-on.svg',
    'assets/wire-t-l-off.svg',
    'assets/wire-t-l-on.svg',
    'assets/wire-tr-off.svg',
    'assets/wire-tr-on.svg',
    'assets/wire-v-off.svg',
    'assets/wire-v-on.svg',
    'assets/xor-off.svg',
    'assets/xor-on.svg',
];
for (svg of svgs) {
    addToZip(svg);
}

const data = zip.generate({base64:false, compression:'DEFLATE'});
fs.writeFileSync('signal-propogation.zip', data, 'binary');

const {size} = fs.statSync('signal-propogation.zip');

console.log(`The zipped project is ${size} bytes`);
console.log(`${size} / 13312 = ${Math.round(100 * size / 13312)}% of storage budget`);