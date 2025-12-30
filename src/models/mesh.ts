import type { IDynamic } from '../interfaces/dynamic.interface';
import type { ITranslatable } from '../interfaces/geometry.interface';
import type { Point } from './point';

export class Mesh implements IDynamic, ITranslatable {
    points: Point[];
    edges: number[][];
    triangles: number[][];
    fillStyle: string;
    private elapsedTime: number = 0;

    private SpectraPerSecond = 0.5;
    private opacity = 0.5;

    constructor(
        points: Point[],
        edges: number[][],
        triangles: number[][],
        fillStyle: string = 'rgba(0, 0, 255, 0.5)'
    ) {
        this.points = points;
        this.edges = edges;
        this.triangles = triangles;
        this.fillStyle = fillStyle;
    }

    update(deltaTime: number): void {
        this.elapsedTime += deltaTime;
        this.rotateY(deltaTime * Math.PI);

        // Update fill style based on elapsed time
        const hue = (this.elapsedTime * this.SpectraPerSecond * 360) % 360;
        this.fillStyle = `hsla(${hue}, 100%, 50%, ${this.opacity})`;
        // this.translateZ(deltaTime);
    }

    render(ctx: CanvasRenderingContext2D) {
        for (const edge of this.edges) {
            const point1 = this.points[edge[0]];
            const point2 = this.points[edge[1]];
            this.drawLine(ctx, point1, point2);
        }

        for (const triangle of this.triangles) {
            const point1 = this.points[triangle[0]];
            const point2 = this.points[triangle[1]];
            const point3 = this.points[triangle[2]];
            this.drawTriangle(ctx, point1, point2, point3);
        }
    }

    drawTriangle(
        ctx: CanvasRenderingContext2D,
        point1: Point,
        point2: Point,
        point3: Point
    ) {
        const screenPoint1 = point1.toScreen(
            ctx.canvas.width,
            ctx.canvas.height
        );
        const screenPoint2 = point2.toScreen(
            ctx.canvas.width,
            ctx.canvas.height
        );
        const screenPoint3 = point3.toScreen(
            ctx.canvas.width,
            ctx.canvas.height
        );

        ctx.fillStyle = this.fillStyle;
        ctx.beginPath();
        ctx.moveTo(screenPoint1.x, screenPoint1.y);
        ctx.lineTo(screenPoint2.x, screenPoint2.y);
        ctx.lineTo(screenPoint3.x, screenPoint3.y);
        ctx.closePath();
        ctx.fill();
    }

    drawLine(
        ctx: CanvasRenderingContext2D,
        point1: Point,
        point2: Point
    ): void {
        const screenPoint1 = point1.toScreen(
            ctx.canvas.width,
            ctx.canvas.height
        );
        const screenPoint2 = point2.toScreen(
            ctx.canvas.width,
            ctx.canvas.height
        );

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenPoint1.x, screenPoint1.y);
        ctx.lineTo(screenPoint2.x, screenPoint2.y);
        ctx.stroke();
    }

    drawPoint(ctx: CanvasRenderingContext2D, point: Point, size: number): void {
        const screenPoint = point.toScreen(ctx.canvas.width, ctx.canvas.height);
        const halfSize = size / 2;
        ctx.fillStyle = 'red';
        ctx.fillRect(
            screenPoint.x - halfSize,
            screenPoint.y - halfSize,
            size,
            size
        );
    }

    translateX(amount: number): void {
        for (const point of this.points) {
            point.translateX(amount);
        }
    }

    translateY(amount: number): void {
        for (const point of this.points) {
            point.translateY(amount);
        }
    }

    translateZ(amount: number): void {
        for (const point of this.points) {
            point.translateZ(amount);
        }
    }

    rotateY(radians: number): void {
        // Calculate cube center
        const centerX =
            this.points.reduce((sum, p) => sum + p.x, 0) / this.points.length;
        const centerZ =
            this.points.reduce((sum, p) => sum + p.z, 0) / this.points.length;

        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        for (const point of this.points) {
            // Translate point to origin relative to center
            const x = point.x - centerX;
            const z = point.z - centerZ;

            // Apply rotation
            const newX = x * cos - z * sin;
            const newZ = x * sin + z * cos;

            // Translate back to world space
            point.x = newX + centerX;
            point.z = newZ + centerZ;
        }
    }
}
