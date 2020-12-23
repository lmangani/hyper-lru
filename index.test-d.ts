import {expectType} from 'tsd';
import HyperLRU = require('.');

const lru = new HyperLRU<string, number>({maxSize: 1000});

expectType<HyperLRU<string, number>>(lru.set('🦄', 1).set('🌈', 2));
expectType<number | undefined>(lru.get('🦄'));
expectType<boolean>(lru.has('🦄'));
expectType<number | undefined>(lru.peek('🦄'));
expectType<boolean>(lru.delete('🦄'));
expectType<void>(lru.clear());
expectType<number>(lru.size);

for (const [key, value] of lru) {
	expectType<string>(key);
	expectType<number>(value);
}

for (const key of lru.keys()) {
	expectType<string>(key);
}

for (const value of lru.values()) {
	expectType<number>(value);
}
