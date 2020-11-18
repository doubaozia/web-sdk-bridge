class DataStore {
  private storage: {
    [key: string]: any;
  };

  constructor() {
    this.storage = {};
  }

  get(key: string | number): any {
    if (Object.prototype.hasOwnProperty.call(this.storage, key)) {
      return this.storage[key];
    }
    return null;
  }

  getAll(): any {
    return this.storage;
  }

  save(key: string | number, value: any): DataStore {
    this.storage[key] = value;
    return this;
  }

  remove(key: string | number): boolean {
    if (Object.prototype.hasOwnProperty.call(this.storage, key)) {
      delete this.storage[key];
      return true;
    }
    return false;
  }
}

export default DataStore;
