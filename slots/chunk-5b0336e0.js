/**
 * Add space between camelCase text.
 */
var unCamelCase = (string) => {
  string = string.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
  string = string.toLowerCase();
  return string;
};

/**
* Replaces all accented chars with regular ones
*/
var replaceAccents = (string) => {
  // verifies if the String has accents and replace them
  if (string.search(/[\xC0-\xFF]/g) > -1) {
      string = string
              .replace(/[\xC0-\xC5]/g, 'A')
              .replace(/[\xC6]/g, 'AE')
              .replace(/[\xC7]/g, 'C')
              .replace(/[\xC8-\xCB]/g, 'E')
              .replace(/[\xCC-\xCF]/g, 'I')
              .replace(/[\xD0]/g, 'D')
              .replace(/[\xD1]/g, 'N')
              .replace(/[\xD2-\xD6\xD8]/g, 'O')
              .replace(/[\xD9-\xDC]/g, 'U')
              .replace(/[\xDD]/g, 'Y')
              .replace(/[\xDE]/g, 'P')
              .replace(/[\xE0-\xE5]/g, 'a')
              .replace(/[\xE6]/g, 'ae')
              .replace(/[\xE7]/g, 'c')
              .replace(/[\xE8-\xEB]/g, 'e')
              .replace(/[\xEC-\xEF]/g, 'i')
              .replace(/[\xF1]/g, 'n')
              .replace(/[\xF2-\xF6\xF8]/g, 'o')
              .replace(/[\xF9-\xFC]/g, 'u')
              .replace(/[\xFE]/g, 'p')
              .replace(/[\xFD\xFF]/g, 'y');
  }

  return string;
};

var removeNonWord = (string) => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');

const WHITE_SPACES = [
    ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
    '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
    '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
    '\u205F', '\u3000'
];

/**
* Remove chars from beginning of string.
*/
var ltrim = (string, chars) => {
  chars = chars || WHITE_SPACES;

  let start = 0,
      len = string.length,
      charLen = chars.length,
      found = true,
      i, c;

  while (found && start < len) {
      found = false;
      i = -1;
      c = string.charAt(start);

      while (++i < charLen) {
          if (c === chars[i]) {
              found = true;
              start++;
              break;
          }
      }
  }

  return (start >= len) ? '' : string.substr(start, len);
};

/**
* Remove chars from end of string.
*/
var rtrim = (string, chars) => {
  chars = chars || WHITE_SPACES;

  var end = string.length - 1,
      charLen = chars.length,
      found = true,
      i, c;

  while (found && end >= 0) {
      found = false;
      i = -1;
      c = string.charAt(end);

      while (++i < charLen) {
          if (c === chars[i]) {
              found = true;
              end--;
              break;
          }
      }
  }

  return (end >= 0) ? string.substring(0, end + 1) : '';
};

/**
 * Remove white-spaces from beginning and end of string.
 */
var trim = (string, chars) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(string, chars), chars);
};

/**
 * Convert to lower case, remove accents, remove non-word chars and
 * replace spaces with the specified delimeter.
 * Does not split camelCase text.
 */
var slugify = (string, delimeter) => {
  if (delimeter == null) {
      delimeter = "-";
  }

  string = replaceAccents(string);
  string = removeNonWord(string);
  string = trim(string) //should come after removeNonWord
          .replace(/ +/g, delimeter) //replace spaces with delimeter
          .toLowerCase();
  return string;
};

/**
* Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
*/
var hyphenate = string => {
  string = unCamelCase(string);
  return slugify(string, "-");
};

const shouldRegister = name => {
  return customElements.get(name) ? false : true;
};

var define = klass => {
  const name = hyphenate(klass.name);
  return shouldRegister(name) ? customElements.define(name, klass) : '';
};

/**
 * @mixin Backed
 * @module utils
 * @export merge
 *
 * some-prop -> someProp
 *
 * @param {object} object The object to merge with
 * @param {object} source The object to merge
 * @return {object} merge result
 */
var merge = (object = {}, source = {}) => {
  // deep assign
  for (const key of Object.keys(object)) {
    if (source[key]) {
      Object.assign(object[key], source[key]);
    }
  }
  // assign the rest
  for (const key of Object.keys(source)) {
    if (!object[key]) {
      object[key] = source[key];
    }
  }
  return object;
};

window.Backed = window.Backed || {};
// binding does it's magic using the propertyStore ...
window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();

