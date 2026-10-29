import { Application, Assets, Graphics, Container } from "pixi.js";
import manifest from "./manifest.json";
import { Ball, BallConfig, Hitbox } from "../scripts/index";
import {hitboxthatdoesnothing} from "../scripts/hitboxthatdoesnothing";

const BORDER_PADDING = 40;
const BORDER_WIDTH = 4;
const GAME_HEIGHT = 600;
const GAME_WIDTH = 600;
const CELL_SIZE = GAME_HEIGHT/5;
let timeFlow = true;
let collisionMatrix : Ball[][][] = [[[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []]];

export interface appBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  cell_size: number;
}

export function setTimeflow(b : boolean){
  timeFlow = b;
}

export function removeFromArr<T>(arr: Array<T>, obj: T){
  const target = arr.findIndex((ob : T) => ob === obj);
  if (target !== -1) arr.splice(target, 1);
}
export function randInt(min : number, max : number) : number {
    return Math.floor(Math.random() * (max - min) + min);
}

export let ballsconfig: Record<string, BallConfig>;
export let gameBounds: appBounds;
export const debugGfx = new Graphics();


export function drawHitboxDebug(hitbox: Hitbox | hitboxthatdoesnothing, ball?: Ball) {
    //const a = hitbox.getBoundBox(hitbox.getCorners(hitbox)).flatMap(p => [p.x, p.y]);
    const a = hitbox.getCorners(hitbox).flatMap(p => [p.x, p.y]);
    //const b = hitbox.getCorners(ball).flatMap(p => [p.x, p.y]);
    //const hit = hitbox.checkHit(ball);
    const hit = false;

    debugGfx
        .poly(a)
        .stroke({ width: 2, color: hit ? 0xff0000 : 0x00ff00 })
        // .poly(b)
        // .stroke({ width: 2, color: hit ? 0xff0000 : 0x00aaff });
}

(async () => {
  const app = new Application();
  await app.init({
    background: "#ffffff",
    resizeTo: window,
    antialias: true,
  });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const gameContainer = new Container();
  app.stage.addChild(gameContainer);

  await Assets.init({ manifest, basePath: "assets" });
  await Assets.loadBundle("main");
  ballsconfig = Assets.get("balls.json");

  const border = new Graphics();
  gameContainer.addChild(border);

  gameBounds = { left: 0, top: 0, right: 0, bottom: 0, width: GAME_WIDTH, height: GAME_HEIGHT, cell_size: CELL_SIZE};

  const layout = () => {
    gameBounds.left = BORDER_PADDING + BORDER_WIDTH / 2;
    gameBounds.top = BORDER_PADDING + BORDER_WIDTH / 2;
    gameBounds.right = GAME_WIDTH - BORDER_PADDING - BORDER_WIDTH / 2;
    gameBounds.bottom = GAME_HEIGHT - BORDER_PADDING - BORDER_WIDTH / 2;

    border
      .clear()
      .rect(
        BORDER_PADDING,
        BORDER_PADDING,
        GAME_WIDTH - BORDER_PADDING * 2,
        GAME_HEIGHT - BORDER_PADDING * 2,
      )
      .stroke({ width: BORDER_WIDTH, color: 0x000000 });
  };

  const ball = new Ball("unarmed", 1, 500);
  //const verity = new Ball("verity", 2, 500);
  const ball1 = new Ball("sword", 0, 500);

  //const testbox = new hitboxthatdoesnothing(100, 100, "empty.png", 150, 35, hitboxShape.RECT, -0.1, 0.5);

  gameContainer.addChild(ball);
  gameContainer.addChild(ball1);
  //gameContainer.addChild(verity);

  layout();
  ball.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  ball1.position.set(GAME_WIDTH / 4, GAME_HEIGHT / 4);

  app.stage.addChild(debugGfx);

  app.ticker.add((ticker) => {
    if(timeFlow){
      ball.update(ticker.deltaTime, gameBounds, ticker.deltaMS, collisionMatrix);
      ball1.update(ticker.deltaTime, gameBounds, ticker.deltaMS, collisionMatrix);
      //verity.update(ticker.deltaTime, gameBounds, ticker.deltaMS, collisionMatrix);
      debugGfx.clear();
      //drawHitboxDebug(testbox);
      
    }
  });

  function resize() {
    const scaleX = window.innerWidth * 0.65 / GAME_WIDTH;
    const scaleY = window.innerHeight * 0.65 / GAME_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    gameContainer.scale.set(scale);

    gameContainer.x = (window.innerWidth - GAME_WIDTH * scale) / 2;
    gameContainer.y = (window.innerHeight - GAME_HEIGHT * scale) / 2;
  }

  window.addEventListener('resize', resize);
  resize();

})();


