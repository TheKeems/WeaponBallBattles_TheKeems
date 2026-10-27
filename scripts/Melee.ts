import { Assets, Sprite, Container } from "pixi.js";
import { removeFromArr, randInt, appBounds } from "../src/main";
import { Ball } from "./Ball";
import { Hitbox , iFrame, hitboxShape} from "./Hitbox";


export class Melee extends Hitbox {
    public spinRate : number;
    
    constructor(
        par: Ball,
        file: string,
        dmg: number,
        width: number,
        height: number,
        spinRate : number,
        shape : hitboxShape,
        active : boolean,
        anchor : number,
        a_2 : number = -1
    ) {
        super(
            par,
            file,
            dmg,
            width,
            height,
            shape,
            active,
            anchor,
            a_2,
            
        )

        this.spinRate = spinRate;

    }

    update(deltams: number, appBounds: appBounds, collisionMatrix: Ball[][][]) {

        super.update(deltams, appBounds, collisionMatrix);

        //const cell = collisionMatrix[Math.floor(this.x/appBounds.cell_size)][Math.floor(this.y/appBounds.cell_size)];

        this.rotation += this.spinRate * deltams;
    }

    checkHit(other: Ball): boolean {
        //console.log("HIT");
        return super.checkHit(other);
    }

    dealDamage(other: Ball) {
        super.dealDamage(other);
    }

}