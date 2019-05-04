import define from './../../node_modules/backed/src/utils/define.js';
import './slot-icon.js';
let animation;
export default define(class SlotRingSlot extends HTMLElement {
  set name(value) {
    this._name = value
  }
  set value(value) {

  }
  get value() {

  }
  set icon(value) {
    this.shadowRoot.querySelector('slot-icon').icon = value;
  }
  spin() {
    return new Promise((resolve, reject) => {
      animation.onend(() => {
        resolve();
      })
      animation.play();
    });
  }
  set index(value) {
    this.setAttribute('index', value);
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>
      :host {
        display: flex;
        width: var(--slot-ring-slot-size);
        height: var(--slot-ring-slot-size);
        box-sizing: border-box;
        opacity: 0.9;
      }
      slot-icon {
        width: var(--slot-ring-slot-size);
        height: var(--slot-ring-slot-size);
      }
    </style>

    <slot-icon></slot-icon>
    `;

    animation = this.animate(
      [
        { transform: 'none', filter: 'blur(0)' },
        { filter: 'blur(2px)', offset: 0.5 },
        {
          transform: `translateY(100%)`,
          filter: 'blur(0)',
        },
      ],
      {
        duration: 1000,
        easing: 'ease-in-out',
        fill: 'forwards'
      },
    );
    animation.cancel();
  }
})
