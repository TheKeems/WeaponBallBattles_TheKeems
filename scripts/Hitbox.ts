import { Assets, Sprite, Container } from "pixi.js";
import { removeFromArr, randInt, appBounds } from "../src/main";
import { Ball } from "./Ball";


export interface iFrame {
    origin: Container;
    duration: number;
}

interface HComponent{
  category : string;
}

export class Hitbox extends Sprite {
    public dmg = 0;
    public parent: Ball;
    private iFrames: iFrame[] = [];

    constructor(
        parent: Ball,
        file: string,
        dmg: number,
        width: number,
        height: number,
        anchor : number
    ) {
        super({
            texture: Assets.get(file),
            anchor: anchor,
            width: width,
            height: height
        })

        this.parent = parent;
        this.dmg = dmg;
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
        //                 if (key.team != this.parent.team && this.checkHit(key)) {
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
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.hypot(dx, dy);
        const minDist = 51 * this.parent.scl + 51 * other.scl;
        return (dist < minDist);
    }

    dealDamage(other: Ball) {
        let iframe = false;
        for (const i of this.iFrames) {
            if (i.origin === other) {
                iframe = true;
            }
        }
        if (!iframe) {
            //other.takeDamage(this.parent.getAtk());
            this.parent.dealDamage(other);
            this.iFrames.push({ origin: other, duration: 100 });
        }
    }

}