export type PluralFunction = {
	(n: number): number;
}

export type TranslationData = {
	[key: string]: string | string[];
};

export type TranslationObject = {
	[key: string]: TranslationObject | string | string[];
}

export type I18nOptions = {
	replaceTokens: [string, string];
	groupDelimiter: string;
	numberSelector: string;
	pluralFunction: PluralFunction;
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
const regexEscape = (token: string): string => {
	return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const buildRegex = (tokens: [string, string]): RegExp => {
	return new RegExp(tokens.map(regexEscape).join('(.*?)'), 'g');
};

const keyExists = (key: string, obj: object): boolean => {
	return Object.prototype.hasOwnProperty.call(obj, key);
};

const replace = (str: string, values: Record<string, string | number>, replaceRegex: RegExp): string => {

	return str.replace(replaceRegex, (expr: string, key: string) => {

		if (keyExists(key, values)) {
			return values[key].toString();
		}

		return expr;
	});
};

const defaultOptions: I18nOptions = {
	replaceTokens: ['%{', '}'],
	groupDelimiter: '.',
	numberSelector: 'n',
	pluralFunction: (num: number) => num !== 1 ? 1 : 0 // de, en, es, it, ...
};

class I18n {

	protected translation: TranslationData = {};

	protected pluralFunction: PluralFunction;

	protected replaceRegex: RegExp;

	protected groupDelimiter: string;

	protected numberSelector: string;

	constructor(options?: Partial<I18nOptions>) {
		const {
			pluralFunction,
			replaceTokens,
			groupDelimiter,
			numberSelector
		} = { ...defaultOptions, ...options };
		this.pluralFunction = pluralFunction;
		this.replaceRegex = buildRegex(replaceTokens);
		this.groupDelimiter = groupDelimiter;
		this.numberSelector = numberSelector;
	}

	// https://www.gnu.org/software/gettext/manual/html_node/Plural-forms.html
	static pf(locale: string): PluralFunction {

		const rules = new Intl.PluralRules(locale, { type: 'cardinal' });
		const options = rules.resolvedOptions();

		const ordered = ['zero', 'one', 'two', 'few', 'many', 'other'];
		const sorted = options.pluralCategories
			.map((c) => ordered.indexOf(c))
			.sort()
			.map((i) => ordered[i]);

		return (n: number): number => {
			const select = rules.select(n);
			return sorted.indexOf(select);
		};
	};

	add(translation: TranslationObject, group?: string): this {

		const delim = this.groupDelimiter;
		const prefix = typeof group === 'string' && group !== '' ? group + delim : '';

		for (const key in translation) {

			const entry = translation[key] as TranslationObject;
			const path = prefix + key;

			if (Array.isArray(entry) || typeof entry !== 'object') {
				this.translation[path] = entry;
			}
			else {
				this.add(entry, path);
			}
		}

		return this;
	}

	remove(key: string): this {

		delete this.translation[key];
		return this;
	}

	prune(): this {
		this.translation = {};
		return this;
	}

	has(key: string): boolean {
		return keyExists(key, this.translation);
	}

	t(key: string, context?: number | Record<string, string | number>): string {

		const values = typeof context === 'number' ? { [this.numberSelector]: context } : { ...context };

		if (this.has(key)) {

			const translation = this.translation[key];

			if (typeof translation === 'string') {
				return replace(translation, values, this.replaceRegex);
			}

			if (typeof values[this.numberSelector] !== 'number') {
				throw new TypeError(`No number for pluralization given`);
			}

			const num = values[this.numberSelector] as number;
			const index = this.pluralFunction.call(this.pluralFunction, Math.abs(num));

			if (typeof translation[index] === 'string') {
				return replace(translation[index], values, this.replaceRegex);
			}

			console.warn(`No matching pluralization for key < ${key} > index < ${index} > found`);
		}
		else {
			console.warn(`No translation for key < ${key} > found`);
		}

		return replace(key, values, this.replaceRegex);
	}
}

export default I18n;