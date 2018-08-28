/**
 * Enigma.js -- A simple game engine for 2D puzzle games
 */

class EnigmaEngine {
    constructor (canvas, blockSize, debugLevel) {
        this.canvas = canvas;
        this.canvas.addEventListener('click', (event) => {
            const blockX = Math.floor(event.layerX / blockSize);
            const blockY = Math.floor(event.layerY / blockSize);
            this.log(1, `Clicked block ${blockX}, ${blockY}`)
            this.onclick(blockX, blockY);
        });
        this.ctx = canvas.getContext('2d');
        this.blockSize = blockSize;

        this.debugLevel = debugLevel || 0;
    }

    log (level, msg) {
        if (this.debugLevel >= level) {
            console.info(msg);
        }
    }

    start () {
        // Do something?
    }

    beginScene (map, imgList, onclick) {
        this.map = map;
        // Draw map
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] < 0) continue;
                this.log(1, `Draw ${imgList[map[y][x]]} at ${x}, ${y}`);
                this.renderImage(imgList[map[y][x]], x, y);
            }
        }
        this.onclick = onclick;
    }

    renderImage (filepath, blockX, blockY) {
        this.ctx.clearRect( this.blockSize * blockX, this.blockSize * blockY, this.blockSize, this.blockSize);
        // #298b50, #43d47c
        this.ctx.fillStyle = '#37c972'; // ~ PCB Green w/ alpha
        this.ctx.fillRect( this.blockSize * blockX, this.blockSize * blockY, this.blockSize, this.blockSize);
        const img = new Image();
        img.onload = () => {
            this.ctx.drawImage(img, this.blockSize * blockX, this.blockSize * blockY);
        }
        img.src = filepath;
    }

    clearScene () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setSceneTitle (title) {
        this.ctx.clearRect(0, 67, this.canvas.width, 70);
        this.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.ctx.fillRect(0, 77, this.canvas.width, 50);
        this.ctx.strokeStyle = '#09f';
        this.ctx.strokeRect(0, 77, this.canvas.width, 50);

        this.ctx.fillStyle = 'rgb(64, 64, 64)';
        this.ctx.font = '30px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, 110);
    }

    setSceneNext (onclick) {
        this.ctx.clearRect(this.canvas.width / 2 - 30, 182, 60, 34);
        this.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.ctx.fillRect(this.canvas.width / 2 - 30, 182, 60, 34);
        this.ctx.strokeStyle = '#09f';
        this.ctx.strokeRect(this.canvas.width / 2 - 30, 182, 60, 34);

        this.ctx.fillStyle = 'rgb(64, 64, 64)';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GO', this.canvas.width / 2, 202);
        this.onclick = onclick;
    }
}

module.exports = {
    EnigmaEngine
}