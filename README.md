# web-sdk-bridge
## Introduction
A bridge for web and sdk two way messages. For hybrid app send messages.

Inspired by this article [Hybrid App技术解析 -- 实战篇](https://juejin.im/post/6844903648510607373)

## Features
- Build with ESM
- No external dependencies
- Easy to setup and use
- Based on customEvents and custom schema

## Install
```bash
> npm i web-sdk-bridge --save
```

## Setup
### 1. Initialize
```javascript
import Bridge from 'web-sdk-bridge';

// initianlize
const bridge = new Bridge({
  protocol: 'custom_protocol',
  prefix: 'custom_prefix_',
});

window.bridge = bridge;
```

### 2. Send message from web to SDK
#### Basic usage:
```javascript
/**
 * This will actually send a get request with
 * this url: custom_protocol://custom_prefix_select_photo/?handler=0.
 */ 
window.bridge.nativeCall(
  'select_photo',
);
```
#### Pass params and callback:
```javascript
/**
 * This will actually send a get request with
 * this url: custom_protocol://custom_prefix_select_photo/?handler=0.
 * SDK need to parse the url to get the params
 */ 
window.bridge.nativeCall(
  'select_photo',
  {
    count: 1,
  },
  (data) => {
    // dosomething with the data
  },
);
```

### 2. Send message from SDK to web
#### Basic usage:
```javascript
/**
 * Alternatively, javascript can assign the bridge object to window,
 * so that SDK (like ios and android) can access
 * the Bridge instance method.
 */
window.bridge.postMessage(
  {
    handler: 0, // required handler from nativeCall url query
    data: {
      result: 'success',
      images: [],
    },
  }
);
```
#### Get web passed params:
```javascript
/**
 * Use bridge instance method getParam with prev handler
 */
const params = window.bridge.getParam(handler);
// do something with params...
// send to web
window.bridge.postMessage(
  {
    handler: 0, // required handler from nativeCall url query
    data: {
      result: 'success',
      images: [],
    },
  }
);
```

### 3. Web event listener
Sometimes web need to listen event from SDK or native.
```javascript
/**
 * Web add custom event
 */
window.bridge.addEvent('my_custom_event', (ev) => {
  const data = ev.data;
  // dosomething with the data...
});

/**
 * SDK fire event at property time
 */
window.bridge.fireEvent('my_custom_event', {
  a: 1,
  b: 2,
  ...
});
```

## Architecture
![architecture](/architecture.png)