// TODO: Create & add global observer
var PropertyMixin = base => {
  return class PropertyMixin extends base {
    static get observedAttributes() {
      return Object.entries(this.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
    }

    get properties() {
      return customElements.get(this.localName).properties;
    }

    constructor() {
      super();
      if (this.properties) {
        for (const entry of Object.entries(this.properties)) {
          const { observer, reflect, renderer } = entry[1];
          // allways define property even when renderer is not found.
          this.defineProperty(entry[0], entry[1]);
        }
      }
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this.attributes)
        for (const attribute of this.attributes) {
          if (String(attribute.name).includes('on-')) {
            const fn = attribute.value;
            const name = attribute.name.replace('on-', '');
            this.addEventListener(String(name), event => {
              let target = event.path[0];
              while (!target.host) {
                target = target.parentNode;
              }
              if (target.host[fn]) {
                target.host[fn](event);
              }
            });
          }
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }

    /**
     * @param {function} options.observer callback function returns {instance, property, value}
     * @param {boolean} options.reflect when true, reflects value to attribute
     * @param {function} options.render callback function for renderer (example: usage with lit-html, {render: render(html, shadowRoot)})
     */
    defineProperty(property = null, {strict = false, observer, reflect = false, renderer, value}) {
      Object.defineProperty(this, property, {
        set(value) {
          if (value === this[`___${property}`]) return;
          this[`___${property}`] = value;

          if (reflect) {
            if (value) this.setAttribute(property, String(value));
            else this.removeAttribute(property);
          }

          if (observer) {
            if (observer in this) this[observer]();
            else console.warn(`observer::${observer} undefined`);
          }

          if (renderer) {
            const obj = {};
            obj[property] = value;
            if (renderer in this) this.render(obj, this[renderer]);
            else console.warn(`renderer::${renderer} undefined`);
          }

        },
        get() {
          return this[`___${property}`];
        },
        configurable: strict ? false : true
      });
      // check if attribute is defined and update property with it's value
      // else fallback to it's default value (if any)
      const attr = this.getAttribute(property);
      this[property] = attr || this.hasAttribute(property) || value;
    }
  }
};

var SelectMixin = base => {
  return class SelectMixin extends PropertyMixin(base) {

    static get properties() {
      return merge(super.properties, {
        selected: {
          value: 0,
          observer: '__selectedObserver__'
        }
      });
    }

    constructor() {
      super();
    }

    get slotted() {
      return this.shadowRoot ? this.shadowRoot.querySelector('slot') : this;
    }

    get _assignedNodes() {
      const nodes = 'assignedNodes' in this.slotted ? this.slotted.assignedNodes() : this.children;
      const arr = [];
      for (var i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType === 1) arr.push(node);
      }
      return arr;
    }

    /**
    * @return {String}
    */
    get attrForSelected() {
      return this.getAttribute('attr-for-selected') || 'name';
    }

    set attrForSelected(value) {
      this.setAttribute('attr-for-selected', value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        // check if value is number
        if (!isNaN(newValue)) {
          newValue = Number(newValue);
        }
        this[name] = newValue;
      }
    }

    /**
     * @param {string|number|HTMLElement} selected
     */
    select(selected) {
      if (selected) this.selected = selected;
      // TODO: fix selectedobservers
      if (this.multi) this.__selectedObserver__();
    }

    next(string) {
      const index = this.getIndexFor(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
          (index + 1) <= this._assignedNodes.length - 1) {
        this.selected = this._assignedNodes[index + 1];
      }
    }

    previous() {
      const index = this.getIndexFor(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
          (index - 1) >= 0) {
        this.selected = this._assignedNodes[index - 1];
      }
    }

    getIndexFor(element) {
      if (element && element instanceof HTMLElement === false)
        return console.error(`${element} is not an instanceof HTMLElement`);

      return this._assignedNodes.indexOf(element || this.selected);
    }

    _updateSelected(selected) {
      selected.classList.add('custom-selected');
      if (this.currentSelected && this.currentSelected !== selected) {
        this.currentSelected.classList.remove('custom-selected');
      }
      this.currentSelected = selected;
    }

    /**
     * @param {string|number|HTMLElement} change.value
     */
    __selectedObserver__(value) {
      const type = typeof this.selected;
      if (Array.isArray(this.selected)) {
        for (const child of this._assignedNodes) {
          if (child.nodeType === 1) {
            if (this.selected.indexOf(child.getAttribute(this.attrForSelected)) !== -1) {
              child.classList.add('custom-selected');
            } else {
              child.classList.remove('custom-selected');
            }
          }
        }
        return;
      } else if (type === 'object') return this._updateSelected(this.selected);
      else if (type === 'string') {
        for (const child of this._assignedNodes) {
          if (child.nodeType === 1) {
            if (child.getAttribute(this.attrForSelected) === this.selected) {
              return this._updateSelected(child);
            }
          }
        }
      } else {
        // set selected by index
        const child = this._assignedNodes[this.selected];
        if (child && child.nodeType === 1) this._updateSelected(child);
        // remove selected even when nothing found, better to return nothing
      }
    }
  }
};

