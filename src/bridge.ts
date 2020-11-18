import DataStore from './dataStore';

const win = window;
const doc = win.document;
const { log } = console;
let i = 0;

interface HandlerKeyMap {
  p: string;
  c: string;
  e: string;
}

interface BridgeOptions {
  protocol?: string;
  prefix?: string;
}

interface CustomEventData {
  handler: string | number;
  data: any;
}

interface CustomEvent {
  data: CustomEventData;
}

export const decode = (data: string): CustomEventData => {
  let decoded;
  try {
    decoded = JSON.parse(data);
  } catch (e) {
    decoded = data;
  }
  return decoded;
}

export const getHandlerKey = (handler: string | number): HandlerKeyMap => {
  return {
    p: `_params_${handler}`,
    c: `_callback_${handler}`,
    e: `_event_${handler}`,
  };
}

export const isFn = (param: any): boolean => {
  if (!param) {
    return false;
  }
  return ({}).toString.call(param) === '[object Function]';
}

export const  send = (scheme: string): void => {
  setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.src = scheme;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    setTimeout((): void => {
      (iframe.parentNode as HTMLElement).removeChild(iframe);
    }, 300);
  }, 0);
}

class Bridge {
  private protocol: string;

  private prefix: string;

  private _events: {
    [key: string]: (e: CustomEvent) => void;
  };

  private _paramsStore: DataStore;

  private _callbackStore: DataStore;

  constructor(options?: BridgeOptions) {
    const opts = options || {
      protocol: 'jsbridge',
      prefix: '',
    };
    this.protocol = opts.protocol || 'jsbridge';
    this.prefix = opts.prefix || '';

    this._events = {};
    this._paramsStore = new DataStore();
    this._callbackStore = new DataStore();
  }

  getScheme(name: string): string {
    return `${this.protocol}://${this.prefix}${name}`;
  }

  getParam(handler: string): any {
    const key = getHandlerKey(handler).p;
    return this._paramsStore.get(key);
  }

  nativeCall(scheme: string, params?: any, callback?: (d: any) => void) {
    const newParams = params ? JSON.stringify(params) : '';

    const hdlr = i;
    i += 1;
    const handlerKey = getHandlerKey(hdlr);

    this._paramsStore.save(handlerKey.p, newParams);

    if (callback && isFn(callback)) {
      this._callbackStore.save(handlerKey.c, callback);

      const eventCallback = (e: CustomEvent): void => {
        const { data, handler } = e.data;
        this.removeEvent(handler);
        callback.call(this, data);
      };

      this.addEvent(handlerKey.e, eventCallback);
    }

    send(`${this.getScheme(scheme)}?handler=${hdlr}`);
  }

  postMessage(e: string): Bridge {
    const d = e ? decode(e) : { handler: 0 };
    const { handler } = d;
    const evName = getHandlerKey(handler).e;
    this.fireEvent(evName, d);
    return this;
  }

  addEvent(name: string, callback: (e: CustomEvent) => void) {
    if ((doc as any).attachEvent) {
      (doc as any).attachEvent(`on${name}`, (e: CustomEvent): void => {
        callback.call(doc, e);
      });
    } else if ('addEventListener' in doc) {
      (doc as any).addEventListener(name, callback, false);
    }
    this._events[name] = callback;
  }

  removeEvent(handler: string | number) {
    const handlerKey = getHandlerKey(handler);
    const callback = this._events[handlerKey.e];

    if ((doc as any).detachEvent) {
      (doc as any).detachEvent(`on${handlerKey.e}`, callback);
    } else if ('removeEventListener' in doc) {
      (doc as any).removeEventListener(handlerKey.e, callback, false);
    }

    if (Object.prototype.hasOwnProperty.call(this._events, handlerKey.e)) {
      delete this._events[handlerKey.e];
    }
  }

  fireEvent(evName: string, data: any) {
    let eventItem;
    if (isFn((doc as any).CustomEvent)) {
      eventItem = (doc as any).CustomEvent(evName, {
        bubbles: true,
        cancelable: true,
      });
    } else if (isFn(doc.createEvent)) {
      eventItem = doc.createEvent('Event');
      eventItem.initEvent(evName, true, true);
    }
    if (data && eventItem) {
      eventItem.data = decode(data);
    }
    if (eventItem) {
      doc.dispatchEvent(eventItem);
    } else {
      log('Bridge Error: dispatchEvent');
    }

    return this;
  }
}

export default Bridge;
