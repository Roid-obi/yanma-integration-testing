const hello = require('../src/namaTestCase');

describe('Mengetest function hello', () => {
		test('Hello World', () => {
		    expect(hello('World')).toBe("Hello World");
		});
		test('Hello Le', () => {
		    expect(hello('Le')).toBe("Hello Le");
		});
});