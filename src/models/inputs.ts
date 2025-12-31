export class Inputs {
    x: boolean;
    y: boolean;
    z: boolean;
    r: boolean;
    control: boolean;
    shift: boolean;
    alt: boolean;

    constructor(
        x: boolean,
        y: boolean,
        z: boolean,
        r: boolean,
        control: boolean,
        shift: boolean,
        alt: boolean
    ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
        this.control = control;
        this.shift = shift;
        this.alt = alt;
    }
}
