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
  win() {
    this.line.style.background = '#fff';
    this.line.style.height = Number(document.body.style.getPropertyValue('--slot-ring-slot-size').replace('px', '')) / 4 + 'px';
    this.line.style.width = '2px';
    this.line.style.display = 'block';
    this.line.style.zIndex = '100';
    this.line.style.position = 'absolute';
    this.line.style.top = '50%';
    this.line.style.left = '50%';
    this.line.style.transform = 'translate(-50%, -50%)';
    return new Promise((resolve, reject) => {
      this._animation.onfinish = () => {
        resolve();
      }
      this._lineAnimation.play();
      this._animation.play();
    });
  }
  set index(value) {
    this.setAttribute('index', value);
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.line = document.createElement('span');
    this.shadowRoot.appendChild(this.line)
    this._lineAnimation = this.line.animate(
      [
        { transform: 'none', filter: 'blur(0)' },
        {
          transform: `translateY(-50%) scaleY(2)`,
          filter: 'blur(0)',
        },
        {
          transform: `translateY(-50%) scaleY(4)`,
          filter: 'blur(0)',
        },
      ],
      {
        duration: 250,
        easing: 'ease-in-out',
        fill: 'forwards'
      },
    );
    this._lineAnimation.cancel();
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

    this._animation = this.animate(
      [
        { transform: 'none', filter: 'blur(0)' },
        { filter: 'blur(2px)', offset: 0.5 },
        {
          transform: `scale(1.2)`,
          filter: 'blur(10px)',
        },
        {
          transform: `scale(1)`,
          filter: 'blur(0)',
        },
      ],
      {
        duration: 500,
        easing: 'ease-in-out',
        fill: 'forwards'
      },
    );
    this._animation.cancel();
  }
})
