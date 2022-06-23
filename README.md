# SP Conf

SimPle CONFig TypeScript

A small component for reading config.
It will log all the variables your are reading so you can see what values your app it using, obfuscating passwords,
It will also check if any variables are missing and allow your app to respond.

## Gettings Started

    $ yarn add sp-conf-ts

## How to use

Check out example.ts that shows an example of using it.
```typescript
import {
  readString, 
  readNumber, 
  readBoolean, 
  missingEnvVars, 
  readPassword, 
  readUrl
} from 'sp-conf-ts'

const regexForIpV4Address = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/

const myconfig = {
  port: readNumber('PORT', {defaultValue: 8080}),
  user: readString(['CURRENT_USER', 'DEFAULT_USER']),
  serviceUrl: readUrl('SERVICE_URL'),
  database: {
    host: readString('DB_HOST_IP', {validator: regexForIpV4Address}),
    port: readNumber('DB_PORT'),
    username: readString('DB_USERNAME'),
    password: readPassword('DB_PASSWORD'),
    keepConnectionOpen: readBoolean('KEEP_CONNECTION_OPEN')
  }
}

if (missingEnvVars) {
  console.error('Some required env vars were missing. Terminating')
  process.exit(1)
}

export default myconfig
```

## Options common to all methods

* `defaultValue` - The value to use if the specified value is not available

* `validator` - A regular expressing to specify the format of the input value

* `log` - A function that logs about reading env var. Defaults to logging to `stdout`.
E.g. To log messages with a prefix:
```typescript
log: (msg: string) => console.log('message:', msg)
```

* `error` - A function that reports errors while reading env var. Defaults to logging to `stderr`.
E.g. To log errors with a prefix:
```typescript
error: (err: string) => console.error('error:', err)
```

* `source` - The object to read env vars from. Defaults to process.env

## Methods available

* `readString` - Read a string not applying any special rules

* `readNumber` - Read a number and complain if its not a number

* `readPassword` - Read a string but will obfuscate when logging the value out

* `readUrl` - Read a URL and will obfuscate the password if the URL contains one.

* `readBool` - Read a boolean and complain if it's not valid. Expected characters are:
  * truthy values - `"true"`, `"t"`, `"on"`, `"1"`
  * falsy falues - `"false"`, `"f"`, `"off"`, `"0"`
It is not case sensitive so, for example, both `"True"` and `"TRUE"` work just fine

  To use your own value for true/false supply the `trueValue` and/or `falseValue`.
  E.g. To log errors with a prefix:
  ```typescript
  keepConnectionOpen: readBoolean('LOAD_STUFF', {trueValue: 'yes', falseValue: 'no' })
  ```

  If you supply `isSetIsTrue` insted, then the result will be `true` if the envvar exists (even empty) and `false` if not.

* `readCertificate` - Read a certificate (a string start is bookmarked by `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` by default) Set options `beginCertificate` and `endCertificate` to use different headder and footer.