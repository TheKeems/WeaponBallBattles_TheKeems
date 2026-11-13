import { Application, Assets, Graphics, Container, Text } from "pixi.js";
import manifest from "./manifest.json";
import { Ball, BallConfig, Hitbox } from "../scripts/index";
import { hitboxthatdoesnothing } from "../scripts/hitboxthatdoesnothing";

const BORDER_PADDING = 40;
const BORDER_WIDTH = 4;
const GAME_HEIGHT = 800;
const GAME_WIDTH = 800;
const CELL_SIZE = GAME_HEIGHT / 5;
let timeFlow = true;
export let collisionMatrix: Ball[][][] = [[[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []]];

export interface appBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  cell_size: number;
}

let id = 0;
const app = new Application();
const displays = new Container();
const gameContainer = new Container();
export let ballsconfig: Record<string, BallConfig>;
export let gameBounds: appBounds;
export const debugGfx = new Graphics();
export let balls: Record<number, Ball> = {};
export let ballDisplays: Record<number, Text> = {};

export function setTimeflow(b: boolean) {
  timeFlow = b;
}

export function removeFromArr<T>(arr: Array<T>, obj: T) {
  const target = arr.findIndex((ob: T) => ob === obj);
  if (target !== -1) arr.splice(target, 1);
}
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function removeBall(id: number) {
  ballDisplays[id].removeFromParent();
  delete ballDisplays[id];
  delete balls[id];
}

export async function addBall(name: string, team?: number, health?: number) {
  const b = new Ball(name, id, team, health);
  const t = new Text({ text: b.title });
  //await Assets.loadBundle(name);

  ballDisplays[id] = t;
  balls[id] = b;

  gameContainer.addChild(b);
  displays.addChild(t);

  t.y += 24 * (id + 1);

  id++;
}

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

async function init() {
  await app.init({
    background: "#ffffff",
    resizeTo: window,
    antialias: true,
  });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  app.stage.addChild(gameContainer);
  gameContainer.addChild(displays);

  await Assets.init({ manifest, basePath: "assets" });
  await Assets.loadBundle("main");
  ballsconfig = Assets.get("balls.json");

  const border = new Graphics();
  gameContainer.addChild(border);

  gameBounds = { left: 0, top: 0, right: 0, bottom: 0, width: GAME_WIDTH, height: GAME_HEIGHT, cell_size: CELL_SIZE };

  function layout() {
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

  function resizeContainer(c: Container, s: number, x: number = 0, y: number = 0) {
    const scaleX = window.innerWidth * s / GAME_WIDTH;
    const scaleY = window.innerHeight * s / GAME_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    c.scale.set(scale);

    c.x = (window.innerWidth - GAME_WIDTH * scale) / 2 + x * window.innerWidth / 2;
    c.y = (window.innerHeight - GAME_HEIGHT * scale) / 2 + y * window.innerHeight / 2;
  }

  //addBall("unarmed", 1, 250);
  addBall("sword", 0, 250);
  addBall("unarmed", 1, 250);
  addBall("verity", 2, 250);

  const displayTitle = new Text({ text: "Current Balls:" });
  displays.addChild(displayTitle);

  displays.x = gameContainer.x + GAME_WIDTH + 50;

  //const testbox = new hitboxthatdoesnothing(100, 100, "empty.png", 150, 35, hitboxShape.RECT, -0.1, 0.5);
  //^ DO NOT DELETE USED FOR TESTING

  layout();

  app.stage.addChild(debugGfx);

  app.ticker.add((ticker) => {
    if (timeFlow) {
      debugGfx.clear();
      //drawHitboxDebug(testbox);
      for (const [key, ball] of Object.entries(balls)) {
        ball.update(ticker.deltaTime, ticker.deltaMS);
      }
    }
  });

  //window.addEventListener('resize', resize);
  window.addEventListener('resize', () => {
    resizeContainer(gameContainer, 0.65);
    //resizeContainer(displays, 0.65, 0.2, 0.3);
  });
  //resize();
  resizeContainer(gameContainer, 0.65);
  //resizeContainer(displays, 0.65, 0.2, 0.3);

};

const startButton = document.getElementById('start');

if (startButton) {
  startButton.addEventListener('click', async () => {
    init();
    startButton.remove();
  });
}





