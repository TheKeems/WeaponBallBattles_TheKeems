import { Assets, Sprite, Container, Point } from "pixi.js";
import { removeFromArr, randInt, appBounds } from "../src/main";
import { Ball } from "./Ball";


export interface iFrame {
    origin: Container;
    duration: number;
}

interface HComponent {
    category: string;
}

export enum hitboxShape {
    RECT,
    CIRCLE
}

export class Hitbox extends Sprite {
    public dmg = 0;
    //LIKELY NOT NEEDED
    public par: Ball;
    public iFrames: iFrame[] = [];
    public active : boolean;
    private shape: hitboxShape;
    public hitbox_width;
    public hitbox_height;

    constructor(
        par: Ball,
        file: string,
        dmg: number,
        width: number,
        height: number,
        shape: hitboxShape,
        active : boolean,
        anchor: number,
        anchor_y ?: number
    ) {
        super({
            texture: Assets.get(file),
            anchor: anchor,
        })

        if (anchor_y) {
            //console.log("ASAS");
            this.anchor.x = anchor;
            this.anchor.y = anchor_y;
        }

        this.hitbox_width = width;
        this.hitbox_height = height;
        this.par = par;
        this.dmg = dmg;
        this.shape = shape;
        this.active = active;
    }

    update(deltams: number, appBounds: appBounds, collisionMatrix: Ball[][][]) {
        for (const i of this.iFrames) {
            i.duration -= deltams;
            if (i.duration <= 0) {
                removeFromArr(this.iFrames, i);
            }
        }

        //const cell = collisionMatrix[Math.floor(this.x/appBounds.cell_size)][Math.floor(this.y/appBounds.cell_size)];
        if(this.active){
            const boundBox = this.getBoundBox(this.getCorners(this));

            //yeah forgot about hitboxes crossing cells

            const r_int = Math.floor((boundBox[2].x - boundBox[0].x)/appBounds.cell_size) + 1;
            const h_int = Math.floor((boundBox[2].y - boundBox[0].y)/appBounds.cell_size) + 1;
           
            for (let i = -r_int; i <= r_int; i++) {
                for (let j = -h_int; j <= h_int; j++) {
                    let r = Math.floor(boundBox[0].x / appBounds.cell_size) + i;
                    let c = Math.floor(boundBox[0].y / appBounds.cell_size) + j;
                    if (r >= 0 && c >= 0 && r < collisionMatrix.length && c < collisionMatrix[r].length) {
                        for (const key of collisionMatrix[r][c]) {
                            if (key.team != this.par.team && this.checkHit(key)) {
                                let iframe = false;
                                for (const i of this.iFrames) {
                                    if (i.origin === key) {
                                        iframe = true;
                                    }
                                }
                                if (!iframe) {
                                    this.dealDamage(key);
                                    this.par.dealDamage(key);
                                }
                            }
                        }
                    }
                }
            }
            //console.log(test); 
        }
    }

    //fuck me reinventing the wheel
    getCorners(obj: Hitbox | Ball): Point[] {
        const w = (obj instanceof Hitbox) ? obj.hitbox_width : obj.hitbox_width;
        const h = (obj instanceof Hitbox) ? obj.hitbox_height : obj.hitbox_height;

        const ax = obj instanceof Hitbox ? obj.anchor.x : 0.5;
        const ay = obj instanceof Hitbox ? obj.anchor.y : 0.5;

        const local = [
            new Point(-ax * w, -ay * h),
            new Point((1 - ax) * w, -ay * h),
            new Point((1 - ax) * w, (1 - ay) * h),
            new Point(-ax * w, (1 - ay) * h),
        ];

        const space = this.par.parent;
        if(!space){
            return local.map(p => obj.toGlobal(p));
        }
        return local.map(p => space.toLocal(obj.toGlobal(p)));
    };

    getBoundBox(corners : Point[]) : Point[]{
        const boundBox = [new Point(999999, 999999), new Point(999999, -1), new Point(-1, -1), new Point(-1, 999999)];
        for (const key of corners) {

            boundBox[0].x = Math.min(boundBox[0].x, key.x);
            boundBox[0].y = Math.min(boundBox[0].y, key.y);

            boundBox[1].x = Math.min(boundBox[1].x, key.x);
            boundBox[1].y = Math.max(boundBox[1].y, key.y);

            boundBox[2].x = Math.max(boundBox[2].x, key.x);
            boundBox[2].y = Math.max(boundBox[2].y, key.y);

            boundBox[3].x = Math.max(boundBox[3].x, key.x);
            boundBox[3].y = Math.min(boundBox[3].y, key.y);

        }

        return boundBox;
    }

    checkHit(other: Ball): boolean {
        if (this.shape === hitboxShape.CIRCLE) {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const dist = Math.hypot(dx, dy);
            const minDist = this.width / 2 * this.par.scl + this.width / 2 * other.scl;
            return dist < minDist;
        }

        if (this.shape === hitboxShape.RECT) {
            const getAxes = (c: Point[]) => {
                const axes: { x: number; y: number }[] = [];
                for (let i = 0; i < 2; i++) {
                    const p1 = c[i];
                    const p2 = c[i + 1];
                    const ex = p2.x - p1.x;
                    const ey = p2.y - p1.y;
                    const len = Math.hypot(ex, ey);
                    if (len < 1e-8) continue;
                    axes.push({ x: -ey / len, y: ex / len });
                }
                return axes;
            };

            const project = (c: Point[], axis: { x: number; y: number }) => {
                let min = Infinity;
                let max = -Infinity;
                for (const p of c) {
                    const d = p.x * axis.x + p.y * axis.y;
                    if (d < min) min = d;
                    if (d > max) max = d;
                }
                return { min, max };
            };

            const cornersA = this.getCorners(this);
            const cornersB = this.getCorners(other);

            for (const axis of [...getAxes(cornersA), ...getAxes(cornersB)]) {
                const a = project(cornersA, axis);
                const b = project(cornersB, axis);
                if (a.max < b.min || b.max < a.min) return false;
            }
            return true;
        }

        return false;
    }

    dealDamage(other: Ball) {
        let iframe = false;
        for (const i of this.iFrames) {
            if (i.origin === other) {
                iframe = true;
            }
        }
        if (!iframe) {
            //other.takeDamage(this.par.getAtk());
            other.takeDamage(this.dmg);
            this.iFrames.push({ origin: other, duration: 350 });
        }
    }

    getiFrames() {
        return this.iFrames;
    }



}