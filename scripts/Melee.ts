import { Assets, Sprite, Container } from "pixi.js";
import { removeFromArr, randInt, appBounds } from "../src/main";
import { Ball } from "./Ball";
import { Hitbox , iFrame} from "./Hitbox";


export class Melee extends Hitbox {
    public spinRate : number;


    constructor(
        parent: Ball,
        file: string,
        dmg: number,
        width: number,
        height: number,
        spinRate: number,
        anchor : number = 0
    ) {
        super(
            parent,
            file,
            dmg,
            width,
            height,
            anchor
        )

        this.spinRate = spinRate;

    }

    update(deltams: number, appBounds: appBounds, collisionMatrix: Ball[][][]) {

        //const cell = collisionMatrix[Math.floor(this.x/appBounds.cell_size)][Math.floor(this.y/appBounds.cell_size)];
    }

    checkHit(other: Ball): boolean {
        return super.checkHit(other);
    }

    dealDamage(other: Ball) {
        super.dealDamage(other);
    }

}