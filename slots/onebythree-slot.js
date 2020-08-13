import { a as define, c as onebythree } from './chunk-5b0336e0.js';

var onebythreeSlot = define(class OnebythreeSlot extends HTMLElement {
  get icons() {
    return [
      onebythree.slots
    ]
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    window.slots.set('onebythree', onebythree);
    this.shadowRoot.innerHTML = `
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;

  }
  .row {
    display: flex;
    width: 100%;
  }
  .column {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .flex {
    flex: 1;
  }
  .toolbar {
    height: 154px;
    align-items: center;
    justify-content: flex-end;
  }

  button {
    background: transparent;
    border-radius: 24px;
    min-height: 48px;
    height: 48px;
    min-width: 96px;
    width: 96px;
    font-size: 16px;
    text-transform: uppercase;
    color: #fff;
    border-color: #7986cb;
    outline: none;
    user-select: none;
    cursor: pointer;
  }
  .spin-button {
    display: flex;
    align-items: center;
    min-height: 56px;
    height: 56px;
    min-width: 140px;
  }
  custom-selector > .custom-selected {
    background: #7986cb;
  }
  custom-select-button {
    width: 56px;
    height: 56px;
    border-radius: 24px;
    border-right: 2px solid;
    border-color: #7986cb;
    margin-left: -8px;
    margin-top: -3px;
  }
  /* slot-reel {
    position: absolute;
    top: 164px;
  } */
</style>
<slot-reel name="onebythree"></slot-reel>

<span class="toolbar column">
<span class="row">
  <span class="flex"></span>
  <custom-selector attr-for-selected="bet-amount">
    <button bet-amount="1">1</button>
    <button bet-amount="5">5</button>
    <button bet-amount="10">10</button>
  </custom-selector>
  <span class="flex"></span>
</span>
  <span class="row">
    <span class="flex"></span>
    <button class="spin-button">
      <custom-select-button class="auto-spin">
        <custom-svg-icon icon="autospin"></custom-svg-icon>
      </custom-select-button>
      <span class="flex"></span>spin<span class="flex"></span></button>

    <span class="flex"></span>
  </span>
</span>`;

    this.shadowRoot.querySelector('slot-reel').name = 'onebythree';
  }

  get slotReel() {
    return this.shadowRoot.querySelector('slot-reel');
  }

  get selector() {
    return this.shadowRoot.querySelector('custom-selector');
  }

  connectedCallback() {
    this.betAmount = 1;

    this.selector.addEventListener('selected', () => {
      this.betAmount = Number(this.selector.selected);
    });

    if (super.connectedCallback) super.connectedCallback();
    document.addEventListener('spin-end', () => {
      this.amount = localStorage.getItem('amount');
      // this.shadowRoot.querySelector('.amount').innerHTML = this.amount;
      if (this.shadowRoot.querySelector('.auto-spin').checked && Number(this.amount) > this.betAmount) {
        setTimeout(() => {
          this.amount = Number(this.amount) - Number(this.betAmount);
          localStorage.setItem('amount', this.amount);
          this.shadowRoot.querySelector('slot-reel').spin(this.betAmount);
        }, 2200);
      }
    });
    this.shadowRoot.querySelector('.spin-button').addEventListener('click', () => {
      this.amount = localStorage.getItem('amount');
      if (this.amount === null) this.amount = 500;
      if (this.betAmount <= this.amount) {
        this.amount = Number(this.amount) - Number(this.betAmount);
        localStorage.setItem('amount', this.amount);
        this.shadowRoot.querySelector('slot-reel').spin(this.betAmount);
      }
    });
  }
});

export default onebythreeSlot;
