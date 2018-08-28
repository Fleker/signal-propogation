const {EnigmaEngine} = require('./enigma');
const blockSize = 64; // 64 x 64 pixels

const canvas = document.getElementById('game-window');
const enigma = new EnigmaEngine(canvas, blockSize, 5);

let sceneState = []

const beginScene = (scene) => {
    // First-pass: Construct all of our objects
    for (let y = 0; y < scene.length; y++) {
        sceneState[y] = [];
        for (let x = 0; x < scene[y].length; x++) {
            const blockIndex = scene[y][x];
            if (blockIndex < 0) {
                sceneState[y][x] = undefined;
                continue;
            };
            const classname = blockList[blockIndex];
            const block = new classname(x, y);
            sceneState[y][x] = block;
            window.requestAnimationFrame(() => {
                block.init()
            })
        }
    }
    // Second-pass: Initialize the game interactions
    /*for (let y = 0; y < scene.length; y++) {
        for (let x = 0; x < scene[y].length; x++) {
            const blockIndex = scene[y][x];
            if (blockIndex < 0) {
                continue;
            };
            sceneState[y][x].init();
        }
    }*/
}

const finishScene = () => {
    if (scenes.length == ++sceneIndex) {
        enigma.setSceneTitle('You completed every puzzle! Congratulations!')
        return;
    }
    enigma.setSceneTitle(scenes[sceneIndex].title);
    enigma.setSceneNext(() => {
        sceneState = []
        scene = scenes[sceneIndex].map;
        enigma.clearScene();
        enigma.beginScene(scenes[sceneIndex].map, imgList, (x, y) => {
            sceneState[y][x].onclick()
        });
        beginScene(scenes[sceneIndex].map);
    });
}

const LEFT = 0;
const TOP = 1;
const RIGHT = 2;
const BOTTOM = 3;

class Component {
    constructor (posX, posY) {
        this.x = posX;
        this.y = posY;
        this.inputs = [
            false,
            false,
            false,
            false
        ]
        this.outputs = [
            false,
            false,
            false,
            false
        ]
    }

    onclick() {}

    init() {
        this.activate();
    }

    activate() {}

    getNeighborSignal(index) {
        console.log(`At ${this.x}, ${this.y}, check ${index}`);
        console.log(sceneState)
        if (index == LEFT && this.x == 0) {
            return sceneState[this.y][this.x].outputs[LEFT];
        } else if (index == TOP && this.y == 0) {
            return sceneState[this.y][this.x].outputs[TOP];
        } else if (index == RIGHT && this.x == scene[this.y].length) {
            return sceneState[this.y][this.x].outputs[RIGHT];
        } else if (index == BOTTOM && this.y == scene.length) {
            return sceneState[this.y][this.x].outputs[BOTTOM];
        } else {
            if (index == LEFT) {
                if (scene[this.y][this.x - 1] == -1) {
                    return sceneState[this.y][this.x].outputs[LEFT]
                } 
                return sceneState[this.y][this.x - 1].outputs[RIGHT];
            } else if (index == TOP) {
                if (scene[this.y - 1][this.x ] == -1) {
                    return sceneState[this.y][this.x].outputs[TOP]
                } 
                return sceneState[this.y - 1][this.x].outputs[BOTTOM];
            } else if (index == RIGHT) {
                if (scene[this.y][this.x + 1] == -1) {
                    return sceneState[this.y][this.x].outputs[RIGHT]
                } 
                return sceneState[this.y][this.x + 1].outputs[LEFT];
            } else if (index == BOTTOM) {
                if (scene[this.y + 1][this.x] == -1) {
                    return sceneState[this.y][this.x].outputs[BOTTOM]
                }
                return sceneState[this.y + 1][this.x].outputs[TOP];
            }
        }
    }

