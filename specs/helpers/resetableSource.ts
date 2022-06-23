export class ResetableSource {
  source: {[key: string]: string}
  constructor () {
    this.source = {}
  }

  clear() {
    const keys = Object.keys(this.source);
    for(const key of keys) {
      delete this.source[key]
    }
  }
}