var SelectorMixin = base => {
  return class SelectorMixin extends SelectMixin(base) {

  static get properties() {
      return merge(super.properties, {
        selected: {
          value: 0,
          observer: '__selectedObserver__'
        },
        multi: {
          value: false,
          reflect: true
        }
      });
    }
    constructor() {
      super();
    }
    connectedCallback() {
      super.connectedCallback();
      this._onClick = this._onClick.bind(this);
      this.addEventListener('click', this._onClick);
    }
    disconnectedCallback() {
      this.removeEventListener('click', this._onClick);
    }
    _onClick(event) {
      const target = event.path[0];
      const attr = target.getAttribute(this.attrForSelected);
      let selected;

      if (target.localName !== this.localName) {
        selected = attr ? attr : target;
      } else {
        selected = attr;
      }
      if (this.multi) {
        if (!Array.isArray(this.selected)) this.selected = [];
        const index = this.selected.indexOf(selected);
        if (index === -1) this.selected.push(selected);
        else this.selected.splice(index, 1);
        // trigger observer
        this.select(this.selected);

      } else this.selected = selected;

      this.dispatchEvent(new CustomEvent('selected', { detail: selected }));
    }
  }
};

const define$1  = klass => customElements.define('custom-selector', klass);
define$1(class CustomSelector extends SelectorMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = '<slot></slot>';
  }
});

const unique = arr => arr.filter((el, pos, arr) => {
  return arr.indexOf(el) == pos;
});

const between = (min, max, length = 1) => {
  let arr = [];
  for (let i = 0; i < length; i++) {
    arr = [...arr, Math.random() * (max - min) + min];
  }
  return arr;
};

const random = (max, length = 1) => {
  let arr = [];
  for (let i = 0; i < length; i++) {
    arr = [...arr, Math.floor(Math.random() * Math.floor(max))];
  }
  return arr;
};

/**
 *
 * @param {number} numbers - total of numbers to return
 * @param {number} max - maxumum value of biggest number
 * @param {number} length - set length to pick the numbers from
 *
 * @example
 * picks 7 random numbers out of a set with 100 random numbers
 * ```js
 * lottery(100, 7)
 * ```
 *
 * @example
 * picks 7 random numbers out of a set with 500 random numbers
 * ```js
 * lottery(100, 7, 500)
 * ```
 */
const lottery = (numbers = 7, max = 100, length = 100) => {
  let arr = [];
  let ran = random(max, length);
  ran = unique(ran);
  for (let i = 0; i < numbers; i++) {
    arr = [...arr, ran[random(ran.length)[0]]];
  }
  return arr;
};

var luckyNumbers = {
  between,
  random,
  lottery
};
var luckyNumbers_3 = luckyNumbers.lottery;

class SlotSound {
  constructor(src, context) {
    if (!src) throw Error('path to file needed')
    
    if (!context) this.audioContext = new AudioContext();
    else this.audioContext = context;
    
    this.src = src;
    this.gainNode = this.audioContext.createGain();
    
    (async() => {
      const response = await fetch(this.src);
      const audioData = await response.arrayBuffer();
      this.audioContext.decodeAudioData(audioData, buffer => {
        this.buffer = buffer;
        // preload rigntone (get rid of the delay on first play)
        this.source = this.audioContext.createBufferSource();
        
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        
        // this.source.buffer = this.buffer;
      });
    })();
    this.playing = false;
  }

  play() {
    if (this.playing) return;
    this.playing = true;
    
    this.source = this.audioContext.createBufferSource();    
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.source.buffer = this.buffer;
    
    this.source.loop = this.loop;
    this.source.start(this.startTime);
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    this.source.stop(this.stopTime);
  }
}

define(class SlotIcon extends HTMLElement {
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
});

