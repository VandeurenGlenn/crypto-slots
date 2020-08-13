var slotsView = customElements.define('slots-view', class SlotsView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = this.template;
    
    this._onClick = this._onClick.bind(this);
  }
  
  connectedCallback() {
    this.addEventListener('click', this._onClick);
  }
  
  async _onClick(event) {
    const target = event.composedPath()[0];
    if (target.dataset.gameName) {
      await loadGame(target.dataset.gameName);
      
      this.removeEventListener('click', this._onClick);
      // TODO: remove from dom?
      this.parentElement.removeChild(this);
    }
  }
  
  get template() {
    return `<style>
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        display: flex;
        flex-flow: row wrap;        
        justify-content: space-between;
        width: 100%;
        max-width: 640px;
      }
      
      .item {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center;
        box-sizing: border-box;
        padding: 24px;
        border: 1px solid #eee;
        border-radius: 24px;
      }
      @media (min-width: 640px) {
        .item {
          width: 50%;
        }
      }
    </style>
    
    <span class="container">
      <span class="item" data-game-name="onebythree">
        <h3>One By Three</h3>
        <img alt="1x3"></img>
      </span>
      
      <span class="item" data-game-name="default">
        <h3>Five By Five</h3>
        <img alt="5x5"></img>
      </span>
    </span>
    `
  }
});

export default slotsView;
