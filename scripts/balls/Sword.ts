import { Ball, BallConfig} from "../Ball";
import { Melee } from "../Melee";
import { appBounds } from "../../src/main";


export class Sword extends Ball{
    
    constructor(
        ballsconfig : Record<string, BallConfig>,
        team: number = 0,
        health : number = 100
    ){
        super("sword", ballsconfig, team, health);

        this.hitboxes.push(new Melee(this, "sword.png", this.getAtk(), 100, 100, 3, 0));
        this.addChild(this.hitboxes[0]);
        this.addChild(this.healthLabel);
        
    }

    update(delta: number, appBounds: appBounds, deltams : number, collisionMatrix : Ball[][][]){
        super.update(delta, appBounds, deltams, collisionMatrix);
    }

    collideWith(other: Ball): boolean {
        const ret = super.collideWith(other);
        if(ret){
            //this.hitboxes[0].dealDamage(other);
        }
        return ret;

    }


}