define(class SlotRingSlot extends HTMLElement {
  set name(value) {
    this._name = value;
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
      };
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
    this.shadowRoot.appendChild(this.line);
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
        { filter: 'blur(2px)', offset: 0.2 },
        {
          transform: `scale(1.1)`,
          filter: 'blur(5px)',
        },
        {
          transform: `scale(1)`,
          filter: 'blur(0)',
        },
      ],
      {
        duration: 380,
        easing: 'ease-in',
        fill: 'forwards'
      },
    );
    this._animation.cancel();
  }
});

define(class SlotRing extends HTMLElement {
  set name(value) {
    this._name = value;
    this.game = globalThis.slots.get(globalThis.slots.get('game'));
    console.log(this.game);
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
      if (!this.rollTime) this.rollTime = luckyNumbers_3(1, 300);
      const slots = window.slots.get(this._name).slots;
      let slot;
      let spins = [];

      return requestAnimationFrame(async () => {
        this.container.firstChild.remove();
        slot = document.createElement('slot-ring-slot');
        const _icon = nextSymbols[luckyNumbers_3(1, 3)[0]];
        slot.name = slots[_icon];
        slot.icon = `./assets/${slots[_icon]}.svg`;
        for (const spin of spins) {
          await spin();
        }
        spins.push(slot.spin);
        this.container.appendChild(slot);
        if (this.runs <= this.rollTime) {
          this.runs += 1;
          return resolve(await this.renderSymbols(currentSymbols, nextSymbols))
        } else {
          const max = this.container.children.length - this.game.rows;
          for (let i = 0; i < max; ++i) {
            this.container.firstChild.remove();
          }
          this.runs = 0;
          this.rollTime = 0;
          resolve(Array.from(this.shadowRoot.querySelectorAll('slot-ring-slot')));
        }      });
    })

  }

  get factor() {
    return 1 + Math.pow(this.index / 2, 2);
  }

  load(items) {
    const seeds = luckyNumbers_3(5, this.game.slots.length);
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
});

