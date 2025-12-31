import type { Inputs } from '../models/inputs';

export interface IUpdateable {
    update(deltaTime: number, inputs: Inputs): void;
}
