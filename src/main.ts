import ConsentManager, { ConsentOptions } from './ConsentManager';

declare global {
	interface Window {
		cmOptions?: ConsentOptions
		consentManager?: ConsentManager
	}
}

window.consentManager = new ConsentManager(window.cmOptions);