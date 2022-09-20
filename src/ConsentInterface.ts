import { ConsentData, ConsentOptions } from './ConsentManager';
import { createElement } from './dom';
import * as styles from './styles.css';

class ConsentInterface extends HTMLElement {

	protected root: ShadowRoot;

	protected options: ConsentOptions;

	protected consentData: ConsentData | null = null;

	constructor(options: ConsentOptions, consentData: ConsentData | null) {

		super();

		this.options = options;
		this.consentData = consentData;

		this.appendChild(document.createComment('Absatzformat GmbH Consent Manager'));

		this.root = this.attachShadow({ mode: 'open' });

		const style = createElement('style', {}, [styles]);
		this.root.appendChild(style);

		const showSettingsBtn = createElement('button', { class: 'button show-settings' }, ['Einstellungen']);
		const necessaryOnlyBtn = createElement('button', { class: 'button necessary-only' }, ['Nur notwendige']);
		const acceptAllBtn = createElement('button', { class: 'button accept-all' }, ['Alle akzeptieren']);

		showSettingsBtn.addEventListener('click', this.settingsOnClick.bind(this));
		necessaryOnlyBtn.addEventListener('click', this.necessaryOnClick.bind(this));
		acceptAllBtn.addEventListener('click', this.acceptOnClick.bind(this));

		const wrapper = this.createWrapper();

		wrapper.querySelector('.content')!.append(this.createNoticeView());
		wrapper.querySelector('.actions')!.append(showSettingsBtn, necessaryOnlyBtn, acceptAllBtn);

		this.root.appendChild(wrapper);
	}

	protected createNoticeView(): HTMLDivElement {
		const wrapper = createElement<HTMLDivElement>('div', { class: 'notice' });
		wrapper.innerHTML = this.options.consentNotice;

		return wrapper;
	}

	protected createSettingsView(): HTMLDivElement {

		const desc = createElement<HTMLDivElement>('div', { class: 'desc' });
		desc.innerHTML = 'blaaa';

		const groups = createElement<HTMLDivElement>('div', { class: 'groups' });

		for (const group in this.options.consentGroups) {

			const desc = this.options.consentGroups[group];
			const checked = !!this.consentData?.cmg[group];

			groups.appendChild(this.createSetting(group, desc, checked));
		}

		const wrapper = createElement<HTMLDivElement>('div', { class: 'settings' }, [desc, groups]);

		return wrapper;
	}

	protected createSetting(group: string, desc: string, checked: boolean = false): HTMLDivElement {

		const input = createElement<HTMLInputElement>('input', {
			type: 'checkbox',
			name: group,
			autocomplete: 'off'
		});

		input.checked = checked;

		const toggle = createElement('span', { class: 'toggle' });
		const description = createElement('span', { class: 'desc' }, [desc]);
		const label = createElement<HTMLLabelElement>('label', { class: 'setting' }, [input, toggle, description]);

		const container = createElement<HTMLDivElement>('div');
		container.appendChild(label);

		return container;
	}

	protected createWrapper(): HTMLDivElement {

		const wrapper = createElement<HTMLDivElement>('div', { class: 'wrapper' });

		wrapper.insertAdjacentHTML('beforeend', `
			<div class="container">
				<div class="content"></div>
				<div class="actions"></div>
			</div>
		`);

		return wrapper;
	}

	async update(consentData: ConsentData) {

		this.consentData = consentData;

		await Promise.resolve();

		// groups
		this.root.querySelectorAll<HTMLInputElement>('.groups input[type="checkbox"]').forEach((input) => {
			input.checked = !!consentData.cmg[input.name];
		});

		// consent data
		// const date = new Date()
		// date.setTime(data.utc);

		// this.root.querySelector('.meta .time')!.innerHTML = date.toLocaleString()
		// this.root.querySelector('.meta .consent')!.innerHTML = data.uid;
	}

	protected settingsOnClick(e: Event) {

		this.showSettings();
	}

	protected showSettings() {

		const showSettingsBtn = this.root.querySelector('button.show-settings');

		if (showSettingsBtn) {

			const saveSelectionBtn = createElement('button', { class: 'button save-selection secondary' }, ['Auswahl speichern']);
			saveSelectionBtn.addEventListener('click', this.selectionOnClick.bind(this));

			showSettingsBtn.replaceWith(saveSelectionBtn);

			const settings = this.createSettingsView();

			this.root.querySelector('.content .notice')?.replaceWith(settings);
		}
	}

	protected selectionOnClick(e: Event) {

		const groups: Record<string, boolean> = {};

		this.root.querySelectorAll<HTMLInputElement>('.groups input[type="checkbox"]').forEach((input) => {
			groups[input.name] = input.checked;
		});

		const event = new CustomEvent('custom-select', {
			detail: groups
		});

		this.dispatchEvent(event);
	}

	protected necessaryOnClick(e: Event) {
		const event = new CustomEvent('deny-all');
		this.dispatchEvent(event);
	}

	protected acceptOnClick(e: Event) {

		const event = new CustomEvent('accept-all');
		this.dispatchEvent(event);
	}

	attach(showSettings: boolean = false) {
		if (!this.parentNode) {
			if (showSettings) {
				this.showSettings();
			}
			document.querySelector(this.options.interfaceRootSelector)?.appendChild(this);
		}
	}

	async detach() {

		if (this.parentNode) {

			const container = this.root.querySelector<HTMLElement>('.container')!;
			container.classList.add('hide');

			await Promise.all(container.getAnimations().map(a => a.finished));

			this.parentNode.removeChild(this);

			container.classList.remove('hide');
		}
	}
}

if (!customElements.get('consent-ui')) {
	customElements.define('consent-ui', ConsentInterface);
}

export default ConsentInterface;