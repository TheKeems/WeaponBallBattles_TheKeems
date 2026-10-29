import { Assets, Sprite, Text, Container, ColorMatrixFilter, ColorSource } from "pixi.js";
import { removeFromArr, randInt, appBounds, setTimeflow, ballsconfig } from "../src/main";
import { Hitbox } from "../scripts/index";

export interface Velocity {
  x: number;
  y: number;
}

export interface BallConfig {
  title: string;
  file: string;
  atk: number;
  scl: number;
  speedCap: number;
  components: [{
      name : string,
      tags: string[]
    }
  ];
  hitboxes: [{
    type: string,
    file: string,
    dmg: number,
    width: number,
    height: number,
    shape: string,
    active : boolean,
    anchor_x: number,
    anchor_y?: number
  }];
  displayedStats: {};
  tint: ColorSource
}

export interface BComponent {
  tags: string[];
  parent: Ball;
  run(...params: any): any;
}

//i dont know why the fuck i cant just pass in the enum
const shapeConv : Record<string, number> = {
  "rect" : 0, // RECT
  "circle" : 1 // CIRCLE
}

export class DamageEnemyComponent implements BComponent {
  readonly tags;
  parent;
  constructor(parent: Ball, tags: string[]) {
    this.parent = parent;
    this.tags = tags;
  }

  run(other: Ball) {
    if (this.parent.name === "unarmed") {
      this.parent.setAtk(Math.hypot(this.parent.velocity.x, this.parent.velocity.y) / 2);
      this.parent.speedCap += 0.2;
      this.parent.hitboxes[0].dmg = this.parent.getAtk();
      this.parent.hitboxes[0].dealDamage(other);
    }
    if (this.parent.name === "sword") {
      this.parent.incrAtk(1);
    }
    this.parent.hitboxes[0].dmg = this.parent.getAtk();
  }
}


export class Ball extends Container {
  private health;
  private atk;
  public speedCap;
  public scl;
  public title;
  public team;
  public name;
  public hitbox_height;
  public hitbox_width;
  private colorMatrix;
  private sprite: Sprite;
  public healthLabel = new Text({ text: "" });
  public hitboxes: Hitbox[];
  public cellArr: Ball[] | null = null;
  public velocity: Velocity;
  private components: BComponent[];

  constructor(
    ballType: string,
    team: number = 0,
    health: number = 100
  ) {
    const { title, file, atk, scl, speedCap, components, hitboxes, displayedStats, tint } = ballsconfig[ballType];

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
    this.speedCap = speedCap;
    this.health = health;
    this.atk = atk;
    this.team = team;
    this.hitboxes = [];
    this.colorMatrix = new ColorMatrixFilter();
    this.components = [];

    this.hitbox_height = 100 * this.scl;
    this.hitbox_width = 100 * this.scl;

    if (tint) {
      this.sprite.tint = tint;
    }

    this.sprite.filters = [this.colorMatrix];
    this.addChild(this.sprite);

    this.healthLabel.anchor.set(0.5);
    this.healthLabel.zIndex = 999;
    this.healthLabel.text = this.health;

    this.setSize(100 * scl, 100 * scl);

    this.addChild(this.healthLabel);

    const angle = Math.random() * Math.PI * 2;
    this.velocity = { x: Math.cos(angle) * speedCap, y: Math.sin(angle) * speedCap };

    if (hitboxes) {
      for (const key of ballsconfig[ballType].hitboxes) {
        this.addHitbox(new Hitbox(this, key.file, key.dmg, key.width, key.height, shapeConv[key.shape], key.active, key.anchor_x, key.anchor_y));
      }
    }

    if(components){
      for (const key of ballsconfig[ballType].components) {
        switch(key.name){
          case "DamageEnemyComponent":
            this.addComponent(new DamageEnemyComponent(this, key.tags));
        }
      }
    }

  }

  async loadText(file: string) {
    const texture = await Assets.load(file);
    return texture;
  }

  update(delta: number, appBounds: appBounds, deltams: number, collisionMatrix: Ball[][][]) {
    //ON DEATH
    if (this.health <= 0) {
      this.removeFromParent();
      this.destroy({ children: true })
      return;
    }

    this.move(delta, appBounds, collisionMatrix);
    for (const key of this.hitboxes) {
      key.update(deltams, appBounds, collisionMatrix);
    }
  }