define(class SlotReel extends HTMLElement {
  set name(value) {
    // let i = 0;
    // for (const ring of this.rings) {
    // ring.index = i;
    //   ring.name = value;
    //   ++i;
    // }

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
      resolve([]);
    });
  }

  promiseResult(fil) {
    const multiplier = Number(this.game.multiplier);
    return new Promise(async (resolve, reject) => {
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
          resolve(this.winAmount);
        }
      } else {
        resolve(this.winAmount);
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
      horizontalRings[i].push(rings[i]);
    }
    for (var i = 0; i < horizontalRings.length; i++) {
      rings.push(horizontalRings[i]);
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
  
  async setupSound() {
    this.source = [new SlotSound('start.mp3'), new SlotSound('spin.mp3'), new SlotSound('done.mp3')];
    
    // if (!this.gainNode) {
    //   this.audioContext = this.audioContext || new AudioContext()
    //   this.gainNode = this.audioContext.createGain()
    // 
    //   const audio = [this.shadowRoot.querySelector('audio[name="start"]'), this.shadowRoot.querySelector('audio[name="spin"]')]
    //   console.log(audio);
    //   this.source = [this.audioContext.createMediaElementSource(audio[0]), this.audioContext.createMediaElementSource(audio[1])]
    // 
    // 
    //   this.source[0].connect(this.gainNode)
    //   this.source[1].connect(this.gainNode)
    //   this.gainNode.connect(this.audioContext.destination)
    // 
    //   this.gainNode.gain.value = 1
    //   return 
    // }
    
  }
  
  async spin(bet) {
    // if (!this.source) await this.setupSound() 
    console.log(this.source);
    this.source[0].startTime = 0.5;
    this.source[0].gainNode.gain.value = 0.35;
    this.source[0].play();
    
    return setTimeout(() => {
      
      // }
      
      this.bet = bet;

      console.log('START');
      
      // TODO: change to contract
      
      // await fetch('')

      this.currentSymbols = this.nextSymbols || [
        luckyNumbers_3(3, 12),
        luckyNumbers_3(3, 12),
        luckyNumbers_3(3, 12),
        luckyNumbers_3(3, 12),
        luckyNumbers_3(3, 12),
      ];
      this.nextSymbols = [
        luckyNumbers_3(3, 12),
        luckyNumbers_3(3, 12),
        luckyNumbers_3(3, 12),
        luckyNumbers_3(3, 12),
        luckyNumbers_3(3, 12),
      ];
        this.source[0].gainNode.gain.value = 1;
        this.source[1].play();
      return Promise.all(
        this.rings.map((ring, i) => {
          return ring.renderSymbols(
            this.currentSymbols[i],
            this.nextSymbols[i],
          );
          // return ring.spin();
        }),
      ).then(resolved => {        
        this.source[1].stop();
        this.source[0].stop();
        
        
          setTimeout(() => {
            this.source[2].play();
            setTimeout(() => {
              this.source[2].stop();
            }, 500);
          }, 320);
        
        this.onSpinEnd(resolved);
      });
    }, 160);

  }
  get bonusHero() {
    return this.shadowRoot.querySelector('.bonus-hero');
  }
  constructor() {
    super();
    this.setupSound();
    this.attachShadow({ mode: 'open' });

    this.multiplier = 1;
    this.winAmount = 0;
    this.wins = 0;
    this.shadowRoot.innerHTML = `<style>
      :host, .container {
        display: flex;
        flex-direction: row;
        background: #265a74ba;
        border-radius: 10%;
        /* width: calc(100% - 80px); */
      }
      :host {
        /* box-shadow: 15px -15px 20px 0px #5C6BC0, 15px 15px 20px 0px #7986CB, -15px 15px 20px 0px #5C6BC0, -15px -15px 20px 0px #7986CB; */
      }
      .container {
        width: var(--slot-reel-size);
        height: var(--slot-reel-size);
        overflow: hidden;
        border-radius: 10%;
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
      
      audio {
        display: none;
      }
    </style>
    <audio name="start" src="start.mp3"></audio>
    <audio name="spin" src="spin.mp3"></audio>
    
    <span class="container">
    </span>

    <span class="bonus-hero">
      <h2 style="color: #111;">Bonus Round!</h2>
    </span>
    `;

    
  }

  connectedCallback() {
    this.game = globalThis.slots.get(globalThis.slots.get('game'));
    console.log(this.game);
    for (var i = 0; i < this.game.columns; i++) {
      const ring = document.createElement('slot-ring');
      ring.setAttribute('slots', this.game.slots.length);
      ring.index = i;
      ring.name = globalThis.slots.get('game');
      this.shadowRoot.querySelector('.container').appendChild(ring);
    }
    this.rings = Array.from(this.shadowRoot.querySelectorAll('slot-ring'));
    const matches = (x) => {
      const { height, width } = document.body.getBoundingClientRect();
      let ringSlotHeight = height / this.game.columns;
      let ringSlotWidth = width / this.game.rows;
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
    };

    var x = window.matchMedia("(min-width: 640px)");
    matches(x);
    x.addListener(matches.bind(this));
  }
});

