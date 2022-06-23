import { obfuscate, obfuscateAuth, obfuscateCertificate } from './obfuscate'

export interface DefaultOptions {
  source: {[key: string]: string | undefined}
  log: (msg: string) => void
  error: (msg: string) => void
}

export interface Options<T> extends DefaultOptions {
  validator?: string | RegExp
  defaultValue?: T
  isInnerFunction?: boolean
}

export let missingEnvVars = false
export const defaultOptions: Partial<DefaultOptions> = {}

export function resetSpConf() {
  missingEnvVars = false
  delete defaultOptions.error
  delete defaultOptions.log
  delete defaultOptions.source
}

export function readString (name: string | string[], suppliedOptions?: Partial<Options<string>> | string): string | undefined {
  const options = _cleanOptions( (typeof suppliedOptions === 'string') ? {defaultValue: suppliedOptions} : suppliedOptions)
  if (Array.isArray(name)) {
    return _tryEach<string>(readString, 'string', name, options)
  }

  const val = options.source[name]

  if (val !== undefined) {
    if (_failedvalidator(options.validator, val)) {
      if (!options.isInnerFunction) {
        options.error(`Expected env var "${name}" to be match pattern "${options.validator}" but was "${val}" and did not.`)
        missingEnvVars = true
      }
    } else {
      options.log(`Using env var ${name} ${val}`)
      return val
    }
  } else if (options.defaultValue !== undefined) {
    options.log(`Using default ${name} ${options.defaultValue}`)
    return options.defaultValue
  } else if (!options.isInnerFunction) {
    options.error(`Required string env var "${name}" was not supplied.`)
    missingEnvVars = true
  }
}

export function readNumber (name: string | string[], suppliedOptions?: Partial<Options<number>> | number): number | undefined {
  const options = _cleanOptions( (typeof suppliedOptions === 'number') ? {defaultValue: suppliedOptions} : suppliedOptions)
  if (Array.isArray(name)) return _tryEach(readNumber, 'number', name, options)

  const val = options.source[name]
  if (val !== undefined) {
    const number = parseInt(val, 10)
    if (('' + number) !== val) {
      if (!options.isInnerFunction) {
        options.error(`Expected env var "${name}" to be numeric but was "${val}".`)
        missingEnvVars = true
      }
    } else {
      options.log(`Using env var ${name} ${number}`)
      return number
    }
  } else if (options.defaultValue !== undefined) {
    options.log(`Using default env var ${name} ${options.defaultValue}`)
    return options.defaultValue
  } else if (!options.isInnerFunction) {
    options.error(`Required numeric env var "${name}" was not supplied.`)
    missingEnvVars = true
  }
}

export interface BooleanOptions extends Options<boolean> {
  trueValue?: string | string[]
  falseValue?: string | string[]
  isSetIsTrue?: boolean
}

export function readBoolean (name: string | string[], suppliedOptions?: Partial<BooleanOptions> | boolean): boolean | undefined {
  const optionsObj =  (typeof suppliedOptions === 'boolean') ? {defaultValue: suppliedOptions} : suppliedOptions
  const options: BooleanOptions = {
    ..._cleanOptions(optionsObj),
    trueValue: optionsObj?.trueValue,
    falseValue: optionsObj?.falseValue,
    isSetIsTrue: optionsObj?.isSetIsTrue,
  }

  const extraTrueValues =  optionsObj?.trueValue ? Array.isArray(optionsObj.trueValue)? optionsObj.trueValue : [optionsObj.trueValue.toLocaleLowerCase()] :[]
  const extraFalseValues =  optionsObj?.falseValue ? Array.isArray(optionsObj.falseValue)? optionsObj.falseValue : [optionsObj.falseValue.toLocaleLowerCase()] :[]

  const trueValues = ['t', 'true', 'on', '1', ...extraTrueValues]
  const falseValues = ['f', 'false', 'off', '0', ...extraFalseValues]
 
  if (Array.isArray(name)) return _tryEach(readBoolean, 'boolean', name, options)

  const val = options.source[name]
  if (options.isSetIsTrue){
    const res = options.source.hasOwnProperty(name) 
    options.log(`Using env var ${name} is set (${val}) so ${res}`)
    return true
  } else if (val !== undefined) {
    const valLower = val.toLowerCase()
    if ( trueValues.includes(valLower)) {
      options.log(`Using env var ${name} true`)
      return true
    } else if ( falseValues.includes(valLower)) {
      options.log(`Using env var ${name} false`)
      return false
    } else  if (!options.isInnerFunction) {
      options.error(`Expected env var "${name}" to be a bool but was "${val}".`)
      missingEnvVars = true
    }
  } else if (options.defaultValue !== undefined) {
    options.log(`Using default env var ${name} ${options.defaultValue}`)
    return options.defaultValue
  } else  if (!options.isInnerFunction){
    options.error(`Required numeric env var "${name}" was not supplied.`)
    missingEnvVars = true
  }
}

