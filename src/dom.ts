const createElement = <E extends HTMLElement>(tag: string, attributes?: Record<string, string>, children?: (string | Node)[]): E => {

	const element = document.createElement(tag);

	if (attributes) {
		for (const attr in attributes) {
			element.setAttribute(attr, attributes[attr]);
		}
	}

	if (children) {
		element.append(...children);
	}

	return element as E;
}

const elementToString = (element: HTMLElement): string => {

	const clone = element.cloneNode() as HTMLElement;
	clone.innerHTML = element.innerHTML.trim().length ? '...' : '';

	return clone.outerHTML;
}

export { createElement, elementToString }