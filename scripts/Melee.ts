import { Assets, Sprite, Container } from "pixi.js";
import { removeFromArr, randInt, appBounds } from "../src/main";
import { Ball } from "./Ball";
import { Hitbox , iFrame, hitboxShape} from "./Hitbox";


export class Melee extends Hitbox {
    public spinRate : number;
    
    constructor(
        parent: Ball,
        file: string,
        dmg: number,
        width: number,
        height: number,
        spinRate : number,
        shape : hitboxShape,
        anchor : number,
        a_2 : number = -1
    ) {
        super(
            parent,
            file,
            dmg,
            width,
            height,
            anchor,
            a_2,
            shape
        )

        this.spinRate = spinRate;

    }

    update(deltams: number, appBounds: appBounds, collisionMatrix: Ball[][][]) {

        super.update(deltams, appBounds, collisionMatrix);

        const cell = collisionMatrix[Math.floor(this.x/appBounds.cell_size)][Math.floor(this.y/appBounds.cell_size)];

        //this.rotation += this.spinRate * deltams;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let r = Math.floor(this.x / appBounds.cell_size) + i;
                let c = Math.floor(this.y / appBounds.cell_size) + j;
                if (r >= 0 && c >= 0 && r < collisionMatrix.length && c < collisionMatrix[r].length) {
                    for (const key of collisionMatrix[r][c]) {
                        if (key.team != this.parent.team && this.checkHit(key)) {
                            let iframe = false;
                            for (const i of this.iFrames) {
                                if (i.origin === key) {
                                    iframe = true;
                                }
                            }
                            if (!iframe) {
                                this.dealDamage(key);
                                this.iFrames.push({ origin: key, duration: 100 });
                            }
                        }
                    }
                }
            }
        }
    }

    checkHit(other: Ball): boolean {
        return super.checkHit(other);
    }

    dealDamage(other: Ball) {
        super.dealDamage(other);
    }

}