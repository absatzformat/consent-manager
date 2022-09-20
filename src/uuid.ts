
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const toBase62 = (num: number): string => {

	let enc = '';

	do {
		enc = alphabet[num % 62] + enc;
		num = num / 62 | 0;
	}
	while (num > 0);

	return enc;
};

const generate = (): string => {

	const time = new Date().getTime();
	let enc = toBase62(time);

	// fill with random values
	while (enc.length < 32) {
		enc += alphabet[Math.random() * 62 | 0];
	}

	return enc;
};

export default generate;