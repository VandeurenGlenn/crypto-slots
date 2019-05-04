import define from './../../node_modules/backed/src/utils/define.js';

export default define(class SlotIcon extends HTMLElement {
  set value(value) {

  }
  get value() {

  }
  set icon(value) {
    this.shadowRoot.querySelector('img').src = value;
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
      }
      img {
        width: inherit;
        height: inherit;
        padding: 12px;
        box-sizing: border-box;
      }

    </style>
    <img></img>
    `;
  }
})
