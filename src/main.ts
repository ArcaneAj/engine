import { State } from './models/state';

console.log('Engine started');
const canvas = document.getElementById('screen') as HTMLCanvasElement;

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
}

window.addEventListener('resize', resize);
resize();

const state = new State(canvas);
let lastTime = 0;

function loop(currentTime: number) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    state.update(deltaTime);
    state.render();
    requestAnimationFrame(loop);
}
loop(0);
