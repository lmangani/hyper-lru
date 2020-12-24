<img src="https://hypercore-protocol.org/images/hypercore-protocol.png" width=130>

# hyper-lru

> Decentralized [“Least Recently Used” (LRU) cache](https://en.m.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29) 

Experimental Fork of [Quick-LRU](https://github.com/sindresorhus/quick-lru) powered by the [Hyper Protocol](https://hypercore-protocol.org/) 

Hyper-LRU instances will discover each other using DHT topics and exchange cache events with the swarm. 

## Install

```
$ npm install hyper-lru
```

## Usage

```js
const HyperLRU = require('hyper-lru');

// Start multiple instances of HyperLRU on different hosts
const lru1 = new HyperLRU({maxSize: 100, hyper: 'mysupersecretlonghash' });
const lru2 = new HyperLRU({maxSize: 100, hyper: 'mysupersecretlonghash' });

// Cache using the 1st LRU
lru1.set('🦄', '🌈');
lru1.has('🦄');
//=> true
lru1.get('🦄');
//=> '🌈'

// Query using the 2nd LRU
lru2.has('🦄');
//=> true
lru2.get('🦄');
//=> '🌈'

```

## API

### new HyperLRU(options?)

Returns a new instance.

### options

Type: `object`

#### maxSize

*Required*\
Type: `number`

The maximum number of items before evicting the least recently used items.

#### onEviction

*Optional*\
Type: `(key, value) => void`

Called right before an item is evicted from the cache.

Useful for side effects or for items like object URLs that need explicit cleanup (`revokeObjectURL`).

### Instance

The instance is an [`Iterable`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols) of `[key, value]` pairs so you can use it directly in a [`for…of`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of) loop.

Both `key` and `value` can be of any type.

#### .set(key, value)

Set an item. Returns the instance.

#### .get(key)

Get an item.

#### .has(key)

Check if an item exists.

#### .peek(key)

Get an item without marking it as recently used.

#### .delete(key)

Delete an item.

Returns `true` if the item is removed or `false` if the item doesn't exist.

#### .clear()

Delete all items.

#### .resize(maxSize)

Update the `maxSize`, discarding items as necessary. Insertion order is mostly preserved, though this is not a strong guarantee.

Useful for on-the-fly tuning of cache sizes in live systems.

#### .keys()

Iterable for all the keys.

#### .values()

Iterable for all the values.

#### .entriesAscending()

Iterable for all entries, starting with the oldest (ascending in recency).

#### .entriesDescending()

Iterable for all entries, starting with the newest (descending in recency).

#### .size

The stored item count.

---
