import { Assets,  Sprite, Text, Container, ColorMatrixFilter, ColorSource} from "pixi.js";
import {removeFromArr, randInt, appBounds, setTimeflow} from "../src/main";
import { Hitbox } from "./Hitbox";

export interface Velocity {
  x: number;
  y: number;
}

export interface BallConfig {
  title: string;
  file: string;
  atk: number;
  scl: number;
  speed: number;
  tint : ColorSource
}

interface BComponent{
  category : string;
}


export class Ball extends Container {
  private health;
  private atk;
  public speed;
  public scl;
  public title;
  public team;
  public name;
  private colorMatrix;
  private sprite : Sprite;
  public healthLabel = new Text({text : ""});
  public hitboxes: Hitbox[];
  public cellArr: Ball[] | null = null;
  public velocity: Velocity;
  private components : Map<string, BComponent> = new Map();

  constructor(
    ballType: string,
    ballsconfig : Record<string, BallConfig>,
    team : number = 0,
    health : number = 100
  ) {
    const {title, file, atk, scl, speed, tint} = ballsconfig[ballType];

    super();
    
    this.loadText(file);

    this.sprite = new Sprite({      
      texture: Assets.get(file),
      anchor: 0.5,
      scale: scl,
    });

    this.sortableChildren = true;

    this.scl = scl;
    this.name = ballType;
    this.title = title;
    this.speed = speed;
    this.health = health;
    this.atk = atk;
    this.team = team;
    this.hitboxes = [];
    this.colorMatrix = new ColorMatrixFilter();

    if(tint){
      this.tint = tint;
    }

    this.sprite.filters = [this.colorMatrix];
    this.addChild(this.sprite);

    this.healthLabel.anchor.set(0.5);
    //this.healthLabel.zIndex = 999;
    this.healthLabel.text = this.health;

    this.setSize(100 * scl, 100 * scl);

    this.addChild(this.healthLabel);

    const angle = Math.random() * Math.PI * 2;
    this.velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
  }

  async loadText(file : string){
    const texture = await Assets.load(file);
    return texture;
  }

  update(delta: number, appBounds: appBounds, deltams : number, collisionMatrix : Ball[][][]){
    this.move(delta, appBounds, collisionMatrix);
    for(const key of this.hitboxes){
        key.update(deltams, appBounds, collisionMatrix);
    }
  }

  move(delta: number, appBounds: appBounds, collisionMatrix : Ball[][][]) {

    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;

    //well apparently my collision matrix is buggy ash so ig ill do ts
    const cell = collisionMatrix[Math.floor(this.x/appBounds.cell_size)][Math.floor(this.y/appBounds.cell_size)];
    if (cell !== this.cellArr) {
      if (this.cellArr){
        removeFromArr(this.cellArr, this);
      } 
      cell.push(this);
      this.cellArr = cell;
    }

    for(let i = -1; i <= 1; i++){
      for(let j = -1; j <= 1; j++){
        let r = Math.floor(this.x/appBounds.cell_size) + i;
        let c = Math.floor(this.y/appBounds.cell_size) + j;
        if(r >= 0 && c >= 0 && r < collisionMatrix.length && c < collisionMatrix[r].length){
          for (const key of collisionMatrix[r][c]) {
            if (key != this){
              this.collideWith(key);
            }
          }
        }
      }
    }

    this.collideWithBorder(appBounds, delta);

    this.velocity.y += 0.2 * delta;

  }

  dealDamage(other : Ball){
    other.takeDamage(this.atk);
  }

  takeDamage(damageTaken : number){
    this.health -= damageTaken;
    this.healthLabel.text = Math.round(this.health);
    this.colorMatrix.brightness(1.2, false);
    setTimeflow(false);
    setTimeout(() => {
        this.colorMatrix.brightness(1.0, false);
        setTimeflow(true);
    }, 100);
  }

  checkHit(x: number, y: number): boolean {
    let dx = x - this.x;
    let dy = y - this.y;
    return (dx * dx + dy * dy) < (this.scl * 50 * this.scl * 50);
  }

  collideWithBorder(appBounds: appBounds, delta : number){
    const hw = this.width / 2;
    const hh = this.height / 2;

    if (this.x - hw <= appBounds.left) {
      this.x = appBounds.left + hw;
      this.velocity.x = Math.abs(this.velocity.x);
      if(Math.abs(this.velocity.x) <= 3){
        this.velocity.x += 3 * delta;
      }
    } else if (this.x + hw >= appBounds.right) {
      this.x = appBounds.right - hw;
      this.velocity.x = -Math.abs(this.velocity.x);
      if(Math.abs(this.velocity.x) <= 3){
        this.velocity.x -= 3 * delta;
      }
    }

    if (this.y - hh <= appBounds.top) {
      this.y = appBounds.top + hh;
      this.velocity.y = Math.abs(this.velocity.y);
    } else if (this.y + hh >= appBounds.bottom) {
      this.y = appBounds.bottom - hh;
      
      this.velocity.y = -Math.abs(this.velocity.y);
      if(this.velocity.y > -10){
        this.velocity.y -= 3 * delta;
      }
      if(Math.abs(this.velocity.x) <= 3){
        this.velocity.x += randInt(-1, 1) * this.speed * delta;
      }
    }
  }

collideWith(other: Ball, reflected: boolean = true): boolean {
  const ox = other.x;
  const oy = other.y;
  const ovx = other.velocity.x;
  const ovy = other.velocity.y;

  const dx = ox - this.x;
  const dy = oy - this.y;
  const dist = Math.hypot(dx, dy);
  const minDist = 50 * this.scl + 50 * other.scl;
  if (dist >= minDist) {
    return false;
  }

  if (reflected) {
    other.collideWith(this, false);
  }

  const nx = dist === 0 ? (reflected ? 1 : -1) : dx / dist;
  const ny = dist === 0 ? 0 : dy / dist;

  const overlap = minDist - dist;
  this.x -= nx * overlap / 2;
  this.y -= ny * overlap / 2;

  const approachSpeed = (this.velocity.x - ovx) * nx + (this.velocity.y - ovy) * ny;
  if (approachSpeed <= 0) {
    return false;
  }

  this.velocity.x -= approachSpeed * nx;
  this.velocity.y -= approachSpeed * ny;
  this.setSpeed(this.speed, -nx, -ny);

  return true;
}

  private setSpeed(speed: number, x: number, y: number) {
    const cur = Math.hypot(this.velocity.x, this.velocity.y);
    if (cur === 0) {
      this.velocity.x = x * speed;
      this.velocity.y = y * speed;
    } else {
      this.velocity.x = (this.velocity.x / cur) * speed;
      this.velocity.y = (this.velocity.y / cur) * speed;
    }
  }

  addAtk(i : number){
    this.atk += i;
  }

  setAtk(i : number){
    this.atk = i;
  }

  getAtk() : number{
    return this.atk;
  }

  addHitbox(file : string, width : number, height : number, anchor : number){
    this.hitboxes.push(new Hitbox(this, file, this.getAtk(), height, width, anchor));
  }

  addComponent(s : string, c : BComponent){
    this.components.set(s, c);
  }

  getComponent(s : string){
    return this.components.get(s);
  }

  hasComponent(s : string) : boolean{
    return this.components.has(s);
  }

}

class HitDamageComponent implements BComponent{
  readonly category = "onHit";
  private parent;
  constructor(parent : Ball){
    this.parent = parent;
  }

  Hit(other : Ball){
    this.parent.hitboxes[0].dealDamage(other);
  }
}