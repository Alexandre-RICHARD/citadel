const getMin = (
	d0: number,
	d1: number,
	d2: number,
	bx: number,
	ay: number,
): number => {
	if (d0 < d1 || d2 < d1) {
		return d0 > d2 ? d2 + 1 : d0 + 1;
	}
	return bx === ay ? d1 : d1 + 1;
};

export const calculateLevenshteinDistance = (a: string, b: string): number => {
	let c = a;
	let d = b;

	if (c === d) {
		return 0;
	}

	if (c.length > d.length) {
		[c, d] = [d, c];
	}

	let la = c.length;
	let lb = d.length;

	while (la > 0 && c.charCodeAt(la - 1) === d.charCodeAt(lb - 1)) {
		la -= 1;
		lb -= 1;
	}

	let offset = 0;

	while (offset < la && c.charCodeAt(offset) === d.charCodeAt(offset)) {
		offset += 1;
	}

	la -= offset;
	lb -= offset;

	if (la === 0 || lb < 3) {
		return lb;
	}

	let x = 0;
	let d0: number;
	let d1: number;
	let d2: number;
	let d3: number;
	let dd = 0;
	let dy: number;
	let ay: number;
	let bx0: number;
	let bx1: number;
	let bx2: number;
	let bx3: number;

	const vector: number[] = [];

	for (let y = 0; y < la; y += 1) {
		vector.push(y + 1);
		vector.push(c.charCodeAt(offset + y));
	}

	const len = vector.length - 1;

	for (; x < lb - 3; ) {
		bx0 = d.charCodeAt(offset + (d0 = x));
		bx1 = d.charCodeAt(offset + (d1 = x + 1));
		bx2 = d.charCodeAt(offset + (d2 = x + 2));
		bx3 = d.charCodeAt(offset + (d3 = x + 3));
		x += 4;
		dd = x;
		for (let y = 0; y < len; y += 2) {
			dy = vector[y];
			ay = vector[y + 1];
			d0 = getMin(dy, d0, d1, bx0, ay);
			d1 = getMin(d0, d1, d2, bx1, ay);
			d2 = getMin(d1, d2, d3, bx2, ay);
			dd = getMin(d2, d3, dd, bx3, ay);
			vector[y] = dd;
			d3 = d2;
			d2 = d1;
			d1 = d0;
			d0 = dy;
		}
	}

	for (; x < lb; ) {
		bx0 = d.charCodeAt(offset + (d0 = x));
		x += 1;
		dd = x;
		for (let y = 0; y < len; y += 2) {
			dy = vector[y];
			dd = getMin(dy, d0, dd, bx0, vector[y + 1]);
			vector[y] = dd;
			d0 = dy;
		}
	}

	return dd;
};
