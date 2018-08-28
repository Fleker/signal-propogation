// This script will do some basic sanitization for each svg file
const fs = require('fs');

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

const sanitize = (svgFile) => {
    const {size} = fs.statSync(svgFile);
    let fileData = fs.readFileSync(svgFile, 'utf8');
    // Remove newlines
    fileData = fileData.replace(/\r\n/g, '');
    // Remove comments
    fileData = fileData.replace(/<!--(.|\n)+?-->/g, '');
    // Remove titles
    fileData = fileData.replace(/<title>.*<\/title>/g, '')
    // Remove any 'background' layers
    fileData = fileData.replace(/<g>\s*<title>background<\/title>(.|\n)+?<\/g>/g, '');
    // All of our fills and strokes are fully opaque
    fileData = fileData.replace(/stroke-opacity="null"/g, '');
    fileData = fileData.replace(/fill-opacity="null"/g, '');
    // If we have '0' for stroke, don't define its fill
    fileData = fileData.replace(/stroke-width="0" stroke=".+?"/g, '');
    // For all of our rectangles, truncate the height, width, x, y
    fileData = fileData.replace(/(<rect .* height="-?\d+)\.\d+"/g, '$1"');
    fileData = fileData.replace(/(<rect .* width="-?\d+)\.\d+"/g, '$1"');
    fileData = fileData.replace(/(<rect .* x="-?\d+)\.\d+"/g, '$1"');
    fileData = fileData.replace(/(<rect .* y="-?\d+)\.\d+"/g, '$1"');

    // Remove newlines after removing unnecessary lines
    fileData = fileData.replace(/\s*\n/gm, '');
    // Remove spaces between properties
    fileData = fileData.replace(/\s\s+/g, ' ');
    // Remove any remaining extra space
    fileData = fileData.replace(/>\s*</g, '><');

    const distFileName = `dist/${svgFile}`;
    fs.writeFileSync(distFileName, fileData.trim());
    const distSize = fs.statSync(distFileName).size;
    console.log(`Sanitized ${svgFile}. Reduced size from ${size}B to ${distSize}B`);
    console.log(`    -${size - distSize}B`)
    return size - distSize;
}

let totalBytesSaved = 0;
for (svg of svgs) {
    totalBytesSaved += sanitize(svg);
}
console.log(`This script removed ${totalBytesSaved} bytes`);