    activateNeighbor(index) {
        if (index == LEFT && this.x == 0) {
            return false;
        } else if (index == TOP && this.y == 0) {
            return false;
        } else if (index == RIGHT && this.x == scene[this.y].length) {
            return false;
        } else if (index == BOTTOM && this.y == scene.length) {
            return false;
        } else {
            if (index == LEFT) {
                enigma.log(2, `Activate component ${this.y}, ${this.x - 1}, ${this.constructor.name}`)
                sceneState[this.y][this.x - 1].activate(RIGHT);
            } else if (index == TOP) {
                enigma.log(2, `Activate component ${this.y - 1}, ${this.x}, ${this.constructor.name}`)
                sceneState[this.y - 1][this.x].activate(BOTTOM);
            } else if (index == RIGHT) {
                enigma.log(2, `Activate component ${this.y}, ${this.x + 1}, ${this.constructor.name}`)
                sceneState[this.y][this.x + 1].activate(LEFT);
            } else if (index == BOTTOM) {
                enigma.log(2, `Activate component ${this.y + 1}, ${this.x}, ${this.constructor.name}`)
                sceneState[this.y + 1][this.x].activate(TOP);
            }
        }
    }
}

class Battery extends Component {
    init() {
        this.outputs[TOP] = true;
        // Update top
        this.activateNeighbor(TOP);
    }
}

class WireV extends Component {
    init() {}
    activate(source) {
        const neighborSignal = this.getNeighborSignal(source);
        console.log("WireV", neighborSignal, this.outputs[TOP], this.outputs[BOTTOM])
        if ((neighborSignal) && !this.outputs[TOP] && !this.outputs[BOTTOM]) {
            this.outputs[BOTTOM] = true;
            this.outputs[TOP] = true;
            enigma.renderImage('assets/wire-v-on.svg', this.x, this.y);
            this.activateNeighbor(BOTTOM);
            this.activateNeighbor(TOP);
        } else if (!neighborSignal && (this.outputs[TOP] || this.outputs[BOTTOM])) {
            this.outputs[BOTTOM] = false;
            this.outputs[TOP] = false;
            enigma.renderImage('assets/wire-v-off.svg', this.x, this.y);
            this.activateNeighbor(BOTTOM);
            this.activateNeighbor(TOP);
        }
    }
}

class WireH extends Component {
    init() {}
    activate(source) {
        const neighborSignal = this.getNeighborSignal(source);
        console.log("WireH", source, neighborSignal, this.outputs[LEFT], this.outputs[RIGHT])
        if (neighborSignal && !this.outputs[RIGHT] && !this.outputs[LEFT]) {
            this.outputs[RIGHT] = true;
            this.outputs[LEFT] = true;
            enigma.renderImage('assets/wire-h-on.svg', this.x, this.y);
            console.log('WireH change1, activate neighbor', this.x, this.y)
            this.activateNeighbor(LEFT);
            this.activateNeighbor(RIGHT);
        } else if (!neighborSignal && this.outputs[RIGHT] && this.outputs[LEFT]) {
            this.outputs[RIGHT] = false;
            this.outputs[LEFT] = false;
            enigma.renderImage('assets/wire-h-off.svg', this.x, this.y);
            // console.log('WireH change, activate neighbor')
            this.activateNeighbor(LEFT);
            this.activateNeighbor(RIGHT);
        }
    }
}

