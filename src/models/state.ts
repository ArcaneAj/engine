import type { IDynamic } from '../interfaces/dynamic.interface';
import { Mesh } from './mesh';

export class State implements IDynamic {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;

    dynamicChildren: IDynamic[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    async init(): Promise<void> {
        const mesh = new Mesh([], [], []);
        await mesh.load('cow.obj');
        this.dynamicChildren.push(mesh);
    }

    update(deltaTime: number): void {
        // Update state logic here
        for (const child of this.dynamicChildren) {
            child.update(deltaTime);
        }
    }

    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const child of this.dynamicChildren) {
            child.render(this.ctx);
        }
    }
}
