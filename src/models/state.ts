import type { IDynamic } from '../interfaces/dynamic.interface';
import { Mesh } from './mesh';
import { Point } from './point';

export class State implements IDynamic {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;

    dynamicChildren: IDynamic[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.dynamicChildren.push(
            new Mesh(
                [
                    new Point(0.5, 0.5, 2.5),
                    new Point(-0.5, 0.5, 2.5),
                    new Point(-0.5, -0.5, 2.5),
                    new Point(0.5, -0.5, 2.5),

                    new Point(0.5, 0.5, 1.5),
                    new Point(-0.5, 0.5, 1.5),
                    new Point(-0.5, -0.5, 1.5),
                    new Point(0.5, -0.5, 1.5),
                ],
                [
                    [0, 1],
                    [1, 2],
                    [2, 3],
                    [3, 0],

                    [4, 5],
                    [5, 6],
                    [6, 7],
                    [7, 4],

                    [0, 4],
                    [1, 5],
                    [2, 6],
                    [3, 7],
                ],
                [
                    [0, 1, 2],
                    [2, 3, 0],
                    [4, 5, 6],
                    [6, 7, 4],
                    [0, 4, 5],
                    [5, 1, 0],
                    [1, 5, 6],
                    [6, 2, 1],
                    [2, 6, 7],
                    [7, 3, 2],
                    [3, 7, 4],
                    [4, 0, 3],
                ]
            )
        );
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
