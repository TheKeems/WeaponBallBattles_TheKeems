import { Ball, BallConfig} from "../Ball";
import { Hitbox} from "../Hitbox";
import { OutlineFilter } from 'pixi-filters';


export class Verity extends Ball{
    
    constructor(
        ballsconfig : Record<string, BallConfig>,
        team: number = 0,
        health : number = 100
    ){
        super("verity", ballsconfig, team, health);

        this.filters = [new OutlineFilter({ thickness: 1, color: 0x000000 })];
        
    }


}