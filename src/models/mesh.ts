import type { IDynamic } from '../interfaces/dynamic.interface';
import type { ITranslatable } from '../interfaces/geometry.interface';
import type { ILoadable } from '../interfaces/loadable.interface';
import { Point } from './point';

export class Mesh implements IDynamic, ILoadable, ITranslatable {
    points: Point[];
    edges: number[][];
    triangles: number[][];
    private fillStyle: string;
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

    save(fileName: string): void {
        // Trigger file download
        const blob = new Blob(
            [
                JSON.stringify({
                    points: this.points,
                    edges: this.edges,
                    triangles: this.triangles,
                }),
            ],
            { type: 'text/plain' }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    async load(fileName: string): Promise<void> {
        const fileExtension = fileName.split('.').pop()?.toLowerCase();

        if (fileExtension === 'json') {
            const response = await fetch(`/meshes/${fileName}`);
            const data = await response.json();
            // Load points
            this.points = data.points.map(
                (p: { x: number; y: number; z: number }) =>
                    new Point(p.x, p.y, p.z)
            );
            // Load edges
            this.edges = data.edges;
            // Load triangles
            this.triangles = data.triangles;
        } else if (fileExtension === 'obj') {
            const response = await fetch(`/meshes/${fileName}`);
            const text = await response.text();
            const lines = text.split('\n').map((line) => line.trim());

            const points = [];
            const triangles: number[][] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.charAt(0) === 'v') {
                    const parts = line.split(/\s+/);
                    if (parts.length >= 4) {
                        const x = parseFloat(parts[1]);
                        const y = parseFloat(parts[2]);
                        const z = parseFloat(parts[3]);
                        points.push(new Point(x, y, z));
                    }
                } else if (line.charAt(0) === 'f') {
                    const parts = line.split(/\s+/);
                    if (parts.length >= 4) {
                        const idx1 = parseInt(parts[1]) - 1;
                        const idx2 = parseInt(parts[2]) - 1;
                        const idx3 = parseInt(parts[3]) - 1;
                        triangles.push([idx1, idx2, idx3]);
                    }
                }
            }

            this.points = points;
            this.triangles = triangles;
        } else {
            throw new Error(`Unsupported file format: .${fileExtension}`);
        }
    }

    update(deltaTime: number): void {
        this.elapsedTime += deltaTime;
        this.rotateY(deltaTime * Math.PI);
        this.translateZ(deltaTime);

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
