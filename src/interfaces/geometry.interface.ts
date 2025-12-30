export interface ITranslatable {
    translateX(amount: number): void;
    translateY(amount: number): void;
    translateZ(amount: number): void;
}

export interface IRotatable {
    rotateY(radians: number): void;
}