class WireTL extends Component {
    activate() {
        // Check right & bottom
        const bottom = this.getNeighborSignal(BOTTOM);
        if (bottom && !this.outputs[BOTTOM]) {
            this.outputs[BOTTOM] = true;
            this.outputs[RIGHT] = true;
            enigma.renderImage('assets/wire-tl-on.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
            this.activateNeighbor(BOTTOM);
        } else if (!bottom && this.outputs[BOTTOM]) {
            this.outputs[BOTTOM] = false;
            this.outputs[RIGHT] = false;
            enigma.renderImage('assets/wire-tl-off.svg', this.x, this.y);
            this.activateNeighbor(BOTTOM);
        }
    }
}

class WireT_L extends Component {
    activate(source) {
        if (source === undefined) return;
        const neighborSignal = this.getNeighborSignal(source);
        console.log('WireT_L', source, neighborSignal, this.outputs);
        if ((neighborSignal) && !this.outputs[TOP] && !this.outputs[RIGHT] && !this.outputs[BOTTOM]) {
            this.outputs[BOTTOM] = true;
            this.outputs[TOP] = true;
            this.outputs[RIGHT] = true;
            enigma.renderImage('assets/wire-t-l-on.svg', this.x, this.y);
            this.activateNeighbor(BOTTOM);
            this.activateNeighbor(TOP);
            this.activateNeighbor(RIGHT);
        } else if (!neighborSignal && (this.outputs[TOP] || this.outputs[RIGHT] || this.outputs[BOTTOM])) {
            this.outputs[BOTTOM] = false;
            this.outputs[TOP] = false;
            this.outputs[RIGHT] = false;
            enigma.renderImage('assets/wire-t-l-off.svg', this.x, this.y);
            this.activateNeighbor(BOTTOM);
            this.activateNeighbor(TOP);
            this.activateNeighbor(RIGHT);
        }
    }
}

class WireTR extends Component {
    activate() {
        // Check right & bottom
        const left = this.getNeighborSignal(LEFT);
        console.log('WireTR', left, this.outputs[LEFT])
        if (left && !this.outputs[LEFT] && !this.outputs[BOTTOM]) {
            this.outputs[BOTTOM] = true;
            this.outputs[LEFT] = true;
            enigma.renderImage('assets/wire-tr-on.svg', this.x, this.y);
            this.activateNeighbor(LEFT);
            this.activateNeighbor(BOTTOM);
        } else if (!left && this.outputs[LEFT] && this.outputs[BOTTOM]) {
            this.outputs[BOTTOM] = false;
            this.outputs[LEFT] = false;
            enigma.renderImage('assets/wire-tr-off.svg', this.x, this.y);
            this.activateNeighbor(LEFT);
            this.activateNeighbor(BOTTOM);
        }
    }
}

class WireBL extends Component {
    activate(src) {
        // Check right & bottom
        const neighbor = this.getNeighborSignal(src);
        if (neighbor && !this.outputs[TOP] && !this.outputs[RIGHT]) {
            this.outputs[RIGHT] = true;
            this.outputs[TOP] = true;
            enigma.renderImage('assets/wire-bl-on.svg', this.x, this.y);
            this.activateNeighbor(TOP);
            this.activateNeighbor(RIGHT);
        } else if (!neighbor && this.outputs[TOP] && this.outputs[RIGHT]) {
            this.outputs[RIGHT] = false;
            this.outputs[TOP] = false;
            enigma.renderImage('assets/wire-bl-off.svg', this.x, this.y);
            this.activateNeighbor(TOP);
            this.activateNeighbor(RIGHT);
        }
    }
}

class WireBR extends Component {
    activate(src) {
        // Check right & bottom
        const neighbor = this.getNeighborSignal(src);
        if (neighbor && !this.outputs[LEFT] && !this.outputs[TOP]) {
            this.outputs[LEFT] = true;
            this.outputs[TOP] = true;
            enigma.renderImage('assets/wire-br-on.svg', this.x, this.y);
            this.activateNeighbor(LEFT);
            this.activateNeighbor(TOP);
        } else if (!neighbor && this.outputs[LEFT] && this.outputs[TOP]) {
            this.outputs[LEFT] = false;
            this.outputs[TOP] = false;
            enigma.renderImage('assets/wire-br-off.svg', this.x, this.y);
            this.activateNeighbor(LEFT);
            this.activateNeighbor(TOP);
        }
    }
}

class Load extends Component {
    activate() {
        console.log('Activate Load');
        const left = this.getNeighborSignal(LEFT);
        if (left && !this.outputs[LEFT]) {
            this.outputs[LEFT] = true;
            // Give everything a second to settle
            setTimeout((load) => {
                console.log('Checking win state...');
                if (load.outputs[LEFT]) {
                    console.log('You Win!');
                    finishScene();
                } else {
                    this.outputs[LEFT] = false;
                    enigma.renderImage('assets/led-off.svg', this.x, this.y);
                }
            }, 100, this);
            enigma.renderImage('assets/led-on.svg', this.x, this.y);
        } else {
            this.outputs[LEFT] = false;
            enigma.renderImage('assets/led-off.svg', this.x, this.y);
        }
    }
}

class Ground extends Component {}

class Switch extends Component {
    init() {
        this.switch = false;
    }

