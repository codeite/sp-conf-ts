import {LoggingLogger} from './helpers/loggingLogger'
import {ResetableSource} from './helpers/resetableSource'
import {readString, readNumber, readBoolean, missingEnvVars, defaultOptions, resetSpConf, readPassword, readCertificate, readUrl} from '../src/index'

const logList = new LoggingLogger()
const errorList = new LoggingLogger()
const resetableSource = new ResetableSource()


describe('sp-config', () => {
  beforeEach(() => {
    logList.clear()
    errorList.clear()
    resetableSource.clear()
    resetSpConf()
    
    defaultOptions.log = logList.log.bind(logList)
    defaultOptions.error = errorList.log.bind(errorList)
    
  })

  describe('reading from the environment', () => {
    it('must be able to read from the environment', () => {
      const SP_CONFIG_TEST = 'SP_CONFIG_TEST'
      process.env[SP_CONFIG_TEST] = 'the test is good'

      const spConfigTest = readString(SP_CONFIG_TEST)

      expect(spConfigTest).toBe('the test is good')
    })
  })

  describe('reading from an object source', () => {

    beforeEach(() => {
      defaultOptions.source = resetableSource.source
      defaultOptions.log = logList.log.bind(logList)
      defaultOptions.error = errorList.log.bind(errorList)
    })

    describe('reading a string', () => {
      it('must be able to read a string and log success', () => {
        const HAPPY_PATH = 'HAPPY_PATH'
        resetableSource.source[HAPPY_PATH] = 'cheese'

        const happyPath = readString(HAPPY_PATH)

        expect(happyPath).toBe('cheese')
        expect(missingEnvVars).toBe(false)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var HAPPY_PATH cheese')
      })

      it('must be able to use a default value for a string and report', () => {
        const MISSING_BUT_DEFAULT = 'MISSING_BUT_DEFAULT'

        const missingButDefault = readString(MISSING_BUT_DEFAULT, {defaultValue: 'leopard'})

        expect(missingButDefault).toBe('leopard')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using default MISSING_BUT_DEFAULT leopard')
      })

      it('missing string env vars must set missingEnvVars to true and log', () => {
        const MISSING_ENV = 'MISSING_ENV'

        readString(MISSING_ENV)

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Required string env var "MISSING_ENV" was not supplied.')
      })

      it('string with passing regex validator must be read and log success', () => {
        const INVALID_STRING = 'INVALID_STRING'
        resetableSource.source[INVALID_STRING] = 'too long'

        readString(INVALID_STRING, {validator: /^.{1,5}$/})

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Expected env var "INVALID_STRING" to be match pattern "/^.{1,5}$/" but was "too long" and did not.')
      })

      it('string with failing regex validator must set missingEnvVars to true and log', () => {
        const VALID_STRING = 'VALID_STRING'
        resetableSource.source[VALID_STRING] = 'nice'

        const validString = readString(VALID_STRING, {validator: /^.{1,5}$/})

        expect(validString).toBe('nice')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var VALID_STRING nice')
      })

      it('must be able to use a string as a validator', () => {
        const INVALID_STRING = 'INVALID_STRING'
        resetableSource.source[INVALID_STRING] = 'too long'

        readString(INVALID_STRING, {validator: '/^.{1,5}$/'})

        expect(errorList.calls[0]).toBe('Expected env var "INVALID_STRING" to be match pattern "/^.{1,5}$/" but was "too long" and did not.')
        expect(missingEnvVars).toBe(true)
      })
    })

    describe('reading a number', () => {
      it('must be able to read a number and log success', () => {
        const A_GOOD_NUMBER = 'A_GOOD_NUMBER'
        resetableSource.source[A_GOOD_NUMBER] = '123'

        const aGoodNumber = readNumber(A_GOOD_NUMBER)

        expect(aGoodNumber).toBe(123)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var A_GOOD_NUMBER 123')
      })

      it('must be able to use a default value for a number and report', () => {
        const MISSING_BUT_DEFAULT_NUMBER = 'MISSING_BUT_DEFAULT_NUMBER'

        const missingButDefaultNumber = readNumber(MISSING_BUT_DEFAULT_NUMBER, {defaultValue: 88})

        expect(missingButDefaultNumber).toBe(88)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using default env var MISSING_BUT_DEFAULT_NUMBER 88')
      })

      it('missing number env vars must set missingEnvVars to true and log', () => {
        const MISSING_ENV = 'MISSING_ENV'

        readNumber(MISSING_ENV)

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Required numeric env var "MISSING_ENV" was not supplied.')
      })

      it('badly formated number must set missingEnvVars to true and log', () => {
        const NOT_A_NUMBER = 'NOT_A_NUMBER'
        resetableSource.source[NOT_A_NUMBER] = 'elephant'

        readNumber(NOT_A_NUMBER)

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Expected env var "NOT_A_NUMBER" to be numeric but was "elephant".')
      })
    })

    describe('reading a boolean', () => {
      it('must be able to read a bool and log success', () => {
        const A_GOOD_BOOL = 'A_GOOD_BOOL'
        resetableSource.source[A_GOOD_BOOL] = 'true'

        const aGoodBool = readBoolean(A_GOOD_BOOL)

        expect(aGoodBool).toBe(true)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var A_GOOD_BOOL true')
      })

      ;['t', 'T', 'true', 'TRUE', 'True', 'TrUe', 'on', 'ON', 'On', '1'].forEach(testCase => {
        it(`must read "${testCase}" as a "true" bool and log success`, () => {
          const A_GOOD_BOOL = 'A_GOOD_BOOL'
          resetableSource.source[A_GOOD_BOOL] = testCase

          const aGoodBool = readBoolean(A_GOOD_BOOL)

          expect(aGoodBool).toBe(true)
          expect(logList.calls.length).toBe(1)
          expect(errorList.calls.length).toBe(0)
          expect(logList.calls[0]).toBe('Using env var A_GOOD_BOOL true')
        })
      })

      ;['f', 'F', 'false', 'FALSE', 'False', 'FaLsE', 'off', 'OFF', 'Off', '0'].forEach(testCase => {
        it(`must read "${testCase}" as a "false" bool and log success`, () => {
          const A_GOOD_BOOL = 'A_GOOD_BOOL'
          resetableSource.source[A_GOOD_BOOL] = testCase

          const aGoodBool = readBoolean(A_GOOD_BOOL)

          expect(aGoodBool).toBe(false)
          expect(logList.calls.length).toBe(1)
          expect(errorList.calls.length).toBe(0)
          expect(logList.calls[0]).toBe('Using env var A_GOOD_BOOL false')
        })
      })

      it('must be able to use a default value for a bool and report', () => {
        const MISSING_BUT_DEFAULT_BOOL = 'MISSING_BUT_DEFAULT_BOOL'

        const missingButDefaultBool = readBoolean(MISSING_BUT_DEFAULT_BOOL, {defaultValue: true})

        expect(missingButDefaultBool).toBe(true)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using default env var MISSING_BUT_DEFAULT_BOOL true')
      })

      it('missing bool env vars must set missingEnvVars to true and log', () => {
        const MISSING_ENV = 'MISSING_ENV'

        readBoolean(MISSING_ENV)

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Required numeric env var "MISSING_ENV" was not supplied.')
      })

      it('badly formated boolean must set missingEnvVars to true and log', () => {
        const NOT_A_BOOL = 'NOT_A_BOOL'
        resetableSource.source[NOT_A_BOOL] = 'elephant'

        readBoolean(NOT_A_BOOL)

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Expected env var "NOT_A_BOOL" to be a bool but was "elephant".')
      })

      it(`must read "wibble" as a "true" bool if  {trueValue: 'wibble'} and log success`, () => {
        const A_GOOD_BOOL = 'A_GOOD_BOOL'
        resetableSource.source[A_GOOD_BOOL] = 'wibble'

        const aGoodBool = readBoolean(A_GOOD_BOOL, {trueValue: 'wibble'})

        expect(aGoodBool).toBe(true)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var A_GOOD_BOOL true')
      })

      it(`must read "wibble" as a "false" bool if  {falseValue: 'wibble'} and log success`, () => {
        const A_GOOD_BOOL = 'A_GOOD_BOOL'
        resetableSource.source[A_GOOD_BOOL] = 'wibble'

        const aGoodBool = readBoolean(A_GOOD_BOOL, {falseValue: 'wibble'})

        expect(aGoodBool).toBe(false)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var A_GOOD_BOOL false')
      })

      it(`must read "wibble" as a "true" bool if  {trueValue: ['wobble', 'wibble']} and log success`, () => {
        const A_GOOD_BOOL = 'A_GOOD_BOOL'
        resetableSource.source[A_GOOD_BOOL] = 'wibble'

        const aGoodBool = readBoolean(A_GOOD_BOOL, {trueValue: ['wobble', 'wibble']})

        expect(aGoodBool).toBe(true)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var A_GOOD_BOOL true')
      })

      it(`must read "wibble" as a "false" bool if  {falseValue:  ['wobble', 'wibble']} and log success`, () => {
        const A_GOOD_BOOL = 'A_GOOD_BOOL'
        resetableSource.source[A_GOOD_BOOL] = 'wibble'

        const aGoodBool = readBoolean(A_GOOD_BOOL, {falseValue: ['wobble', 'wibble']})

        expect(aGoodBool).toBe(false)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var A_GOOD_BOOL false')
      })
    })

    describe('reading a password', () => {
      it('must be able to read a password and log success with obfuscation', () => {
        const HAPPY_PATH = 'HAPPY_PATH'
        resetableSource.source[HAPPY_PATH] = 'cheese'

        const happyPath = readPassword(HAPPY_PATH)

        expect(happyPath).toBe('cheese')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var HAPPY_PATH c****e')
      })

      it('must be able to use a default value for a password and report with obfuscation', () => {
        const MISSING_BUT_DEFAULT_PASSWORD = 'MISSING_BUT_DEFAULT_PASSWORD'

        const missingButDefault = readPassword(MISSING_BUT_DEFAULT_PASSWORD, {defaultValue: 'leopard'})

        expect(missingButDefault).toBe('leopard')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using default MISSING_BUT_DEFAULT_PASSWORD l*****d')
      })

      it('missing password env vars must set missingEnvVars to true and log', () => {
        const MISSING_ENV = 'MISSING_ENV'

        readPassword(MISSING_ENV)

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Required password env var "MISSING_ENV" was not supplied.')
      })
    })

    describe('reading a certificate', () => {
      it('must be able to read a certificate and log success with obfuscation', () => {
        const HAPPY_PATH = 'HAPPY_PATH'
        resetableSource.source[HAPPY_PATH] = '-----BEGIN CERTIFICATE-----\nABCDEF1234567890\n-----END CERTIFICATE-----'

        const happyPath = readCertificate(HAPPY_PATH)

        expect(happyPath).toBe('-----BEGIN CERTIFICATE-----\nABCDEF1234567890\n-----END CERTIFICATE-----')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var HAPPY_PATH AB************90')
      })

      it('must be able to use a default value for a certificate and report with obfuscation', () => {
        const MISSING_BUT_DEFAULT_PASSWORD = 'MISSING_BUT_DEFAULT_PASSWORD'

        const missingButDefault = readCertificate(MISSING_BUT_DEFAULT_PASSWORD, {defaultValue: 'leopard'})

        expect(missingButDefault).toBe('leopard')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using default MISSING_BUT_DEFAULT_PASSWORD l*****d')
      })

      it('missing certificate env vars must set missingEnvVars to true and log', () => {
        const MISSING_ENV = 'MISSING_ENV'

        readCertificate(MISSING_ENV)

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Required certificate env var "MISSING_ENV" was not supplied.')
      })

      it('must be able to read a certificate and log success with obfuscation with custom headers/footers', () => {
        const CUSTOM_HEADER_FOOTER = 'CUSTOM_HEADER_FOOTER'
        resetableSource.source[CUSTOM_HEADER_FOOTER] = '__START__\nABCDEF1234567890\n__END__'

        const happyPath = readCertificate(CUSTOM_HEADER_FOOTER, {beginCertificate: '__START__', endCertificate: '__END__'})

        expect(happyPath).toBe('__START__\nABCDEF1234567890\n__END__')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var CUSTOM_HEADER_FOOTER AB************90')
      })
    })

    describe('reading a url', () => {
      it('must be able to read a url and log success', () => {
        const HAPPY_PATH = 'HAPPY_PATH'
        resetableSource.source[HAPPY_PATH] = 'https://host.com:123/path?q=v#hash'

        const happyPath = readUrl(HAPPY_PATH)

        expect(happyPath).toBe('https://host.com:123/path?q=v#hash')
        expect(missingEnvVars).toBe(false)
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var HAPPY_PATH https://host.com:123/path?q=v#hash')
      })

      it('must not obfuscate usernames', () => {
        const HAPPY_PATH = 'HAPPY_PATH'
        resetableSource.source[HAPPY_PATH] = 'https://username@host.com:123/path?q=v#hash'

        readUrl(HAPPY_PATH)
        expect(logList.calls[0]).toBe('Using env var HAPPY_PATH https://username@host.com:123/path?q=v#hash')
      })

      it('must be able to obfuscating passwords', () => {
        const HAPPY_PATH = 'HAPPY_PATH'
        resetableSource.source[HAPPY_PATH] = 'https://username:password@host.com:123/path?q=v#hash'

        readUrl(HAPPY_PATH)
        expect(logList.calls[0]).toBe('Using env var HAPPY_PATH https://username:p******d@host.com:123/path?q=v#hash')
      })

      it('must be able to use a default value for a url and report', () => {
        const MISSING_BUT_DEFAULT = 'MISSING_BUT_DEFAULT'

        const missingButDefault = readUrl(MISSING_BUT_DEFAULT, {defaultValue: 'http://username:password@host.com/path'})

        expect(missingButDefault).toBe('http://username:password@host.com/path')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using default MISSING_BUT_DEFAULT http://username:p******d@host.com/path')
      })

      it('missing url env vars must set missingEnvVars to true and log', () => {
        const MISSING_ENV = 'MISSING_ENV'

        readUrl(MISSING_ENV)

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(0)
        expect(errorList.calls.length).toBe(1)
        expect(errorList.calls[0]).toBe('Required url env var "MISSING_ENV" was not supplied.')
      })
    })

    describe('reading a string with fallbacks', () => {
      it('must be able to read a string from the first opton', () => {
        const FIRST = 'FIRST'
        const SECOND = 'SECOND'
        resetableSource.source[FIRST] = 'alpha'
        resetableSource.source[SECOND] = 'beta'

        const readFirst = readString([FIRST, SECOND])

        expect(missingEnvVars).toBe(false)
        expect(readFirst).toBe('alpha')
        expect(logList.calls.length).toBe(1)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Using env var FIRST alpha')
      })

      it('must be able to read a string from the second option if the first is missing', () => {
        const FIRST = 'FIRST'
        const SECOND = 'SECOND'
        resetableSource.source[SECOND] = 'beta'

        const readSecond = readString([FIRST, SECOND])

        expect(missingEnvVars).toBe(false)
        expect(readSecond).toBe('beta')
        expect(logList.calls.length).toBe(2)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Could not use string "FIRST".')
        expect(logList.calls[1]).toBe('Using env var SECOND beta')
      })

      it('must give an error if non of the fall backs exist', () => {
        const FIRST = 'FIRST'
        const SECOND = 'SECOND'

        readString([FIRST, SECOND])

        expect(missingEnvVars).toBe(true)
        expect(logList.calls.length).toBe(2)
        expect(errorList.calls.length).toBe(1)
        expect(logList.calls[0]).toBe('Could not use string "FIRST".')
        expect(logList.calls[1]).toBe('Could not use string "SECOND".')
        expect(errorList.calls[0]).toBe('At least one of required strings "FIRST" or "SECOND" was not supplied.')
      })

      it('must use default if non of the fall backs exist', () => {
        const FIRST = 'FIRST'
        const SECOND = 'SECOND'

        const readFirstSecond = readString([FIRST, SECOND], {defaultValue: 'gamma'})

        expect(missingEnvVars).toBe(false)
        expect(readFirstSecond).toBe('gamma')
        expect(logList.calls.length).toBe(3)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Could not use string "FIRST".')
        expect(logList.calls[1]).toBe('Could not use string "SECOND".')
        expect(logList.calls[2]).toBe(`Using default for FIRST,SECOND gamma`)
      })

      it('must be able to read a string from the second option if the first is non valid', () => {
        const FIRST = 'FIRST'
        const SECOND = 'SECOND'
        resetableSource.source[FIRST] = 'alpha'
        resetableSource.source[SECOND] = 'beta'

        const readSecond = readString([FIRST, SECOND], {validator: /^b.+$/})

        expect(missingEnvVars).toBe(false)
        expect(readSecond).toBe('beta')
        expect(logList.calls.length).toBe(2)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Could not use string "FIRST".')
        expect(logList.calls[1]).toBe('Using env var SECOND beta')
      })
    })

    describe('reading a number with fallbacks', () => {
      it('must be able to read a number from the second option if the first is missing', () => {
        const FIRST = 'FIRST'
        const SECOND = 'SECOND'
        resetableSource.source[SECOND] = '2'

        const readSecond = readNumber([FIRST, SECOND])

        expect(missingEnvVars).toBe(false)
        expect(readSecond).toBe(2)
        expect(logList.calls.length).toBe(2)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Could not use number "FIRST".')
        expect(logList.calls[1]).toBe('Using env var SECOND 2')
      })

      it('must be able to read a number from the second option if the first is non valid', () => {
        const FIRST = 'FIRST'
        const SECOND = 'SECOND'
        resetableSource.source[FIRST] = 'cheese'
        resetableSource.source[SECOND] = '2'

        const readSecond = readNumber([FIRST, SECOND])

        expect(missingEnvVars).toBe(false)
        expect(readSecond).toBe(2)
        expect(logList.calls.length).toBe(2)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Could not use number "FIRST".')
        expect(logList.calls[1]).toBe('Using env var SECOND 2')
      })
    })

    describe('reading a password with fallbacks', () => {
      it('must be able to read a number from the second option if the first is missing', () => {
        const FIRST = 'FIRST'
        const SECOND = 'SECOND'
        resetableSource.source[SECOND] = 'supercalifragilisticexpialidocious'

        const readSecond = readPassword([FIRST, SECOND])

        expect(missingEnvVars).toBe(false)
        expect(readSecond).toBe('supercalifragilisticexpialidocious')
        expect(logList.calls.length).toBe(2)
        expect(errorList.calls.length).toBe(0)
        expect(logList.calls[0]).toBe('Could not use password "FIRST".')
        expect(logList.calls[1]).toBe('Using env var SECOND sup****************************ous')
      })
    })
  })
})