/**
 * @module CSSMixin
 * @mixin Backed
 * @param {class} base class to extend from
 */
 const mixins = {
  'mixin(--css-row)': `display: flex;
        flex-direction: row;
  `,
  'mixin(--css-column)': `display: flex;
        flex-direction: column;
  `,
  'mixin(--css-center)': `align-items: center;`,
  'mixin(--css-header)': `height: 128px;
        width: 100%;
        background: var(--primary-color);
        color: var(--text-color);
        mixin(--css-column)`,
  'mixin(--css-flex)': `flex: 1;`,
  'mixin(--css-flex-2)': `flex: 2;`,
  'mixin(--css-flex-3)': `flex: 3;`,
  'mixin(--css-flex-4)': `flex: 4;`,
  'mixin(--material-palette)': `--dark-primary-color: #00796B;
        --light-primary-color: #B2DFDB;
        --primary-color: #009688;
        --text-color: #FFF;
        --primary-text-color: #212121;
        --secondary-text-color: #757575;
        --divider-color: #BDBDBD;
        --accent-color: #4CAF50;
        --disabled-text-color: #BDBDBD;
        --primary-background-color: #f9ffff;
        --dialog-background-color: #FFFFFF;`,
  'mixin(--css-hero)': `display: flex;
        max-width: 600px;
        max-height: 340px;
        height: 100%;
        width: 100%;
        box-shadow: 3px 2px 4px 2px rgba(0,0,0, 0.15),
                    -2px 0px 4px 2px rgba(0,0,0, 0.15);
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 2px;
  `,
  'mixin(--css-elevation-2dp)': `
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                0 1px 5px 0 rgba(0, 0, 0, 0.12),
                0 3px 1px -2px rgba(0, 0, 0, 0.2);`,

  'mixin(--css-elevation-3dp)': `
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
                0 1px 8px 0 rgba(0, 0, 0, 0.12),
                0 3px 3px -2px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-4dp)': `
    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                0 1px 10px 0 rgba(0, 0, 0, 0.12),
                0 2px 4px -1px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-6dp)': `
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                0 1px 18px 0 rgba(0, 0, 0, 0.12),
                0 3px 5px -1px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-8dp)': `
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                0 3px 14px 2px rgba(0, 0, 0, 0.12),
                0 5px 5px -3px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-12dp)': `
    box-shadow: 0 12px 16px 1px rgba(0, 0, 0, 0.14),
                0 4px 22px 3px rgba(0, 0, 0, 0.12),
                0 6px 7px -4px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-16dp)': `
    box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
                0  6px 30px 5px rgba(0, 0, 0, 0.12),
                0  8px 10px -5px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-24dp)': `
    box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14),
                0 9px 46px 8px rgba(0, 0, 0, 0.12),
                0 11px 15px -7px rgba(0, 0, 0, 0.4);`
 };

 const classes = {
   'apply(--css-row)': `.row {
        mixin(--css-row)
      }
   `,
   'apply(--css-column)': `.column {
        mixin(--css-column)
      }
   `,
   'apply(--css-flex)': `.flex {
        mixin(--css-flex)
      }
   `,
   'apply(--css-flex-2)': `.flex-2 {
     mixin(--css-flex-2)
   }`,
   'apply(--css-flex-3)': `.flex-3 {
     mixin(--css-flex-3)
   }`,
   'apply(--css-flex-4)': `.flex-4 {
     mixin(--css-flex-4)
   }`,
   'apply(--css-center)': `.center {
        align-items: center;
      }
   `,
   'apply(--css-center-center)': `.center-center {
        align-items: center;
        justify-content: center;
      }
   `,
   'apply(--css-header)': `header, .header {
     mixin(--css-header)
   }`,
   'apply(--css-hero)': `.hero {
      mixin(--css-hero)
   }`,
   'apply(--css-elevation-2dp)': `.elevation-2dp {
      mixin(--css-elevation-2dp)
   }`,
   'apply(--css-elevation-3dp)': `.elevation-3dp {
      mixin(--css-elevation-3dp)
   }`,
   'apply(--css-elevation-4dp)': `.elevation-4dp {
      mixin(--css-elevation-4dp)
   }`,
   'apply(--css-elevation-6dp)': `.elevation-6dp {
      mixin(--css-elevation-6dp)
   }`,
   'apply(--css-elevation-8dp)': `.elevation-8dp {
      mixin(--css-elevation-8dp)
   }`,
   'apply(--css-elevation-12dp)': `.elevation-12dp {
      mixin(--css-elevation-12dp)
   }`,
   'apply(--css-elevation-16dp)': `.elevation-16dp {
      mixin(--css-elevation-16dp)
   }`,
   'apply(--css-elevation-18dp)': `.elevation-18dp {
      mixin(--css-elevation-18dp)
   }`
 };
var CSSMixin = base => {
  return class CSSMixin extends base {

    get __style() {
      return this.shadowRoot.querySelector('style');
    }
    constructor() {
      super();
    }
    connectedCallback() {
      // TODO: test
      if (super.connectedCallback) super.connectedCallback();
      // TODO: Implement better way to check if a renderer is used
      if (this.render) this.hasRenderer = true;
      else if(this.template) console.log(`Render method undefined ${this.localname}`);

      this._init();
    }
    _init() {
      if (this.hasRenderer) {
        if (!this.rendered) {
          return requestAnimationFrame(() => {
              this._init();
            });
        }
      }
      const styles = this.shadowRoot ? this.shadowRoot.querySelectorAll('style') : this.querySelectorAll('style');
      // const matches = style.innerHTML.match(/apply((.*))/g);
      styles.forEach(style => {
        this._applyClasses(style.innerHTML).then(innerHTML => {
          if (innerHTML) this.__style.innerHTML = innerHTML;
          this._applyMixins(style.innerHTML).then(innerHTML => {
            if (innerHTML) this.__style.innerHTML = innerHTML;
          });
        }).catch(error => {
          console.error(error);
        });
      });
      // this._applyVariables(matches, style);
    }

    _applyMixins(string) {
      const mixinInMixin = string => {
        if (!string) return console.warn(`Nothing found for ${string}`);
        const matches = string.match(/mixin((.*))/g);
        if (matches) {
          for (const match of matches) {
            const mixin = mixins[match];
            string = string.replace(match, mixin);
          }
        }
        return string;
      };
      return new Promise((resolve, reject) => {
        const matches = string.match(/mixin((.*))/g);
        if (matches) for (const match of matches) {
          const mixin = mixinInMixin(mixins[match]);
          string = string.replace(match, mixin);
          // return [
          //   match, mixins[match]
          // ]

        }        resolve(string);
      });
    }

    _applyClasses(string) {
      return new Promise((resolve, reject) => {
        const matches = string.match(/apply((.*))/g);
        if (matches) for (const match of matches) {
          // this._applyMixins(classes[match]).then(klass => {
            string = string.replace(match, classes[match]);
          // });
        }
        // this.style.innerHTML = string;
        resolve(string);
      });
    }
  }
};

/**
 * @param {object} element HTMLElement
 * @param {function} tagResult custom-renderer-mixin {changes: [], template: ''}
 */
var render = (element, {changes, template}) => {
  if (!changes && !template) return console.warn('changes or template expected');
  if (element.shadowRoot) element = element.shadowRoot;
  if (!element.innerHTML) element.innerHTML = template;
  for (const key of Object.keys(changes)) {
    const els = Array.from(element.querySelectorAll(`[render-mixin-id="${key}"]`));
    for (const el of els) {
      el.innerHTML = changes[key];
    }
  }
  return;
};

/**
 *
 * @example
 ```js
  const template = html`<h1>${'name'}</h1>`;
  let templateResult = template({name: 'Olivia'});

  templateResult.values // property values 'Olivia'
  templateResult.keys // property keys 'name'
  templateResult.strings // raw template array '["<h1>", "</h1>"]'
 ```
 */
const html$1 = (strings, ...keys) => {
  return ((...values) => {
    return {strings, keys, values};
  });
};

window.html = window.html || html$1;

var RenderMixin = (base = HTMLElement) =>
class RenderMixin extends base {

  constructor() {
    super();
    this.set = [];
    this.renderer = this.renderer.bind(this);
    this.render = this.renderer;
  }

  beforeRender({values, strings, keys}) {
    const dict = values[values.length - 1] || {};
    const changes = {};
    let template = null;
    if (!this.rendered) template = strings[0];

    if (values[0] !== undefined) {
      keys.forEach((key, i) => {
        const string = strings[i + 1];
        let value = Number.isInteger(key) ? values[key] : dict[key];
        if (value === undefined && Array.isArray(key)) {
          value = key.join('');
        } else if (value === undefined && !Array.isArray(key) && this.set[i]) {
          value = this.set[i].value; // set previous value, doesn't require developer to pass all properties
        } else if (value === undefined && !Array.isArray(key) && !this.set[i]) {
          value = '';
        }
        if (!this.rendered) {
          template = template.replace(/(>)[^>]*$/g,  ` render-mixin-id="${key}">`);
          template += `${value}${string}`;
        }
        if (this.set[key] && this.set[key] !== value) {
          changes[key] = value;
          this.set[key] = value;
        } else if (!this.set[key]) {
          this.set[key] = value;
          changes[key] = value;
        }
      });
    } else {
      template += strings[0];
    }
    return {
      template,
      changes
    };
  }

  renderer(properties = this.properties, template = this.template) {
    if (!properties) properties = {};
    else if (!this.isFlat(properties)) {
      // check if we are dealing with an flat or indexed object
      // create flat object getting the values from super if there is one
      // default to given properties set properties[key].value
      // this implementation is meant to work with 'property-mixin'
      // checkout https://github.com/vandeurenglenn/backed/src/mixin/property-mixin
      // while I did not test, I believe it should be compatible with PolymerElements
      const object = {};
      // try getting value from this.property
      // try getting value from properties.property.value
      // try getting value from property.property
      // fallback to property
      for (const key of Object.keys(properties)) {
        let value;
        if (this[key] !== undefined) value = this[key];
        else if (properties[key] && properties[key].value !== undefined) {
          value = properties[key].value;
        } else {
          value = '';
        }
        object[key] = value;
      }      properties = object;
    }
    render(this, this.beforeRender(template(properties)));
  }

  /**
   * wether or not properties is just an object or indexed object (like {prop: {value: 'value'}})
   */
  isFlat(object) {
    const firstObject = object[Object.keys(object)[0]];
    if (firstObject)
      if (firstObject.hasOwnProperty('value') ||
          firstObject.hasOwnProperty('reflect') ||
          firstObject.hasOwnProperty('observer') ||
          firstObject.hasOwnProperty('render'))
        return false;
    else return true;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    if (this.render) {
      this.render();
      this.rendered = true;
    }  }
};

define(class CustomSelectButton extends CSSMixin(RenderMixin(HTMLElement)) {
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
  border-color: #245771;
  outline: none;
  user-select: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
:host([checked]) {
  background: #245771;
}
</style>
<slot></slot>`;
  }
});

