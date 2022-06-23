import { readString, readNumber, readBoolean, missingEnvVars, readPassword, readUrl } from '../src/index';

const regexForIpV4Address = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

const myconfig = {
  port: readNumber('PORT', { defaultValue: 8080 }),
  user: readString(['CURRENT_USER', 'DEFAULT_USER']),
  serviceUrl: readUrl('SERVICE_URL'),
  database: {
    host: readString('DB_HOST_IP', { validator: regexForIpV4Address }),
    port: readNumber('DB_PORT'),
    username: readString('DB_USERNAME'),
    password: readPassword('DB_PASSWORD'),
    keepConnectionOpen: readBoolean('KEEP_CONNECTION_OPEN'),
  },
};

if (missingEnvVars) {
  console.error('Some required env vars were missing. Terminating');
  process.exit(1);
}

export default myconfig;
