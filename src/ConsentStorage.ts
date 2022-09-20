import { ConsentData } from './ConsentManager';

class ConsentStorage {

	protected prefix: string;

	constructor(prefix: string = 'af_') {
		this.prefix = prefix;
	}

	setData(data: ConsentData): boolean {

		if (this.dataValid(data)) {

			const json = JSON.stringify(data);

			try {
				localStorage.setItem(this.prefix + 'cmd', json);
				return true;

			} catch (error) {
				console.log(error);
			}
		}

		return false;
	}

	getData(): ConsentData | null {

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

	protected dataValid(data: any): boolean {
		return typeof data === 'object'
			&& typeof data.utc === 'number'
			&& typeof data.cmg === 'object'
			&& typeof data.uid === 'string';
	}
}

export default ConsentStorage;