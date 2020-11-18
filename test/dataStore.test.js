import dataStore from '../src/dataStore';

let ds;

beforeAll(() => {
  ds = new dataStore();
});

afterAll(() => {
  ds = null;
});

test('dataStore empty', () => {
  const store = ds.getAll();
  expect(store).toEqual({});
});

test('dataStore save', () => {
  const s1 = ds.save('foo', 'bar');
  expect(s1).toBe(ds);
  expect(s1.getAll()).toEqual({foo: 'bar'});
  const s2 = ds.save('baz', {a: 'b'});
  expect(s2).toBe(ds);
  expect(s2.getAll()).toEqual({foo: 'bar', baz: {a: 'b'}});
});

test('dataStore get', () => {
  const v1 = ds.get('foo');
  expect(v1).toBe('bar');
  const v2 = ds.get('baz');
  expect(v2).toEqual({a: 'b'});
  const v3 = ds.get('error');
  expect(v3).toBe(null);
});

test('dataStore remove', () => {
  const r1 = ds.remove('foo');
  expect(r1).toBe(true);
  expect(ds.getAll()).toEqual({baz: {a: 'b'}});
  const r2 = ds.remove('baz');
  expect(r2).toBe(true);
  expect(ds.getAll()).toEqual({});
  const r3 = ds.remove('error');
  expect(r3).toBe(false);
  expect(ds.getAll()).toEqual({});
});