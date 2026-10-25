import { Ball, BallConfig} from "../Ball";
import { Hitbox } from "../Hitbox";
import { appBounds } from "../../src/main";
import { hitboxShape } from "../Hitbox";


export class Unarmed extends Ball{
    
    constructor(
        ballsconfig : Record<string, BallConfig>,
        team: number = 0,
        health : number = 100
    ){
        super("unarmed", ballsconfig, team, health);

        this.hitboxes.push(new Hitbox(this, "empty.png", this.getAtk(), 100, 100, hitboxShape.CIRCLE, 0.5));
        this.addChild(this.healthLabel);

        //this.tint = 0x808080;
    }

    update(delta: number, appBounds: appBounds, deltams : number, collisionMatrix : Ball[][][]){
        super.update(delta, appBounds, deltams, collisionMatrix);
        
    }

    collideWith(other: Ball): boolean {
        const ret = super.collideWith(other);
        if(ret){
            this.setAtk(Math.hypot(this.velocity.x, this.velocity.y));
            this.hitboxes[0].dealDamage(other);
        }
        return ret;

    }

  dealDamage(other : Ball){
    super.dealDamage(other);
    this.speedCap += 0.2;
  }


}