  move(delta: number, appBounds: appBounds, collisionMatrix: Ball[][][]) {

    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;

    //well apparently my collision matrix is buggy ash so ig ill do ts
    const cell = collisionMatrix[Math.floor(this.x / appBounds.cell_size)][Math.floor(this.y / appBounds.cell_size)];
    if (cell !== this.cellArr) {
      if (this.cellArr) {
        removeFromArr(this.cellArr, this);
      }
      cell.push(this);
      this.cellArr = cell;
    }

    for (let i = -1 - Math.floor(50 * this.scl / appBounds.cell_size); i <= 1 + Math.floor(50 * this.scl / appBounds.cell_size); i++) {
      for (let j = -1 - Math.floor(50 * this.scl / appBounds.cell_size); j <= 1 + Math.floor(50 * this.scl / appBounds.cell_size); j++) {
        let r = Math.floor(this.x / appBounds.cell_size) + i;
        let c = Math.floor(this.y / appBounds.cell_size) + j;
        if (r >= 0 && c >= 0 && r < collisionMatrix.length && c < collisionMatrix[r].length) {
          for (const key of collisionMatrix[r][c]) {
            if (key != this) {
              this.collideWith(key);
            }
          }
        }
      }
    }

    this.collideWithBorder(appBounds, delta);

    this.velocity.y += 0.2 * delta;

  }

  dealDamage(other: Ball) {
    for (const key of this.components) {
      if (key.tags.includes("onDamage")) {
        key.run(other);
      }
    }
    //other.takeDamage(this.atk);
  }

  takeDamage(damageTaken: number) {
    this.health -= damageTaken;
    this.healthLabel.text = Math.round(this.health);
    this.colorMatrix.brightness(1.2, false);
    if (this.health > 0) {
      setTimeflow(false);
      setTimeout(() => {
        this.colorMatrix.brightness(1.0, false);
        setTimeflow(true);
      }, 100);
    }
  }

  checkHit(x: number, y: number): boolean {
    let dx = x - this.x;
    let dy = y - this.y;
    return (dx * dx + dy * dy) < (this.scl * 50 * this.scl * 50);
  }

  collideWithBorder(appBounds: appBounds, delta: number) {
    const hw = (100 * this.scl) / 2;
    const hh = (100 * this.scl) / 2;

    if (this.x - hw <= appBounds.left) {
      this.x = appBounds.left + hw;
      this.velocity.x = Math.abs(this.velocity.x);
      if (Math.abs(this.velocity.x) <= 3) {
        this.velocity.x += 3 * delta;
      }
    } else if (this.x + hw >= appBounds.right) {
      this.x = appBounds.right - hw;
      this.velocity.x = -Math.abs(this.velocity.x);
      if (Math.abs(this.velocity.x) <= 3) {
        this.velocity.x -= 3 * delta;
      }
    }

    if (this.y - hh <= appBounds.top) {
      this.y = appBounds.top + hh;
      this.velocity.y = Math.abs(this.velocity.y);
    } else if (this.y + hh >= appBounds.bottom) {
      this.y = appBounds.bottom - hh;

      this.velocity.y = -Math.abs(this.velocity.y);
      if (this.velocity.y > -10) {
        this.velocity.y -= 3 * delta;
      }
      if (Math.abs(this.velocity.x) <= 3) {
        this.velocity.x += randInt(-1, 1) * this.speedCap * delta;
      }
    }
  }

  collideWith(other: Ball, reflected: boolean = true): boolean {

    if (!other || other.destroyed || !this || this.destroyed) {
      return false;
    }

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
    this.setSpeed(this.speedCap, -nx, -ny);

    //this.runComponentWithTag("onCollide", other);

    for (const key of this.components) {
      if (key.tags.includes("onCollide")) {
        key.run(other);
      }
    }

    return true;
  }

  private setSpeed(speedCap: number, x: number, y: number) {
    const cur = Math.hypot(this.velocity.x, this.velocity.y);
    if (cur === 0) {
      this.velocity.x = x * speedCap;
      this.velocity.y = y * speedCap;
    } else {
      this.velocity.x = (this.velocity.x / cur) * speedCap;
      this.velocity.y = (this.velocity.y / cur) * speedCap;
    }
  }

  addAtk(i: number) {
    this.atk += i;
  }

  setAtk(i: number) {
    this.atk = i;
  }

  incrAtk(i: number) {
    this.atk += i;
  }

  getAtk(): number {
    return this.atk;
  }

  addHitbox(h: Hitbox) {
    this.hitboxes.push(h);
    this.addChild(h);
    //console.log(this.children);
  }

  addComponent(c: BComponent) {
    this.components.push(c);
  }

  runComponentWithTag(tag: string, ...params: Ball[]) {

  }

  // getComponent(s : string){
  //   return this.components.get(s);
  // }

  // hasComponent(s : string) : boolean{
  //   return this.components.has(s);
  // }

}