'use strict';

const net = require('./hyper.js');

class HyperLRU {
	constructor(options = {}) {
		if (!(options.maxSize && options.maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		this.maxSize = options.maxSize;
		this.hyper = false;
		this.onEviction = options.onEviction;
		this.cache = new Map();
		this.oldCache = new Map();
		this._size = 0;

		if (options.hyper) {

			if (options.hyper.length < 8) {
				throw new TypeError('`hyper` must be a unique stringer longer than 8 chars');
			}

			try {
			  net.connect(options.hyper, (err, socket) => {
				if (err) {
					console.error('`hyper` connectivity failure');
				}

				this.hyper = socket;
				this.hyper.on('data', function(data) {
				   try {
					const obj = JSON.parse(data.toString());
					switch(obj.t) {
					  case 'set':
					    this.set(obj.key, obj.value, true);
					    break;
					  case 'delete':
					    this.delete(obj.key, true);
					    break;
					  default:
					    break;
					}
				  } catch(e) { console.error('not json', data.toString()); }

				}.bind(this));

			  });

			} catch(e) {
				console.error(e);
				this.hyper = false
			}

		}

	}

	_emitEvictions(cache) {
		if (typeof this.onEviction !== 'function') {
			return;
		}

		for (const [key, value] of cache) {
			this.onEviction(key, value);
		}
	}

	_hset(key, value) {
		this.cache.set(key, value);
		this._size++;

		if (this._size >= this.maxSize) {
			this._size = 0;
			this._emitEvictions(this.oldCache);
			this.oldCache = this.cache;
			this.cache = new Map();
		}
	}
	_set(key, value, peer) {
		this.cache.set(key, value);
		this._size++;

		if (this._size >= this.maxSize) {
			this._size = 0;
			this._emitEvictions(this.oldCache);
			this.oldCache = this.cache;
			this.cache = new Map();
		}
	}

	get(key) {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		if (this.oldCache.has(key)) {
			const value = this.oldCache.get(key);
			this.oldCache.delete(key);
			this._set(key, value);
			return value;
		}
	}

	set(key, value, peer) {
		if (this.cache.has(key)) {
			this.cache.set(key, value);
		} else {
			this._set(key, value);
		}

		if (this.hyper && key && value && !peer) {
			this.hyper.write(JSON.stringify({t:'set', key:key, value:value}) + '\n');
		}

		return this;
	}

	has(key) {
		return this.cache.has(key) || this.oldCache.has(key);
	}

	peek(key) {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		if (this.oldCache.has(key)) {
			return this.oldCache.get(key);
		}
	}

	delete(key, peer) {
		const deleted = this.cache.delete(key);
		if (deleted) {
			this._size--;
		}

		if (this.hyper && key && !peer) {
			this.hyper.write(JSON.stringify({t:'delete', key:key}) + '\n');
		}

		return this.oldCache.delete(key) || deleted;
	}

	clear() {
		this.cache.clear();
		this.oldCache.clear();
		this._size = 0;
	}

	resize(newSize) {
		if (!(newSize && newSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		const items = [...this.entriesAscending()];
		const removeCount = items.length - newSize;
		if (removeCount < 0) {
			this.cache = new Map(items);
			this.oldCache = new Map();
			this._size = items.length;
		} else {
			if (removeCount > 0) {
				this._emitEvictions(items.slice(0, removeCount));
			}

			this.oldCache = new Map(items.slice(removeCount));
			this.cache = new Map();
			this._size = 0;
		}

		this.maxSize = newSize;
	}

	* keys() {
		for (const [key] of this) {
			yield key;
		}
	}

	* values() {
		for (const [, value] of this) {
			yield value;
		}
	}

	* [Symbol.iterator]() {
		yield * this.cache;

		for (const item of this.oldCache) {
			const [key] = item;
			if (!this.cache.has(key)) {
				yield item;
			}
		}
	}

	* entriesDescending() {
		let items = [...this.cache];
		for (let i = items.length - 1; i >= 0; --i) {
			yield items[i];
		}

		items = [...this.oldCache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key] = item;
			if (!this.cache.has(key)) {
				yield item;
			}
		}
	}

	* entriesAscending() {
		for (const item of this.oldCache) {
			const [key] = item;
			if (!this.cache.has(key)) {
				yield item;
			}
		}

		yield * this.cache;
	}

	get size() {
		if (!this._size) {
			return this.oldCache.size;
		}

		let oldCacheSize = 0;
		for (const key of this.oldCache.keys()) {
			if (!this.cache.has(key)) {
				oldCacheSize++;
			}
		}

		return Math.min(this._size + oldCacheSize, this.maxSize);
	}
}

module.exports = HyperLRU;
