import define from './../../node_modules/backed/src/utils/define.js';
import './slot-ring-slot.js';
import { lottery } from './../../node_modules/lucky-numbers/index.js';

export default define(class SlotRing extends HTMLElement {
  set name(value) {
    this._name = value;
    this.load();
  }
  set value(value) {

  }
  get value() {

  }
  set icon(value) {

  }
  get slots() {
    return this.getAttribute('slots') || 5;
  }
  get slotAngle() {
    return 360 / Number(this.slots);
  }

  get ringSlotHeight() {
    return window.slots.get(this._name).slotHeight;
  }

  get reelRadius() {
    return Math.round( ( this.ringSlotHeight / 2) / Math.tan( Math.PI / Number(this.slots)) );
    // return 187;
  }
  get container() {
    return this.shadowRoot.querySelector('.container')
  }
  set index(value) {
    this._index = value;
    this.style.setProperty('--slot-ring-left', (value * 100) + 'px');
  }
  get index() {
    return this._index || 0;
  }
  async renderSymbols(currentSymbols, nextSymbols) {
    return new Promise((resolve, reject) => {
      if (!this.rollTime) this.rollTime = lottery(1, 300);
      const slots = window.slots.get(this._name).slots;
      let slot;
      let spins = [];

      return requestAnimationFrame(async () => {
        this.container.firstChild.remove();
        slot = document.createElement('slot-ring-slot');
        const _icon = nextSymbols[lottery(1, 3)[0]];
        slot.name = slots[_icon];
        slot.icon = `assets/${slots[_icon]}.svg`;
        for (const spin of spins) {
          await spin();
        }
        spins.push(slot.spin);
        this.container.appendChild(slot);
        if (this.runs <= this.rollTime) {
          this.runs += 1;
          return resolve(await this.renderSymbols(currentSymbols, nextSymbols))
        } else {
          const max = this.container.children.length - 5;
          for (let i = 0; i < max; ++i) {
            this.container.firstChild.remove();
          }
          this.runs = 0;
          this.rollTime = 0;
          resolve(Array.from(this.shadowRoot.querySelectorAll('slot-ring-slot')));
        };
      });
    })

  }

  get factor() {
    return 1 + Math.pow(this.index / 2, 2);
  }

  load(items) {
    let i = 0;
    const seeds = lottery(5, 12);
    const slots = window.slots.get(this._name).slots;
    for (let i = 0; i < seeds.length; ++i) {
      const slot = document.createElement('slot-ring-slot');
      slot.name = slots[seeds[i]];
      slot.icon = `assets/${slots[seeds[i]]}.svg`;

      this.container.appendChild(slot);
    }
  }
  constructor() {
    super();
    this.runs = 0;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>
      :host, .container {
        display: block;
        display: flex;
        flex-direction: column;
        height: var(--slot-ring-height);
        width: var(--slot-ring-width);
      }
    </style>
    <span class="container">
      <slot></slot>
    </span>
    `;
  }
})
