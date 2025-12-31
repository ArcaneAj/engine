import type { IDynamic } from '../interfaces/dynamic.interface';
import { Mesh } from './mesh';
import { Inputs } from './inputs';

export class State implements IDynamic {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    inputs: Inputs;

    dynamicChildren: IDynamic[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.inputs = new Inputs(
            false,
            false,
            false,
            false,
            false,
            false,
            false
        );
        this.setupInputListeners();
    }

    private setupInputListeners(): void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (key === 'x') this.inputs.x = true;
            if (key === 'y') this.inputs.y = true;
            if (key === 'z') this.inputs.z = true;
            if (key === 'r') this.inputs.r = true;
            if (key === 'control') this.inputs.control = true;
            if (key === 'shift') this.inputs.shift = true;
            if (key === 'alt') this.inputs.alt = true;
        });

        window.addEventListener('keyup', (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (key === 'x') this.inputs.x = false;
            if (key === 'y') this.inputs.y = false;
            if (key === 'z') this.inputs.z = false;
            if (key === 'r') this.inputs.r = false;
            if (key === 'control') this.inputs.control = false;
            if (key === 'shift') this.inputs.shift = false;
            if (key === 'alt') this.inputs.alt = false;
        });
    }

    async init(): Promise<void> {
        const teapot = new Mesh([], []);
        await teapot.load('cube.obj');
        teapot.translateY(-5);
        teapot.translateZ(10);
        this.dynamicChildren.push(teapot);
    }

    update(deltaTime: number): void {
        // Update state logic here
        for (const child of this.dynamicChildren) {
            child.update(deltaTime, this.inputs);
        }
    }

    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const child of this.dynamicChildren) {
            child.render(this.ctx);
        }
    }
}
