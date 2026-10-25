import { Assets, Sprite, Container, Point } from "pixi.js";
import { removeFromArr, randInt, appBounds } from "../src/main";
import { Ball } from "./Ball";


export interface iFrame {
    origin: Container;
    duration: number;
}

interface HComponent{
  category : string;
}

export enum hitboxShape{
    RECT,
    CIRCLE
}

export class Hitbox extends Sprite {
    public dmg = 0;
    public par: Ball;
    public iFrames: iFrame[] = [];
    private shape : hitboxShape;
    private hitbox_width;
    private hitbox_height;

    constructor(
        par: Ball,
        file: string,
        dmg: number,
        width: number,
        height: number,
        shape : hitboxShape,
        anchor : number,
        a_2 : number = -1
    ) {
        super({
            texture: Assets.get(file),
            anchor: anchor,
        })

        if(a_2 != -1){
            //console.log("ASAS");
            this.anchor.x = anchor;
            this.anchor.y = a_2;
        }

        this.hitbox_width = width;
        this.hitbox_height = height;
        this.par = par;
        this.dmg = dmg;
        this.shape = shape;
    }

    update(deltams: number, appBounds: appBounds, collisionMatrix: Ball[][][]) {
        for (const i of this.iFrames) {
            i.duration -= deltams;
            if (i.duration <= 0) {
                removeFromArr(this.iFrames, i);
            }
        }

        //const cell = collisionMatrix[Math.floor(this.x/appBounds.cell_size)][Math.floor(this.y/appBounds.cell_size)];

        // for (let i = -1; i <= 1; i++) {
        //     for (let j = -1; j <= 1; j++) {
        //         let r = Math.floor(this.x / appBounds.cell_size) + i;
        //         let c = Math.floor(this.y / appBounds.cell_size) + j;
        //         if (r >= 0 && c >= 0 && r < collisionMatrix.length && c < collisionMatrix[r].length) {
        //             for (const key of collisionMatrix[r][c]) {
        //                 if (key.team != this.par.team && this.checkHit(key)) {
        //                     let iframe = false;
        //                     for (const i of this.iFrames) {
        //                         if (i.origin === key) {
        //                             iframe = true;
        //                         }
        //                     }
        //                     if (!iframe) {
        //                         this.dealDamage(key);
        //                         this.iFrames.push({ origin: key, duration: 100 });
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    checkHit(other: Ball): boolean {
        if(this.shape === hitboxShape.CIRCLE){
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const dist = Math.hypot(dx, dy);
            const minDist = this.width/2 * this.par.scl + this.width/2 * other.scl;
            return (dist < minDist);
        }
        else if(this.shape === hitboxShape.RECT){
            const getCorners = (obj : Hitbox | Ball) => {
                const w = (obj instanceof Hitbox) ? obj.hitbox_width : obj.hitbox_width;
                const h = (obj instanceof Hitbox) ? obj.hitbox_height : obj.hitbox_height;

                const ax = (obj instanceof Hitbox) ? obj.anchor.x : 0;
                const ay = (obj instanceof Hitbox) ? obj.anchor.y : 0;

                const localCorners = [
                    { x: -ax * w,       y: -ay * h },    
                    { x: (1 - ax) * w,  y: -ay * h },     
                    { x: (1 - ax) * w,  y: (1 - ay) * h },  
                    { x: -ax * w,       y: (1 - ay) * h }  
                ];

                return localCorners.map(corner => obj.worldTransform.apply(corner));
            };

            const cornersA = getCorners(this);
            const cornersB = getCorners(other);

            const getAxes = (corners: string | any[]) => {
                const axes = [];
                for (let i = 0; i < corners.length; i++) {
                    const p1 = corners[i];
                    const p2 = corners[(i + 1) % corners.length];
                    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
                    const normal = { x: -edge.y, y: edge.x };
                    const length = Math.hypot(normal.x, normal.y);
                    axes.push({ x: normal.x / length, y: normal.y / length });
                }
                return axes;
            };

            const axes = [...getAxes(cornersA), ...getAxes(cornersB)];

            for (const axis of axes) {
                const project = (corners: Point[]) => {
                    let min = Infinity;
                    let max = -Infinity;
                    for (const p of corners) {
                        const dot = p.x * axis.x + p.y * axis.y;
                        if (dot < min) min = dot;
                        if (dot > max) max = dot;
                    }
                    return { min, max };
                };

                const projA = project(cornersA);
                const projB = project(cornersB);

                if (projA.max < projB.min || projB.max < projA.min) {
                    return false; 
                }
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
            this.par.dealDamage(other);
            this.iFrames.push({ origin: other, duration: 100 });
        }
    }

    getiFrames(){
        return this.iFrames;
    }

}