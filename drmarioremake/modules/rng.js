// Random class so we can get predictable random values so multiplayer matches have the same seed
// Necessary because there is no setseed function in JS random (the algorithm is not universal between browsers)
export class PseudoRandom {
	constructor() {
		this.cache = [];
		this.index = -1; // don't start at index 0 because cache starts empty instead of 1 element
	}

	get(index) {
		if (this.cache[index] === undefined) {
			this.cache[index] = Math.random();
			return this.cache[index];
		} else return this.cache[index];
	}

	next() { return this.get(this.index++); }

	clear() {
		this.cache = [];
		this.index = -1;
	}
}

// Allows us to mimic another PseudoRandom object (for multiplayer)
export class ProxyRandom {
	constructor(random) {
		this.random = random;
		this.index = -1;
	}

	get(index) {
		return this.random.get(index);
	}

	next() { return this.get(this.index++); }

	clear() {
		this.index = -1;
	}
}