export function readPassword (name: string | string[], suppliedOptions?: Partial<Options<string>> | string): string | undefined {
  const options = _cleanOptions( (typeof suppliedOptions === 'string') ? {defaultValue: suppliedOptions} : suppliedOptions)
  if (Array.isArray(name)) return _tryEach<string>(readPassword, 'password', name, options)

  const val = options.source[name]
  if (val !== undefined) {
    options.log(`Using env var ${name} ${obfuscate(val)}`)
    return val
  } else if (options.defaultValue !== undefined) {
    options.log(`Using default ${name} ${obfuscate(options.defaultValue)}`)
    return options.defaultValue
  } else if (!options.isInnerFunction) {
    options.error(`Required password env var "${name}" was not supplied.`)
    missingEnvVars = true
  }
}

export interface CertificateOptions extends Options<string> {
  beginCertificate?: string
  endCertificate?: string 
}

export function readCertificate (name: string | string[], suppliedOptions?: Partial<CertificateOptions> | string): string | undefined {
  const optionsObj = ( (typeof suppliedOptions === 'string') ? {defaultValue: suppliedOptions} : suppliedOptions)
  
  const options: CertificateOptions = {
    ..._cleanOptions(optionsObj),
    beginCertificate: optionsObj?.beginCertificate,
    endCertificate: optionsObj?.endCertificate,
  }
  
  if (Array.isArray(name)) return _tryEach<string>(readCertificate, 'certificate', name, options)

  const val = options.source[name]
  if (val !== undefined) {
    options.log(`Using env var ${name} ${obfuscateCertificate(val, options.beginCertificate, options.endCertificate )}`)
    return val
  } else if (options.defaultValue !== undefined) {
    options.log(`Using default ${name} ${obfuscateCertificate(options.defaultValue, options.beginCertificate, options.endCertificate)}`)
    return options.defaultValue
  } else  if (!options.isInnerFunction) {
    options.error(`Required certificate env var "${name}" was not supplied.`)
    missingEnvVars = true
  }
}

export function readUrl (name: string | string[], suppliedOptions?: Partial<Options<string>> | string): string | undefined {
  const options = _cleanOptions( (typeof suppliedOptions === 'string') ? {defaultValue: suppliedOptions} : suppliedOptions)
  if (Array.isArray(name)) return _tryEach<string>(readUrl, 'url', name, options)

  const val = options.source[name]
  if (val !== undefined) {
    if (_failedvalidator(options.validator, val)) {
      if (!options.isInnerFunction) {
        options.error(`Expected env var "${name}" to be match pattern "${options.validator}" but was "${obfuscateAuth(val)}" and did not.`)
        missingEnvVars = true
      }
    } else {
      options.log(`Using env var ${name} ${obfuscateAuth(val)}`)
      return val
    }
  } else if (options.defaultValue !== undefined) {
    options.log(`Using default ${name} ${obfuscateAuth(options.defaultValue)}`)
    return options.defaultValue
  } else  if (!options.isInnerFunction) {
    options.error(`Required url env var "${name}" was not supplied.`)
    missingEnvVars = true
  }
}

type Func<T> =  (name: string | string[], options: Options<T>) => T | undefined

function _tryEach<T> (func: Func<T>, type: string, names: string[], options: Options<T>): T | undefined {
  let found = null

  names.find(name => {
    const innerOptions = {
      ...options,
      isInnerFunction: true
    }
    delete innerOptions.defaultValue

    found = func(name, innerOptions)

    if (found) return true
    options.log(`Could not use ${type} "${name}".`)
  })

  if (found) return found

  if (options.defaultValue !== undefined) {
    options.log(`Using default for ${names} ${options.defaultValue}`)
    return options.defaultValue
  }

  missingEnvVars = true
  options.error(`At least one of required ${type}s "${names.join('" or "')}" was not supplied.`)
}

function _failedvalidator (validator: string | RegExp | undefined, val: string): boolean {
  if (!validator) return false

  if (typeof validator === 'string'){
    return !(new RegExp(validator)).test(val)
  }
  return !validator.test(val)
}

function _cleanOptions<T> (options: Partial<Options<T>> = {}): Options<T> {
  const combinedOptions = {
    ...defaultOptions,
    ...options
  }

  return {
    defaultValue: combinedOptions.defaultValue,
    source: combinedOptions.source ??  process.env,
    validator: combinedOptions.validator,
    isInnerFunction: combinedOptions.isInnerFunction,
    log: combinedOptions.log ?? ((msg: string) => console.log(msg)),
    error: combinedOptions.error ?? ((msg: string) => console.error(msg)),
  }
}
