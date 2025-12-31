import type { ICartesian } from '../interfaces/cartesian.interface';
import type { ITranslatable } from '../interfaces/geometry.interface';
import { ScreenPoint } from './screen-point';

export class Point implements ITranslatable, ICartesian {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    translateX(amount: number) {
        this.x += amount;
    }

    translateY(amount: number) {
        this.y += amount;
    }

    translateZ(amount: number) {
        this.z += amount;
    }

    toScreen(screenWidth: number, screenHeight: number): ScreenPoint {
        const screenX = ((this.x / this.z + 1) / 2) * screenWidth;
        const screenY = (1 - (this.y / this.z + 1) / 2) * screenHeight;
        return new ScreenPoint(screenX, screenY);
    }
}
