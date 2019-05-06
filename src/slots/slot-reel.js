import define from './../../node_modules/backed/src/utils/define.js';
import { lottery } from './../../node_modules/lucky-numbers/index.js';

import './slot-ring.js';

export default define(class SlotReel extends HTMLElement {
  set name(value) {
    let i = 0;
    for (const ring of this.rings) {
    ring.index = i;
      ring.name = value;
      ++i;
    }

    this._name = value;

  }
  set value(value) {

  }
  get value() {

  }
  set icon(value) {

  }

  showBonusRound() {
    return new Promise((resolve, reject) => {
      this.bonusHero.classList.add('opened');
      setTimeout(() => {
        this.bonusHero.classList.remove('opened');
        resolve();
      }, 2000);
    });
  }

  promisSpins() {
    return new Promise(async (resolve, reject) => {
    // await this.multiplier.forEach(async multi => {
      this.wins += await this.spin(this.betAmount);
      --this.multiplier;
      if (this.multiplier > 1) await this.promisSpins();
      resolve();
      // })
    });
  }

  promiseFil(slot, joker) {
    return new Promise((resolve, reject) => {
      for (const child of slot) {
        const fil = slot.filter(r => {
          if (child._name === r._name || r._name === joker) return true;
          return false;
        });
        if (fil.length === 5) return resolve(fil);
      }
      resolve([])
    });
  }

  promiseResult(fil) {
    const multiplier = Number(this.game.multiplier);
    return new Promise(async (resolve, reject) => {
      const spins = []
      if (fil.length === 5) {
        const result = fil.filter(f => {
          if (f._name !== 'btc') return f;
        });
        for (const f of fil) {
          await f.win();
        }
        if (result.length === 0) {
          this.multiplier = this.multiplier * multiplier;
          await this.showBonusRound();
          await this.promisSpins();
          this.multiplier = 1;
          this.winAmount = this.wins;
          this.wins = 0;
          resolve(this.winAmount);
        } else {
          // console.log();
          console.log(this.winAmount, Math.round((this.multiplier * this.bet)));
          this.winAmount += Math.round((this.multiplier * this.bet ));
          console.log(this.winAmount);
          resolve(this.winAmount)
        }
      } else {
        resolve(this.winAmount)
      }
    });
  }

  async onSpinEnd(rings) {
    this.game = window.slots.get(this._name);
    const s = this.game.slots;
    const joker = this.game.bonus;
    const wins = this.game.wins;
    const horizontalRings = [];
    for (let i = 0; i < rings.length; ++i) {
      if (!horizontalRings[i]) horizontalRings[i] = [];
      horizontalRings[i].push(rings[i])
    }
    for (var i = 0; i < horizontalRings.length; i++) {
      rings.push(horizontalRings[i])
    }
    for (const slot of rings) {
      const fil = await this.promiseFil(slot, joker);
      const result = await this.promiseResult(fil);
    }
    this.amount = Number(localStorage.getItem('amount')) + this.winAmount;
    localStorage.setItem('amount', this.amount);
    document.dispatchEvent(new CustomEvent('spin-end'));

    console.log({win: this.winAmount});
    this.wins += this.winAmount;
    // this.multiplier = 1;
    this.winAmount = 0;
    console.log('END');
  }
  async spin(bet) {
    this.bet = bet;

    console.log('START');

    this.currentSymbols = this.nextSymbols || [
      lottery(3, 12),
      lottery(3, 12),
      lottery(3, 12),
      lottery(3, 12),
      lottery(3, 12),
    ];
    this.nextSymbols = [
      lottery(3, 12),
      lottery(3, 12),
      lottery(3, 12),
      lottery(3, 12),
      lottery(3, 12),
    ];

    return Promise.all(
      this.rings.map((ring, i) => {
        return ring.renderSymbols(
          this.currentSymbols[i],
          this.nextSymbols[i],
        );
        // return ring.spin();
      }),
    ).then(resolved => this.onSpinEnd(resolved));

  }
  get bonusHero() {
    return this.shadowRoot.querySelector('.bonus-hero');
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.multiplier = 1;
    this.winAmount = 0;
    this.wins = 0;
    this.shadowRoot.innerHTML = `<style>
      :host, .container {
        display: flex;
        flex-direction: row;
        background: #37474fba;
        border-radius: 8%;
        /* width: calc(100% - 80px); */
      }
      :host {
        box-shadow: 15px -15px 20px 0px #5C6BC0, 15px 15px 20px 0px #7986CB, -15px 15px 20px 0px #5C6BC0, -15px -15px 20px 0px #7986CB;
      }
      .container {
        width: var(--slot-reel-size);
        height: var(--slot-reel-size);
        overflow: hidden;
        border-radius: 8%;
      }
      slot-ring {
        /* position: absolute; */
        top: 0;
        bottom: 0;
      }
      .bonus-hero {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 240px;
        width: 240px;
        background: #fff;
        opacity: 0;
        pointer-events: none;
      }
      .opened {
        opacity: 1;
      }
    </style>
    <span class="container">
      <slot-ring slots="12"></slot-ring>
      <slot-ring slots="12"></slot-ring>
      <slot-ring slots="12"></slot-ring>
      <slot-ring slots="12"></slot-ring>
      <slot-ring slots="12"></slot-ring>
    </span>

    <span class="bonus-hero">
      <h2>Bonus Round!</h2>
    </span>
    `;

    this.rings = Array.from(this.shadowRoot.querySelectorAll('slot-ring'));
  }

  connectedCallback() {
    const matches = (x) => {
      const { height, width } = document.body.getBoundingClientRect();
      let ringSlotHeight = height / 5;
      let ringSlotWidth = width / 5;
      if (!x.matches) {
        // width = width - 15;
        // ringSlotWidth = width / 5;
        document.body.style.setProperty('--slot-reel-size', `${width - 60}px`);
        document.body.style.setProperty('--slot-ring-width', '100%');
        document.body.style.setProperty('--slot-ring-height', '100%');
        document.body.style.setProperty('--slot-ring-slot-size', `${ringSlotWidth - 12}px`);
      } else {
        ringSlotHeight = height - 320;
        document.body.style.setProperty('--slot-reel-size', `${ringSlotHeight}px`);
        document.body.style.setProperty('--slot-ring-slot-size', `${ringSlotHeight / 5}px`);
      }
    }

    var x = window.matchMedia("(min-width: 640px)");
    matches(x)
    x.addListener(matches)
  }
})
