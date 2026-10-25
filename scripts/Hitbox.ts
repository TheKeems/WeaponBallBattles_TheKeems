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

export enum hitboxShape{
    RECT,
    CIRCLE
}

export class Hitbox extends Sprite {
    public dmg = 0;
    public parent: Ball;
    public iFrames: iFrame[] = [];
    private shape : hitboxShape;
    private hitbox_width;
    private hitbox_height;

    constructor(
        parent: Ball,
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
        this.parent = parent;
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
        if(this.shape === hitboxShape.CIRCLE){
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const dist = Math.hypot(dx, dy);
            const minDist = this.width/2 * this.parent.scl + this.width/2 * other.scl;
            return (dist < minDist);
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
            //other.takeDamage(this.parent.getAtk());
            this.parent.dealDamage(other);
            this.iFrames.push({ origin: other, duration: 100 });
        }
    }

    getiFrames(){
        return this.iFrames;
    }

}