((base = HTMLElement) => {
  customElements.define('custom-svg-icon', class CustomSvgIcon extends base {

    /**
     * Attributes observer
     * @return {Array} ['icon']
     */
    static get observedAttributes() {
      return ['icon'];
    }

    /**
     * Iconset
     * @return {object} window.svgIconset
     * [checkout](svg-iconset.html) for more info.
     */
    get iconset() {
      return window.svgIconset
    }

    set iconset(value) {
      window.iconset = value;
    }

    /**
     * icon
     * @param {string} value icon to display.
     * optional: you can create multiple iconsets
     * by setting a different name on svg-iconset.
     *
     * **example:** ```html
     * <svg-iconset name="my-icons">
     *   <g id="menu">....</g>
     * </svg-iconset>
     * ```
     * This means we can ask for the icon using a prefix
     * **example:** ```html
     * <reef-icon-button icon="my-icons::menu"></reef-icon-button>
     * ```
     */
    set icon(value) {
      if (this.icon !== value) {
        this._icon = value;
        this.__iconChanged__({value: value});
      }
    }

    get icon() {
      return this._icon;
    }

    get template() {
      return `
        <style>
          :host {
            width: var(--svg-icon-size, 24px);
            height: var(--svg-icon-size, 24px);
            display: inline-flex;
            display: -ms-inline-flexbox;
            display: -webkit-inline-flex;
            display: inline-flex;
            -ms-flex-align: center;
            -webkit-align-items: center;
            align-items: center;
            -ms-flex-pack: center;
            -webkit-justify-content: center;
            justify-content: center;
            position: relative;
            vertical-align: middle;
            fill: var(--svg-icon-color, #111);
            stroke: var(--svg-icon-stroke, none);
          }
        </style>
      `;
    }

    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this._onIconsetReady = this._onIconsetReady.bind(this);
    }

    /**
     * Basic render template, can be called from host using super.render() or extended
     *
     * @example ```js
     * const iconTempl = super.template();
     * ```
     */
    render() {
      this.shadowRoot.innerHTML = this.template;
    }

    connectedCallback() {
      this.icon = this.getAttribute('icon') || null;
      if (!super.render) this.render();
    }

    _onIconsetReady() {
      window.removeEventListener('svg-iconset-added', this._onIconsetReady);
      this.__iconChanged__({value: this.icon});
    }

    __iconChanged__(change) {
      if (!this.iconset) {
        window.addEventListener('svg-iconset-added', this._onIconsetReady);
        return;
      }
      if (change.value && this.iconset) {
        let parts = change.value.split('::');
        if (parts.length === 1) {
          this.iconset['icons'].host.applyIcon(this, change.value);
        } else if (this.iconset[parts[0]]) {
          this.iconset[parts[0]].host.applyIcon(this, parts[1]);
        }
      } else if(!change.value && this.iconset && this._icon) {
        let parts = this._icon.split('::');
        if (parts.length === 1) {
          this.iconset['icons'].host.removeIcon(this);
        } else {
          this.iconset[parts[0]].host.removeIcon(this);
        }
      }
      this.iconset = this.iconset;
    }

    /**
     * Runs when attribute changes.
     * @param {string} name The name of the attribute that changed.
     * @param {string|object|array} oldValue
     * @param {string|object|array} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) this[name] = newValue;
    }
  });
})();

const topTen = {
  columns: 5,
  rows: 5,
  slotHeight: 100,
  slots: [
    'btc',
    'eth',
    'xrp',
    'bch',
    'ltc',
    'eos',
    'bnb',
    'usdt',
    'xlm',
    'ada',
    'trx',
    'xmr'
  ],
  bonus: 'btc',
  multiplier: 2
};

const onebythree = {
  rows: 1,
  columns: 3, 
  slotHeight: 100,
  slots: [
    'eth',
    'ltc',
    'bnb',
    'xlm',
    'ada',
    'trx',
    'xmr',
    'xtz'
  ],
  bonus: 'eth',
  multiplier: 2
};

export { define as a, topTen as b, onebythree as c };
