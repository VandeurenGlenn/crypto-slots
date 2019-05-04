import define from './../node_modules/backed/src/utils/define.js';
import CSSMixin from './../node_modules/backed/src/mixins/css-mixin.js';
import RenderMixin from './../node_modules/custom-renderer-mixin/src/render-mixin.js';

window.slotsAPI = window.slotsAPI || {};
window.slotsAPI.amount = {
  get: async () => Promise.resolve(localStorage.getItem('amount')),
  set: async amount => Promise.resolve(localStorage.setItem('amount', amount))
}

export default define(class CryptoSlots extends CSSMixin(RenderMixin(HTMLElement)) {
  constructor() {
    super();
    window.slots = new Map();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    (async () => {
      await import('./slots/default-slot.js');
      this.amount = await slotsAPI.amount.get();
      this.shadowRoot.querySelector('.amount').innerHTML = this.amount;

      document.addEventListener('spin-end', async () => {        
        this.amount = await slotsAPI.amount.get();
        this.shadowRoot.querySelector('.amount').innerHTML = this.amount;
      });
    })();
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: #263238;
    color: #fff;
    font-size: 16px;
  }
  header {
    display: flex;
    height: 56px;
    width: 100%;
    align-items: center;
    background: #37474fba;
    padding: 0 12px;
    box-sizing: border-box;
  }
  .hero {
    mixin(--css-hero)
    max-height: 500px;
    overflow: hidden;
  }
  a {
    text-decoration: none;
    cursor: pointer;
    color: #c5cae9;
  }
  footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 40px;
    font-size: 12px;
  }
  apply(--css-flex)
</style>
<header>
  <span class="flex"></span>
  <span class="amount"></span>
  <span class="flex"></span>
</header>
<default-slot></default-slot>
<footer>
  <span>&#169; 2019 Glenn Vandeuren. Code licensed under the <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC-BY-NC-SA-4.0</a> License.</span>
</footer>`;
  }
})
