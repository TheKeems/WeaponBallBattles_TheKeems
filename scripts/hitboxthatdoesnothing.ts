//this is literally only for testing
import { Point } from "pixi.js";
import { Ball, hitboxShape, Hitbox} from "../scripts/index";

export class hitboxthatdoesnothing extends Hitbox {

    constructor(
        x : number,
        y : number,
        file: string,
        width: number,
        height: number,
        shape: hitboxShape,
        anchor: number,
        a_2?: number
    ) {
        super(new Ball("test", -1), file, 0, width, height, shape, false, anchor, a_2);
        this.x = x;
        this.y = y;
    }

    getCorners(): Point[] {
        const w = this.hitbox_width;
        const h = this.hitbox_height;

        const ax = this.anchor.x;
        const ay = this.anchor.y;

        const local = [
            new Point(-ax * w, -ay * h),
            new Point((1 - ax) * w, -ay * h),
            new Point((1 - ax) * w, (1 - ay) * h),
            new Point(-ax * w, (1 - ay) * h),
        ];

        return local.map(p => this.toGlobal(p));
    };



}