    onclick() {
        this.switch = !this.switch;
        if (this.outputs[RIGHT]) {
            enigma.renderImage(this.switch ? 'assets/switch-on.svg' : 'assets/switch-off.svg', this.x, this.y);
        } else {
            enigma.renderImage(this.switch ? 'assets/switch-on.svg' : 'assets/switch-off.svg', this.x, this.y);
        }
        this.activate();
        this.activateNeighbor(LEFT);
        this.activateNeighbor(RIGHT);
    }

    activate(src) {
        if (!this.switch) {
            this.outputs[LEFT] = false;
            this.outputs[RIGHT] = false;
            this.activateNeighbor(LEFT);
            this.activateNeighbor(RIGHT);
            return;
        }
        // Check left & right
        const left = src ? this.getNeighborSignal(src) : true;
        console.log('Switch', left, this.outputs[RIGHT]);
        if (left && !this.outputs[RIGHT] && !this.outputs[LEFT]) {
            this.outputs[LEFT] = true;
            this.outputs[RIGHT] = true;
            enigma.renderImage(this.switch ? 'assets/switch-on.svg' : 'assets/switch-off.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
            this.activateNeighbor(LEFT);
        } else if (!left && this.outputs[RIGHT] && this.outputs[LEFT]) {
            this.outputs[LEFT] = false;
            this.outputs[RIGHT] = false;
            enigma.renderImage(this.switch ? 'assets/switch-on.svg' : 'assets/switch-off.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
            this.activateNeighbor(LEFT);
        }
    }
}

class EnabledSwitch extends Switch {
    init() {
        super.init();
        this.switch = true;
    }
}

class Nor extends Component {
    activate() {
        const left = this.getNeighborSignal(LEFT);
        const top = this.getNeighborSignal(TOP);
        console.log('Nor', left, top, this.outputs[RIGHT]);
        if (!(left || top) && !this.outputs[RIGHT]) {
            this.outputs[RIGHT] = true;
            enigma.renderImage('assets/nor-on.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        } else if ((left || top) && this.outputs[RIGHT]) {
            this.outputs[RIGHT] = false;
            enigma.renderImage('assets/nor-off.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        }
    }
}

class Or extends Component {
    activate() {
        const left = this.getNeighborSignal(LEFT);
        const top = this.getNeighborSignal(TOP);
        console.log('Or', left, top, this.outputs[RIGHT]);
        if ((left || top) && !this.outputs[RIGHT]) {
            this.outputs[RIGHT] = true;
            enigma.renderImage('assets/or-on.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        } else if (!(left || top) && this.outputs[RIGHT]) {
            this.outputs[RIGHT] = false;
            enigma.renderImage('assets/or-off.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        }
    }
}

class Xor extends Component {
    init() {}
    activate() {
        const left = this.getNeighborSignal(LEFT);
        const top = this.getNeighborSignal(TOP);
        console.log('Xor', left, top, this.outputs[RIGHT]);
        if (!!(left ^ top) && !this.outputs[RIGHT]) {
            console.log('Xor on');
            this.outputs[RIGHT] = true;
            // TODO render in-place
            enigma.renderImage('assets/xor-on.svg', this.x, this.y);
            // this.activateNeighbor(RIGHT);
        } else if (!(left ^ top) && this.outputs[RIGHT]) {
            console.log('Xor off');
            this.outputs[RIGHT] = false;
            enigma.renderImage('assets/xor-off.svg', this.x, this.y);
            // this.activateNeighbor(RIGHT);
        }
        this.activateNeighbor(RIGHT);
    }
}

class Nand extends Component {
    activate() {
        const left = this.getNeighborSignal(LEFT);
        const top = this.getNeighborSignal(TOP);
        console.log('Nand', left, top, this.outputs[RIGHT]);
        if (!(left && top) && !this.outputs[RIGHT]) {
            this.outputs[RIGHT] = true;
            enigma.renderImage('assets/nand-on.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        } else if ((left && top) && this.outputs[RIGHT]) {
            this.outputs[RIGHT] = false;
            enigma.renderImage('assets/nand-off.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        }
    }
}

class And extends Component {
    activate() {
        const left = this.getNeighborSignal(LEFT);
        const top = this.getNeighborSignal(TOP);
        console.log('And', left, top, this.outputs[RIGHT]);
        if ((left && top) && !this.outputs[RIGHT]) {
            this.outputs[RIGHT] = true;
            enigma.renderImage('assets/and-on.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        } else if (!(left && top) && this.outputs[RIGHT]) {
            this.outputs[RIGHT] = false;
            enigma.renderImage('assets/and-off.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        }
    }
}

class BufferGate extends Component {
    activate() {
        const left = this.getNeighborSignal(LEFT);
        if (left && !this.outputs[RIGHT]) {
            this.outputs[RIGHT] = true;
            enigma.renderImage('assets/buffer-on.svg', this.x, this.y);
            this.activateNeighbor(RIGHT);
        }
    }
}

class Not extends Component {
    init() {}
    activate() {
        const left = this.getNeighborSignal(LEFT);
        console.log('Not', left, this.outputs[RIGHT]);
        if (!left && !this.outputs[RIGHT]) {
            this.outputs[RIGHT] = true;
            enigma.renderImage('assets/not-on.svg', this.x, this.y);
            // this.activateNeighbor(RIGHT);
        } else if (left && this.outputs[RIGHT]) {
            this.outputs[RIGHT] = false;
            enigma.renderImage('assets/not-off.svg', this.x, this.y);
        }
        this.activateNeighbor(RIGHT);
    }
}

let blockList = [
    Battery, // 0
    WireV,   // 1
    WireTL,  // 2
    Load,    // 3
    Switch,  // 4
    WireH,   // 5
    WireTR,  // 6
    WireBL,  // 7
    WireBR,  // 8
    Ground,  // 9
    Nor, // 10
    EnabledSwitch, // 11
    Or, // 12,
    Nand, // 13
    And, // 14
    BufferGate, // 15
    Not, // 16
    WireT_L, // 17
    Xor, // 18
];

let imgList = [
    'assets/vcc.svg',
    'assets/wire-v-off.svg',
    'assets/wire-tl-off.svg',
    'assets/led-off.svg',
    'assets/switch-off.svg',
    'assets/wire-h-off.svg',
    'assets/wire-tr-off.svg',
    'assets/wire-bl-off.svg',
    'assets/wire-br-off.svg',
    'assets/ground.svg',
    'assets/nor-off.svg',
    'assets/switch-on.svg',
    'assets/or-off.svg',
    'assets/nand-off.svg',
    'assets/and-off.svg',
    'assets/buffer-off.svg',
    'assets/not-off.svg',
    'assets/wire-t-l-off.svg',
    'assets/xor-off.svg',
]

const _ = -1;

const scene0 = [
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, 2,  5,  6,  _,  _,  _,  _,  _,  _],
    [ _, 1,  _,  1,  _,  _,  _,  _,  _,  _],
    [ _, 0,  _,  7,  5,  4,  5,  4,  5,  3],
    [ _, 1,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, 1,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, 9,  _,  _,  _,  _,  _,  _,  _,  _],
];

const scene1 = [
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _,  2, 11,  6,  _,  _,  _,  _,  _,  _],
    [ _,  0,  _,  1,  _,  _,  _,  _,  _,  _],
    [ _,  1,  2, 10,  5,  5,  4,  5,  3,  _],
    [ _,  9,  9,  _,  _,  _,  _,  _,  _,  _],
    // [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    // [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const scene2 = [
    [ _,  _,  _,  _,  _,  _,  2,  6,  _,  _],
    [ _,  _,  _,  _,  _,  _,  9,  1,  _,  _],
    [ _,  2,  4,  6,  _,  _,  _,  1,  _,  _],
    [ _,  0,  2, 10, 4,  5,  5, 12,  4,  3],
    [ _,  1,  1,  _,  _,  _,  _,  _,  _,  _],
    [ _,  1,  1,  _,  _,  _,  _,  _,  _,  _],
    [ _,  9,  1,  _,  _,  _,  _,  _,  _,  _],
    [ _,  _,  9,  _,  _,  _,  _,  _,  _,  _],
];

const scene3 = [
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 2, 4,  5,  6,  _,  _,  _,  _,  _,  _],
    [ 1, _,  2, 14,  5, 15,  4,  6,  _,  _],
    [ 1, _,  1,  _,  _,  _,  _,  1,  _,  _],
    [ 0, _,  1,  _,  _,  _,  _,  1,  _,  _],
    [ 9, _,  1,  _,  _,  _,  _,  1,  _,  _],
    [ _, _,  1,  _,  _,  _,  _,  7,  3,  _],
    [ 2, 4,  8,  _,  _,  _,  _,  _,  _,  _],
    [ 0, _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 9, _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const scene4 = [
    [ 2, 5, 11,  6,  _,  _,  _,  _,  _,  _],
    [ 0, 2,  4, 12,  5, 16,  6,  _,  _,  _],
    [ 9, 1,  _,  _,  _,  _,  1,  _,  _,  _],
    [ 2, 8,  _,  _,  _,  _,  1,  _,  _,  _],
    [ 0, _,  _,  _,  _,  _,  7, 15,  4,  6],
    [ 9, _,  _,  _,  _,  _,  _,  _,  _,  1],
    [ 2, 5,  5,  5,  5,  5,  4,  5,  5,  14, 5, 3],
    [ 0, _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 9, _,  _,  _,  _,  _,  _,  _,  _,  _],
    // [ _, _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const scene5 = [
    [ 2, 4,  6,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 0, _,  1,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 1, _, 17,  4,  5,  6,  _,  _,  _,  _,  _,  _],
    [ 9, _,  1,  _,  _,  1,  _,  _,  _,  _,  _,  _],
    [ _, _, 17, 16, 15, 14,  5, 15,  6,  _,  _,  _],
    [ _, _,  1,  _,  _,  _,  _,  _,  1,  _,  _,  _],
    [ _, _, 17, 16, 16,  6,  2,  5, 14,  5, 11,  3],
    [ _, _,  1,  _,  _,  1,  1,  _,  _,  _,  _,  _],
    [ _, _,  7,  5,  5, 10,  8,  _,  _,  _,  _,  _],
    // [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

// , {
    // title: 'Not big enough for the two of us',
    // map: scene6
// }
/*const xorscene = [
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 2, 5, 15,  6,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 0, _,  _,  1,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 9, _,  _,  1,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 2, 5,  5, 12,  6,  _,  _,  _,  _,  _,  _,  _],
    [ 0, _,  _,  _, 17, 11, 15,  4,  5,  5,  6,  _],
    [ 9, _,  _,  _,  1,  _,  _,  _,  _,  _,  1,  _],
    [ _, _,  _,  _,  1,  _,  _,  _,  _,  _,  1,  _],
    [ _, _,  _,  _,  7,  4, 16, 11,  5,  5, 14,  3],
]*/

const xortest = [
    [ 2, 5, 11,  6,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 0, _,  _,  1,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 9, _,  _,  1,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 2, 5,  4, 18,  5,  6,],
    [ 0, _,  _,  _,  _, 17,  4,  5,  6,  _,  _,],
    [ 9, _,  _,  _,  _, 17, 16,  4, 18,  6,  _,  _],
    [ _, _,  _,  _,  _,  1,  _,  _,  _,  1,  _,  _],
    [ _, _,  _,  _,  _,  1,  _,  _,  _,  1,  _,  _],
    [ _, _,  _,  _,  _,  1,  _,  _,  _,  1,  _,  _],
    [ _, _,  _,  _,  _,  7,  4, 16,  4, 14,  5,  3],
]

const scene7 = [
    [ _, _,  _,  _,  _,  2,  6,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  2,  8,  1,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  1,  _, 17, 15,  6,  _,  _,  _],
    [ _, _,  _,  2,  8,  _,  1,  _,  9,  _,  _,  _],
    [ _, _,  2,  8,  _,  _, 17, 11, 16,  6,  _,  _],
    [ _, 2,  8,  _,  _,  _,  1,  _,  _,  1,  _,  _],
    [ 2, 8,  _,  _,  _,  _, 17,  4, 15, 14,  6,  _],
    [ 0, _,  _,  _,  _,  _,  1,  _,  _,  _,  1,  _],
    [ 1, _,  _,  _,  _,  _,  7, 15,  6,  2, 12,  3],
    [ 9, _,  _,  _,  _,  _,  _,  _,  9,  9,  _,  _],
]

const scene8 = [
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 2, 5, 11, 16,  5,  5, 15,  5,  5,  5,  6,  _],
    [ 1, _,  _,  _,  _,  _,  _,  _,  _,  _,  1,  _],
    [ 1, _,  2,  5,  4, 16,  5,  5,  6,  _,  1,  _],
    [ 0, _,  1,  _,  _,  _,  _,  _,  1,  _,  1,  _],
    [ 1, _,  1,  _,  2, 16,  5,  3,  1,  _,  1,  _],
    [ 9, _,  1,  _,  7,  5,  5,  4,  8,  _,  1,  _],
    [ _, _,  1,  _,  _,  _,  _,  _,  _,  _,  1,  _],
    [ _, _,  7,  5,  5,  5,  5,  5,  5,  5,  8,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]

const demos = [
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 2, 4,  5,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ 0, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]

/*
const emptyScene = [
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _, _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]
*/

let sceneIndex = 7;
const scenes = [
    {
        title: 'Demo',
        map: scene0,
    }, {
        title: 'Signal Propogation',
        map: scene1
    }, {
        title: 'OR Maybe Something Different',
        map: scene2
    }, {
        title: 'AND now try this one',
        map: scene3
    }, {
        title: 'Do NOT try this at home',
        map: scene4
    }, {
        title: 'Tea Time',
        map: scene5
    }, {
        title: 'This signal\'s not big enough for the two of us',
        map: xortest
    }, {
        title: 'Level 7',
        map: scene7
    },
]

/*
{
    title: 'Circular Logic',
    map: scene8
}, {
    title: 'aaa',
    map: demos
}
*/
let scene = scenes[sceneIndex].map;

window.addEventListener('load', () => {
    // Start game engine
    enigma.start();
    // window.requestAnimationFrame(() => {
        enigma.beginScene(scenes[sceneIndex].map, imgList, (x, y) => {
            sceneState[y][x].onclick()
        });
        beginScene(scenes[sceneIndex].map);
    // })

    console.info('Game started!');
});