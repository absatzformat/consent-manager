(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dom_1 = require("./dom");
const styles = require("./styles.css");
const roots = new WeakMap();
class ConsentInterface extends HTMLElement {
    constructor(options, consentData) {
        super();
        this.consentData = null;
        this.options = options;
        this.consentData = consentData;
        this.appendChild(document.createComment('Absatzformat GmbH Consent Manager'));
        const root = this.attachShadow({ mode: 'closed' });
        roots.set(this, root);
        console.log(roots);
        const style = (0, dom_1.createElement)('style', {}, [styles]);
        root.appendChild(style);
        const showSettingsBtn = (0, dom_1.createElement)('button', { class: 'button show-settings' }, ['Einstellungen']);
        const necessaryOnlyBtn = (0, dom_1.createElement)('button', { class: 'button necessary-only' }, ['Nur notwendige']);
        const acceptAllBtn = (0, dom_1.createElement)('button', { class: 'button accept-all' }, ['Alle akzeptieren']);
        showSettingsBtn.addEventListener('click', this.settingsOnClick.bind(this));
        necessaryOnlyBtn.addEventListener('click', this.necessaryOnClick.bind(this));
        acceptAllBtn.addEventListener('click', this.acceptOnClick.bind(this));
        const wrapper = this.createWrapper();
        wrapper.querySelector('.content').append(this.createNoticeView());
        wrapper.querySelector('.actions').append(showSettingsBtn, necessaryOnlyBtn, acceptAllBtn);
        root.appendChild(wrapper);
    }
    createNoticeView() {
        const wrapper = (0, dom_1.createElement)('div', { class: 'notice' });
        wrapper.innerHTML = this.options.consentNotice;
        return wrapper;
    }
    createSettingsView() {
        var _a;
        const desc = (0, dom_1.createElement)('div', { class: 'desc' });
        desc.innerHTML = 'blaaa';
        const groups = (0, dom_1.createElement)('div', { class: 'groups' });
        for (const group in this.options.consentGroups) {
            const desc = this.options.consentGroups[group];
            const checked = !!((_a = this.consentData) === null || _a === void 0 ? void 0 : _a.cmg[group]);
            groups.appendChild(this.createSetting(group, desc, checked));
        }
        const wrapper = (0, dom_1.createElement)('div', { class: 'settings' }, [desc, groups]);
        return wrapper;
    }
    createSetting(group, desc, checked = false) {
        const input = (0, dom_1.createElement)('input', {
            type: 'checkbox',
            name: group,
            autocomplete: 'off'
        });
        input.checked = checked;
        const toggle = (0, dom_1.createElement)('span', { class: 'toggle' });
        const description = (0, dom_1.createElement)('span', { class: 'desc' }, [desc]);
        const label = (0, dom_1.createElement)('label', { class: 'setting' }, [input, toggle, description]);
        const container = (0, dom_1.createElement)('div');
        container.appendChild(label);
        return container;
    }
    createWrapper() {
        const wrapper = (0, dom_1.createElement)('div', { class: 'wrapper' });
        wrapper.insertAdjacentHTML('beforeend', `
			<div class="container">
				<div class="content"></div>
				<div class="actions"></div>
			</div>
		`);
        return wrapper;
    }
    update(consentData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.consentData = consentData;
            yield Promise.resolve();
            const root = roots.get(this);
            // groups
            root.querySelectorAll('.groups input[type="checkbox"]').forEach((input) => {
                input.checked = !!consentData.cmg[input.name];
            });
            // consent data
            // const date = new Date()
            // date.setTime(data.utc);
            // this.root.querySelector('.meta .time')!.innerHTML = date.toLocaleString()
            // this.root.querySelector('.meta .consent')!.innerHTML = data.uid;
        });
    }
    settingsOnClick(e) {
        this.showSettings();
    }
    showSettings() {
        var _a;
        const root = roots.get(this);
        const showSettingsBtn = root.querySelector('button.show-settings');
        if (showSettingsBtn) {
            const saveSelectionBtn = (0, dom_1.createElement)('button', { class: 'button save-selection secondary' }, ['Auswahl speichern']);
            saveSelectionBtn.addEventListener('click', this.selectionOnClick.bind(this));
            showSettingsBtn.replaceWith(saveSelectionBtn);
            const settings = this.createSettingsView();
            (_a = root.querySelector('.content .notice')) === null || _a === void 0 ? void 0 : _a.replaceWith(settings);
        }
    }
    selectionOnClick(e) {
        const root = roots.get(this);
        const groups = {};
        root.querySelectorAll('.groups input[type="checkbox"]').forEach((input) => {
            groups[input.name] = input.checked;
        });
        const event = new CustomEvent('custom-select', {
            detail: groups
        });
        this.dispatchEvent(event);
    }
    necessaryOnClick(e) {
        const event = new CustomEvent('deny-all');
        this.dispatchEvent(event);
    }
    acceptOnClick(e) {
        const event = new CustomEvent('accept-all');
        this.dispatchEvent(event);
    }
    attach(showSettings = false) {
        var _a;
        if (!this.parentNode) {
            if (showSettings) {
                this.showSettings();
            }
            (_a = document.querySelector(this.options.interfaceRootSelector)) === null || _a === void 0 ? void 0 : _a.appendChild(this);
        }
    }
    detach() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.parentNode) {
                const root = roots.get(this);
                const container = root.querySelector('.container');
                container.classList.add('hide');
                yield Promise.all(container.getAnimations().map(a => a.finished));
                this.parentNode.removeChild(this);
                container.classList.remove('hide');
            }
        });
    }
}
if (!customElements.get('consent-ui')) {
    customElements.define('consent-ui', ConsentInterface);
}
exports.default = ConsentInterface;

},{"./dom":4,"./styles.css":6}],2:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConsentStorage_1 = require("./ConsentStorage");
const ConsentInterface_1 = require("./ConsentInterface");
const dom_1 = require("./dom");
const uuid_1 = require("./uuid");
;
;
const defaultOptions = {
    interfaceRootSelector: 'body',
    interfaceShowDelay: 500,
    consentGroupSelector: 'data-cmg',
    consentChangeReload: false,
    whitelistUrls: [],
    consentGroups: {},
    consentNotice: '[notice]',
    consentLifetime: 3600 * 24 * 365 // 12 months
};
class ConsentManager {
    constructor(options) {
        this.consentData = null;
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
        this.storage = new ConsentStorage_1.default();
        this.init();
    }
    init() {
        var _a;
        // read consent data
        this.consentData = this.storage.getData();
        (_a = this.options.onInit) === null || _a === void 0 ? void 0 : _a.call(this.options.onInit, this);
        if (this.consentData) {
            const currentTime = new Date().getTime();
            const lifetime = this.options.consentLifetime * 1000;
            if (currentTime - this.consentData.utc <= lifetime) {
                this.processScripts();
                return;
            }
            // TODO: maybe reset consent data
        }
        // check whitelisted urls
        if (this.isUrlWhitelisted()) {
            return;
        }
        const passed = Date.now() - window.performance.timeOrigin;
        const delay = Math.max(this.options.interfaceShowDelay - passed / 1000, 0);
        // open consent ui
        setTimeout(() => this.open(), delay);
    }
    isUrlWhitelisted() {
        const location = window.location.toString();
        return this.options.whitelistUrls.indexOf(location) >= 0;
    }
    getBrowserLanguage() {
        return navigator.language;
    }
    // TODO: link, iframe
    processScripts() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.resolve();
            const groupSelector = this.options.consentGroupSelector;
            document.querySelectorAll(`script[${groupSelector}]`).forEach((script) => {
                const groupStr = script.getAttribute(groupSelector);
                const groups = groupStr.split(',');
                const hasConsent = !!groups.filter(this.hasConsent.bind(this)).length;
                if (hasConsent) {
                    // check if script already executed
                    if (script.getAttribute('data-cmp') !== null) {
                        console.warn('Script possibly already executed:', (0, dom_1.elementToString)(script));
                        return;
                    }
                    if (script.type.toLocaleLowerCase() !== 'text/plain') {
                        console.warn('Script should be of type "text/plain":', (0, dom_1.elementToString)(script));
                    }
                    const attributes = {};
                    Array.from(script.attributes).forEach((attr) => {
                        attributes[attr.name] = attr.value;
                    });
                    const replace = (0, dom_1.createElement)('script', attributes, [script.innerHTML]);
                    replace.type = 'text/javascript';
                    replace.setAttribute('data-cmp', '');
                    script.replaceWith(replace);
                }
            });
        });
    }
    updateConsentData(consent) {
        var _a, _b, _c;
        const consentData = Object.freeze({
            uid: ((_a = this.consentData) === null || _a === void 0 ? void 0 : _a.uid) || (0, uuid_1.default)(),
            utc: new Date().getTime(),
            cmg: consent
        });
        (_b = this.interface) === null || _b === void 0 ? void 0 : _b.update(consentData);
        this.consentData = consentData;
        this.storage.setData(consentData);
        (_c = this.options.onConsent) === null || _c === void 0 ? void 0 : _c.call(this.options.onConsent, consentData);
    }
    customSelect(e) {
        this.close();
        const groups = e.detail;
        const reload = !!this.consentData && this.options.consentChangeReload;
        const consent = {};
        for (const group in groups) {
            if (Object.prototype.hasOwnProperty.call(this.options.consentGroups, group)) {
                consent[group] = !!groups[group];
            }
        }
        this.updateConsentData(groups);
        if (reload) {
            window.location.reload();
        }
        else {
            this.processScripts();
        }
    }
    denyAll() {
        this.close();
        const reload = !!this.consentData && this.options.consentChangeReload;
        this.updateConsentData({});
        if (reload) {
            window.location.reload();
        }
    }
    acceptAll() {
        this.close();
        const consent = {};
        for (const group in this.options.consentGroups) {
            consent[group] = true;
        }
        this.updateConsentData(consent);
        this.processScripts();
    }
    addScript(consentGroups, attributes, content) {
        const inner = content ? [content] : undefined;
        const script = (0, dom_1.createElement)('script', attributes, inner);
        const groupStr = consentGroups.join(',');
        script.setAttribute(this.options.consentGroupSelector, groupStr);
        const hasConsent = !!consentGroups.filter(this.hasConsent.bind(this)).length;
        if (hasConsent) {
            script.type = 'text/javascript';
            script.setAttribute('data-cmp', '');
        }
        else {
            script.type = 'text/plain';
        }
        document.head.appendChild(script);
        return script;
    }
    hasConsent(consentGroup) {
        var _a;
        return ((_a = this.consentData) === null || _a === void 0 ? void 0 : _a.cmg[consentGroup]) ? true : false;
    }
    getConsentData() {
        return this.consentData;
    }
    open(showSettings = false) {
        if (!this.interface) {
            this.interface = new ConsentInterface_1.default(this.options, this.consentData);
            this.interface.addEventListener('accept-all', this.acceptAll.bind(this));
            this.interface.addEventListener('deny-all', this.denyAll.bind(this));
            this.interface.addEventListener('custom-select', this.customSelect.bind(this));
        }
        this.interface.attach(showSettings);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.interface) {
                yield this.interface.detach();
                this.interface = undefined;
            }
        });
    }
}
exports.default = ConsentManager;

},{"./ConsentInterface":1,"./ConsentStorage":3,"./dom":4,"./uuid":7}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConsentStorage {
    constructor(prefix = 'af_') {
        this.prefix = prefix;
    }
    setData(data) {
        if (this.dataValid(data)) {
            const json = JSON.stringify(data);
            try {
                localStorage.setItem(this.prefix + 'cmd', json);
                return true;
            }
            catch (error) {
                console.log(error);
            }
        }
        return false;
    }
    getData() {
        const json = localStorage.getItem(this.prefix + 'cmd');
        if (json) {
            try {
                const data = JSON.parse(json);
                if (this.dataValid(data)) {
                    return data;
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        return null;
    }
    dataValid(data) {
        return typeof data === 'object'
            && typeof data.utc === 'number'
            && typeof data.cmg === 'object'
            && typeof data.uid === 'string';
    }
}
exports.default = ConsentStorage;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementToString = exports.createElement = void 0;
const createElement = (tag, attributes, children) => {
    const element = document.createElement(tag);
    if (attributes) {
        for (const attr in attributes) {
            element.setAttribute(attr, attributes[attr]);
        }
    }
    if (children) {
        element.append(...children);
    }
    return element;
};
exports.createElement = createElement;
const elementToString = (element) => {
    const clone = element.cloneNode();
    clone.innerHTML = element.innerHTML.trim().length ? '...' : '';
    return clone.outerHTML;
};
exports.elementToString = elementToString;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConsentManager_1 = require("./ConsentManager");
window.consentManager = new ConsentManager_1.default(window.cmOptions);

},{"./ConsentManager":2}],6:[function(require,module,exports){
module.exports = ":host{--color-primary:#e72d4b;--color-secondary:#2e3142;--color-muted:#ccc;--color-background:#fff;--border-radius:2px;--toggle-size:20px}.wrapper{position:fixed;z-index:99999;display:flex;top:0;left:0;bottom:0;right:0;padding:15px;pointer-events:none;align-items:flex-end;justify-content:center}.container{border-radius:var(--border-radius);width:800px;max-width:100%;max-height:100%;background-color:var(--color-background);box-shadow:0 0 15px 0 rgba(0,0,0,.25);pointer-events:all;display:flex;flex-direction:column;overflow:hidden;animation:fade-in ease 250ms}.container.hide{animation:fade-out ease 250ms}@keyframes fade-in{from{opacity:0;transform:translateY(15px)}}@keyframes fade-out{to{opacity:0;transform:translateY(15px)}}.content{overflow:auto;padding:15px;scrollbar-width:thin}.groups{display:flex;align-items:center;flex-wrap:wrap}.groups>div{width:100%;margin-bottom:5px}.setting{position:relative;display:inline-flex;user-select:none;align-items:center}.setting input{position:absolute;top:0;left:0;width:0;height:0;opacity:0}.setting .toggle{display:inline-block;width:calc(var(--toggle-size) * 2);height:var(--toggle-size);border-radius:var(--toggle-size);background-color:var(--color-muted);border:2px solid var(--color-muted);margin-right:15px;transition:background-color ease 150ms,border-color ease 150ms}.setting .toggle:after{content:\"\";display:block;width:var(--toggle-size);height:var(--toggle-size);border-radius:50%;background-color:var(--color-background);transition:transform ease 150ms}.setting input:checked~.toggle{background-color:var(--color-primary);border-color:var(--color-primary)}.setting input:focus~.toggle{outline:2px solid var(--color-secondary)}.setting input:focus:not(:focus-visible)~.toggle{outline:0}.setting input:focus-visible~.toggle{outline:2px solid var(--color-secondary)}.setting input:checked~.toggle:after{transform:translateX(100%)}.actions{padding:15px;border-top:1px solid var(--color-muted)}.button{font:inherit;font-weight:600;background:0 0;color:currentColor;border:2px solid var(--color-primary);border-radius:var(--border-radius);padding:15px 10px;user-select:none}.button:focus,.button:hover{border-color:var(--color-secondary);outline:0}.button.accept-all{background-color:var(--color-primary);color:var(--color-background)}.button.accept-all:focus,.button.accept-all:hover{background-color:var(--color-secondary)}.actions button{width:100%;margin-bottom:10px}@media (min-width:600px){.groups>div{width:50%}.actions{display:flex;align-items:stretch;justify-content:stretch}.actions button{margin-right:10px;margin-bottom:0}.actions button:last-child{margin-right:0}}";
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBase62 = void 0;
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const toBase62 = (num) => {
    let enc = '';
    do {
        enc = alphabet[num % 62] + enc;
        num = num / 62 | 0;
    } while (num > 0);
    return enc;
};
exports.toBase62 = toBase62;
const generate = () => {
    const time = new Date().getTime();
    let enc = (0, exports.toBase62)(time);
    // fill with random values
    while (enc.length < 32) {
        enc += alphabet[Math.random() * 62 | 0];
    }
    return enc;
};
exports.default = generate;

},{}]},{},[5]);
