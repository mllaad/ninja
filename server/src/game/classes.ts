const gravity = 2;
const canvasWidth = 1024;
const canvasHeight = 579;
import { delayActionsFactory } from "./utils.js";

export class Timer {
  time: number;
  constructor(time: number) {
    this.time = time;
  }
  decrease() {
    if (this.time == 0) return;
    setTimeout(() => {
      this.decrease();
    }, 1000);
    this.time--;
  }
}

export class Fighter {
  position: { x: number; y: number };
  width: number;
  height: number;
  velocity: { x: number; y: number };
  health: number;
  lastKey?: string;
  isAttacking: boolean;
  speed: number;
  takeDamage: number;
  death: boolean;
  imageName: string;
  takeHit: boolean;
  delays: { attack: () => void; jump: () => void; takeHit: () => void };
  bladeComingOutFromSword: boolean;
  attackBox: {
    position: { x: number; y: number };
    offset: { x: number; y: number };
    width: number;
    height: number;
  };
  keys: {
    a: { pressed: boolean };
    d: { pressed: boolean };
    w: { pressed: boolean };
    space: { pressed: boolean };
  };
  constructor({
    takeDamage,
    position,
    velocity,
    scale = 1,
    offset = { x: 0, y: 0 },
    attackBox = {
      position: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      width: 0,
      height: 0,
    },
    speed,
  }: {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    scale: number;

    offset: { x: number; y: number };
    attackBox: {
      position: { x: number; y: number };
      offset: { x: number; y: number };
      width: number;
      height: number;
    };
    speed: number;
    takeDamage: number;
  }) {
    this.width = 50;
    this.height = 150;
    this.position = { x: position.x, y: position.y };
    this.velocity = velocity;
    this.speed = speed;

    // SOWRD
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    };

    // SPRITE ACTION
    this.imageName = "idle";

    // KEYS
    this.lastKey;
    this.keys = {
      a: {
        pressed: false,
      },
      d: {
        pressed: false,
      },
      w: {
        pressed: false,
      },
      space: {
        pressed: false,
      },
    };

    // ATTACK ...
    this.health = 100;
    this.takeHit = false;
    this.isAttacking = false;
    this.bladeComingOutFromSword = false;
    this.takeDamage = takeDamage;
    this.death = false;

    // INIT ALL DELAYS METHODS
    this.delays = {
      // DELAY ATTACK (BEFORE START, WHEN SOWRD COMES OUT, BETWEEN ATTACKS)
      attack: delayActionsFactory(() => {
        setTimeout(() => {
          // START ATTACK
          this.isAttacking = true;
          setTimeout(() => {
            // BLADE GET OUT FROM SWORD <TAKE HIT>
            this.bladeComingOutFromSword = true;
          }, 200);
        }, 200);
      }, 900),
      // JUMP
      jump: delayActionsFactory(() => {
        this.velocity.y = -40;
      }, 1000),
      // HITS
      takeHit: delayActionsFactory(() => {
        this.health -= 10;
        if (this.health <= 0) return (this.imageName = "death");
        this.imageName = "takeHit";
      }),
    };
  }
  // *********_________ METHODS________**********
  update() {
    if (this.death) return;

    // IDLE
    this.imageName = "idle";
    // RUN TO LEFT
    if (this.keys.a.pressed && this.lastKey === "a") {
      this.velocity.x = -this.speed;
      this.imageName = "run";
    }
    // RUNN TO RIGHT
    if (this.keys.d.pressed && this.lastKey === "d") {
      this.velocity.x = this.speed;
      this.imageName = "run";
    }
    // JUMP
    if (this.velocity.y < 0) {
      this.imageName = "jump";
    }
    // FALL
    if (this.velocity.y > 0) {
      this.imageName = "fall";
    }
    // ATTACK
    if (this.isAttacking) {
      this.imageName = "attack1";
    }
    // DEFINE ATTACK BUT TAKE THE HIT WHEN BLADE COMES OUT FROM SWORD
    if (this.bladeComingOutFromSword) {
      this.isAttacking = false;
      this.bladeComingOutFromSword = false;
    }

    // TAKE HIT
    if (this.takeHit) {
      this.health -= this.takeDamage;
      if (this.health <= 0) {
        this.imageName = "death";
        this.death = true;
      } else {
        this.imageName = "takeHit";
      }
      this.takeHit = false;
    }

    // RUNNING AND PREVENT *INFNITE* RUNNING AND BE INSIDE OF CANVAS
    if (
      this.position.x + this.velocity.x >= 0 &&
      this.position.x + this.velocity.x <= canvasWidth - 100
    ) {
      this.position.x += this.velocity.x;
      this.velocity.x = 0;
    }
    // TAKE DAMAGE IF ...
    if (this.position.x <= 0 || this.position.x > canvasWidth - 150) {
      this.delays.takeHit();
    }

    // JUMP AND GRAVITY
    this.velocity.y += gravity;
    this.position.y += this.velocity.y;
    if (this.position.y + this.height + this.velocity.y >= canvasHeight - 100) {
      this.velocity.y = 0;
      this.position.y = 330;
    }

    // ATTACK BOXES
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
  }

  moveLeft() {
    this.keys.a.pressed = true;
    this.lastKey = "a";
  }
  moveRight() {
    this.keys.d.pressed = true;
    this.lastKey = "d";
  }
  jump() {
    this.delays.jump();
  }
  attack() {
    this.lastKey = "space";
    this.delays.attack();
  }
}
