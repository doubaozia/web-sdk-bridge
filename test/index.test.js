import Bridge, { decode, getHandlerKey, isFn, send } from '../src';

jest.useFakeTimers();

test('decode function', () => {
  const r1 = decode('abc');
  expect(r1).toBe('abc');
  const r2 = decode('{"a": 1, "b": 2}');
  expect(r2).toEqual({a: 1, b: 2});
});

test('getHandlerKey function', () => {
  const r1 = getHandlerKey(1);
  expect(r1).toEqual({
    p: '_params_1',
    c: '_callback_1',
    e: '_event_1',
  });
  const r2 = getHandlerKey('2');
  expect(r2).toEqual({
    p: '_params_2',
    c: '_callback_2',
    e: '_event_2',
  });
});

test('isFn function', () => {
  const r1 = isFn();
  expect(r1).toBe(false);
  const r2 = isFn(null);
  expect(r2).toBe(false);
  const r3 = isFn('123');
  expect(r3).toBe(false);
  const r4 = isFn(() => {});
  expect(r4).toBe(true);
  function a() {}
  const r5 = isFn(a);
  expect(r5).toBe(true);
});

test('send function', () => {
  send('http://www.baidu.com/');
  const $ = require('jquery');
  jest.advanceTimersByTime(100);
  expect($('iframe')[0].src).toBe('http://www.baidu.com/');
  expect($('iframe')[0].style.display).toBe('none');
  jest.advanceTimersByTime(400);
  expect($('iframe').length).toBe(0);
});

describe('bridge class', () => {
  test('default options', () => {
    const bridge = new Bridge();
    const scheme = bridge.getScheme('key');
    expect(scheme).toBe('jsbridge://key');
  });
  test('custom options', () => {
    const bridge = new Bridge({
      protocol: 'custom',
      prefix: 'abc_',
    });
    const scheme = bridge.getScheme('key');
    expect(scheme).toBe('custom://abc_key');
  });
  test('nativeCall without params', () => {
    const bridge = new Bridge({
      protocol: 'http',
      prefix: 'p_',
    });
    bridge.nativeCall('scm');
    const param = bridge.getParam(0);
    expect(param).toBe('');
    jest.advanceTimersByTime(100);
    const $ = require('jquery');
    expect($('iframe')[0].src).toBe('http://p_scm/?handler=0');
    expect($('iframe')[0].style.display).toBe('none');
    jest.advanceTimersByTime(400);
    expect($('iframe').length).toBe(0);
  });
  
  test('nativeCall with params and callback', () => {
    const bridge = new Bridge({
      protocol: 'http',
      prefix: 'p_',
    });

    const mockCallback = jest.fn(() => 'success');
    bridge.nativeCall('scm', {a: 1}, mockCallback);
    const param = bridge.getParam(1);
    expect(param).toBe('{"a":1}');

    jest.advanceTimersByTime(100);
    const $ = require('jquery');
    expect($('iframe')[0].src).toBe('http://p_scm/?handler=1');
    expect($('iframe')[0].style.display).toBe('none');

    jest.advanceTimersByTime(400);
    expect($('iframe').length).toBe(0);

    const r1 = bridge.postMessage({handler: 1});
    expect(r1).toBe(bridge);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.results[0].value).toBe('success');

    const r2 = bridge.postMessage({handler: 1});
    expect(r2).toBe(bridge);
    expect(mockCallback.mock.calls.length).toBe(1);
  });
});