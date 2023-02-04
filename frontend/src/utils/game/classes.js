import { Howl, Howler } from "howler";

import running from "../../assets/sounds/running.mp3";
import blade_hit from "../../assets/sounds/blade_hit.wav";
import Whoosh from "../../assets/sounds/Whoosh.mp3";
import Death from "../../assets/sounds/Death.mp3";

export class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    framesHold,
  }) {
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc;
    this.sounds = {
      // runningSound: new Howl({
      //   src: [running],
      //   loop: true,
      // }),
      // blade_hitSound: new Howl({
      //   src: [blade_hit],
      // }),
      // whooshSound: new Howl({
      //   src: [Whoosh],
      // }),

      death: new Howl({
        src: [Death],
      }),
    };
    this.scale = scale;
    this.framesMax = framesMax;

    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = framesHold;
    this.offset = offset;
  }

  draw(c, scale, type) {
    // if (type === 1) {
    //   console.log("isOne");
    //   console.log(scale);
    //   c.drawImage(
    //     this.image,
    //     this.framesCurrent * (this.image.width / this.framesMax),
    //     0,
    //     this.image.width / this.framesMax,
    //     this.image.height,
    //     // this.position.x - this.offset.x,
    //     // this.position.y - this.offset.y,
    //     // (this.image.width / this.framesMax) * this.scale,
    //     // this.image.height * this.scale
    //     this.position.x * scale - this.offset.x * scale,
    //     this.position.y * scale - this.offset.y * scale,
    //     (this.image.width / this.framesMax) * this.scale * scale,
    //     this.image.height * this.scale * scale
    //   );
    // }
    c.drawImage(
      this.image,
      this.framesCurrent * (this.image.width / this.framesMax),
      0,
      this.image.width / this.framesMax,
      this.image.height,
      // this.position.x - this.offset.x,
      // this.position.y - this.offset.y,
      // (this.image.width / this.framesMax) * this.scale,
      // this.image.height * this.scale
      this.position.x * scale - this.offset.x * scale,
      this.position.y * scale - this.offset.y * scale,
      (this.image.width / this.framesMax) * this.scale * scale,
      this.image.height * this.scale * scale
    );
  }
  animateFrames() {
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }
  updateFrames(c, scale, type) {
    this.draw(c, scale, type);
    this.animateFrames();
  }
}

export class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = "red",
    imageSrc,
    scale = 1,
    framesMax = 1,
    framesHold,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = {
      offset: { x: 0, y: 0 },
      width: 0,
      height: 0,
    },
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      framesHold,
      offset,
    });
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    // this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    };

    this.color = color;
    // this.isAttacking;
    this.health = 100;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = framesHold;
    this.sprites = sprites;
    this.death = false;
    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image();
      sprites[sprite].image.src = sprites[sprite].imageSrc;
    }
  }

  updateFrames(c, scale) {
    if (!scale) {
      this.draw(c, 1);
    }
    this.draw(c, scale);

    if (this.death) return;
    this.animateFrames();
  }

  updateActions({ position, imageName, death }) {
    // UPDATE POSITION
    this.position.y = position.y;
    this.position.x = position.x;

    // UPDATE FRAMS
    this.switchSprite(imageName);

    // ATTACK BOXES
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
  }

  switchSprite(imageName) {
    if (imageName !== "run") {
      // this.loopRunning("over");
    }

    if (this.image === this.sprites.death.image) {
      // death
      if (this.framesCurrent === this.sprites.death.framesMax - 1)
        this.death = true;
      return;
    }
    // attack
    if (
      this.image === this.sprites.attack1.image &&
      this.framesCurrent < this.sprites.attack1.framesMax - 1
    )
      return;
    // takeHit
    if (
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.framesMax - 1
    )
      return;
    switch (imageName) {
      case "idle":
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image;
          this.framesMax = this.sprites.idle.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "run":
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image;
          this.framesMax = this.sprites.run.framesMax;
          this.framesCurrent = 0;
          // this.loopRunning("start");
        }
        break;
      case "jump":
        if (this.image !== this.sprites.jump.image) {
          this.framesMax = this.sprites.jump.framesMax;
          this.image = this.sprites.jump.image;
          this.framesCurrent = 0;
        }
        break;
      case "fall":
        if (this.image !== this.sprites.fall.image) {
          this.framesMax = this.sprites.fall.framesMax;
          this.image = this.sprites.fall.image;
          this.framesCurrent = 0;
        }
        break;
      case "attack1":
        if (this.image !== this.sprites.attack1.image) {
          // this.sounds.whooshSound.play();
          this.framesMax = this.sprites.attack1.framesMax;
          this.image = this.sprites.attack1.image;
          this.framesCurrent = 0;
        }
        break;
      case "takeHit":
        if (this.image !== this.sprites.takeHit.image) {
          // this.sounds.blade_hitSound.play();
          this.framesMax = this.sprites.takeHit.framesMax;
          this.image = this.sprites.takeHit.image;
          this.framesCurrent = 0;
        }
        break;
      case "death":
        if (this.image !== this.sprites.death.image) {
          this.loopDeath("start");
          const delayDeath = delayFuncFactory(() => {
            this.framesMax = this.sprites.death.framesMax;
            this.image = this.sprites.death.image;
            this.framesCurrent = 0;
          });
          delayDeath();
        }
        break;
      default:
        break;
    }
  }

  loopRunning = loopBase((type) => {
    if (type === "start") {
      this.sounds.runningSound.play();
      return;
    }
    if (type === "over") {
      // this.sounds.runningSound.stop();
      return;
    }
  });
  loopDeath = loopBase((type) => {
    if (type === "start") {
      this.sounds.death.play();
      return;
    }
    if (type === "over") {
      this.sounds.death.stop();
      return;
    }
  });
}

function loopBase(cb) {
  let execute = true;
  return (type) => {
    if (type === "over") {
      execute = true;
      cb(type);
      return;
    }
    if (type === "start") {
      if (!execute) return;
      execute = false;
      cb(type);
    }
  };
}

/// DELAY FUNCTIONS
export const delayFuncFactory = (callBack) => {
  let frame = 0;
  let animate;
  const frameHold = 5;
  const framesElapse = 3;
  return (animate = () => {
    frame += 1;
    if (frame === frameHold * framesElapse) {
      callBack();
      return;
    }
    requestAnimationFrame(animate);
  });
};
