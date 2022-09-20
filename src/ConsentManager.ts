import ConsentStorage from './ConsentStorage';
import ConsentInterface from './ConsentInterface';
import { createElement, elementToString } from './dom';
import uuid from './uuid';

export interface ConsentOptions {
	interfaceRootSelector: string;
	interfaceShowDelay: number,
	consentGroupSelector: string,
	consentChangeReload: boolean;
	whitelistUrls: string[];
	consentGroups: Record<string, string>,
	consentNotice: string;
	consentLifetime: number;
	onInit?: (consentManager: ConsentManager) => void;
	onConsent?: (consentData: ConsentData) => void;
};

export interface ConsentData {
	uid: string;
	utc: number;
	cmg: Record<string, boolean>
};

const defaultOptions: ConsentOptions = {
	interfaceRootSelector: 'body',
	interfaceShowDelay: 500,
	consentGroupSelector: 'data-cmg',
	consentChangeReload: false,
	whitelistUrls: [],
	consentGroups: {},
	consentNotice: '[notice]',
	consentLifetime: 365
};

class ConsentManager {

	protected options: ConsentOptions;

	protected storage: ConsentStorage;

	protected consentData: ConsentData | null = null;

	protected interface?: ConsentInterface;

	constructor(options?: Partial<ConsentOptions>) {

		this.options = { ...defaultOptions, ...options };
		this.storage = new ConsentStorage();

		this.init();
	}

	protected init() {

		// read consent data
		this.consentData = this.storage.getData();

		this.options.onInit?.call(this.options.onInit, this);

		if (this.consentData) {

			const currentTime = new Date().getTime();
			const lifetime = this.options.consentLifetime * 24 * 3600 * 1000;

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

	protected isUrlWhitelisted(): boolean {
		const location = window.location.toString();
		return this.options.whitelistUrls.indexOf(location) >= 0;
	}

	protected getBrowserLanguage(): string {
		return navigator.language;
	}

	// TODO: link, iframe
	async processScripts() {

		await Promise.resolve();

		const groupSelector = this.options.consentGroupSelector;

		document.querySelectorAll<HTMLScriptElement>(`script[${groupSelector}]`).forEach((script) => {

			const groupStr = script.getAttribute(groupSelector)!;
			const groups = groupStr.split(',');

			const hasConsent = !!groups.filter(this.hasConsent.bind(this)).length;

			if (hasConsent) {

				// check if script already executed
				if (script.getAttribute('data-cmp') !== null) {
					console.warn('Script possibly already executed:', elementToString(script));
					return;
				}

				if (script.type.toLocaleLowerCase() !== 'text/plain') {
					console.warn('Script should be of type "text/plain":', elementToString(script));
				}

				const attributes: Record<string, string> = {};

				Array.from(script.attributes).forEach((attr) => {
					attributes[attr.name] = attr.value;
				});

				const replace = createElement<HTMLScriptElement>('script', attributes, [script.innerHTML]);

				replace.type = 'text/javascript';
				replace.setAttribute('data-cmp', '');

				script.replaceWith(replace);
			}
		});
	}

	protected updateConsentData(consent: Record<string, boolean>) {

		const consentData: ConsentData = Object.freeze({
			uid: this.consentData?.uid || uuid(),
			utc: new Date().getTime(),
			cmg: consent
		});

		this.interface?.update(consentData);

		this.consentData = consentData;
		this.storage.setData(consentData);

		this.options.onConsent?.call(this.options.onConsent, consentData);
	}

	protected customSelect(e: Event) {

		this.close();

		const groups: Record<string, boolean> = (e as CustomEvent).detail;

		const reload = !!this.consentData && this.options.consentChangeReload;

		const consent: Record<string, boolean> = {};

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

	protected denyAll() {

		this.close();

		const reload = !!this.consentData && this.options.consentChangeReload;

		this.updateConsentData({});

		if (reload) {
			window.location.reload();
		}
	}

	protected acceptAll() {

		this.close();

		const consent: Record<string, boolean> = {};

		for (const group in this.options.consentGroups) {
			consent[group] = true;
		}

		this.updateConsentData(consent);
		this.processScripts();
	}

	addScript(consentGroups: string[], attributes: Record<string, string>, content?: string): HTMLScriptElement {

		const inner = content ? [content] : undefined;
		const script = createElement<HTMLScriptElement>('script', attributes, inner);
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

	hasConsent(consentGroup: string): boolean {
		return this.consentData?.cmg[consentGroup] ? true : false;
	}

	getConsentData(): ConsentData | null {
		return this.consentData;
	}

	open(showSettings: boolean = false) {

		if (!this.interface) {
			this.interface = new ConsentInterface(this.options, this.consentData);
			this.interface.addEventListener('accept-all', this.acceptAll.bind(this));
			this.interface.addEventListener('deny-all', this.denyAll.bind(this));
			this.interface.addEventListener('custom-select', this.customSelect.bind(this));
		}

		this.interface.attach(showSettings);
	}

	async close() {

		if (this.interface) {

			await this.interface.detach();
			this.interface = undefined;
		}
	}
}

export default ConsentManager;