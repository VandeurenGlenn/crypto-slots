import define from './../node_modules/backed/src/utils/define.js';
import CSSMixin from './../node_modules/backed/src/mixins/css-mixin.js';
import RenderMixin from './../node_modules/custom-renderer-mixin/src/render-mixin.js';

export default define(class CustomSelectButton extends CSSMixin(RenderMixin(HTMLElement)) {
  set checked(value) {
    if (value) this.setAttribute('checked', '');
    else this.removeAttribute('checked');
  }

  get checked() {
    return this.hasAttribute('checked');
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open'});
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.addEventListener('click', this._onClick);
  }

  _onClick() {
    this.checked = !this.checked;
  }

  get template() {
    return html`<style>
:host {
  display: flex;
  border-radius: 24px;
  height: 48px;
  width: 96px;
  font-size: 16px;
  text-transform: uppercase;
  color: #fff;
  border-color: #7986cb;
  outline: none;
  user-select: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
:host([checked]) {
  background: #7986cb;
}
</style>
<slot></slot>`;
  }
})
