
import {format} from 'util'

export class LoggingLogger {
  calls: string[]
  constructor () {
    this.calls = []
  }

  log (template: string, ...rest: any[]) {   
    this.calls.push(format(template, ...rest))
  }

  clear() {
    this.calls.length = 0
  }
}


