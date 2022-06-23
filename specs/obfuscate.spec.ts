import { obfuscate, obfuscateAuth, obfuscateCertificate } from '../src/obfuscate';

describe('obfuscate', () => {
  describe('totally masking passwords less than 6 characters long', () => {
    [
      { in: '1', out: '*' },
      { in: '12', out: '**' },
      { in: '123', out: '***' },
      { in: '1234', out: '****' },
      { in: '12345', out: '*****' },
    ].forEach((testCase) => {
      it('must mask ' + testCase.in + ' to ' + testCase.out, () => {
        const obfusicated = obfuscate(testCase.in);
        expect(obfusicated).toBe(testCase.out);
      });
    });
  });

  describe('partial masking passwords 6 characters or longer', () => {
    test.each`
      input                | expected
      ${'123456'}          | ${'1****6'}
      ${'1234567'}         | ${'1*****7'}
      ${'12345678'}        | ${'1******8'}
      ${'123456789'}       | ${'1*******9'}
      ${'123456789A'}      | ${'1********A'}
      ${'123456789AB'}     | ${'1*********B'}
      ${'123456789ABC'}    | ${'12********BC'}
      ${'123456789ABCD'}   | ${'12*********CD'}
      ${'123456789ABCDE'}  | ${'12**********DE'}
      ${'123456789ABCDEF'} | ${'12***********EF'}
    `('must mask $expected to $input', ({ input, expected }) => {
      const obfusicated = obfuscate(input);
      expect(obfusicated).toBe(expected);
    });
  });

  describe('a url', () => {
    it('must not mind if auth is missing', () => {
      const url = 'http://host.com/';
      const obfusicated = obfuscateAuth(url);
      expect(obfusicated).toBe('http://host.com/');
    });

    it('must not obfuscate username', () => {
      const url = 'http://username@host.com/';
      const obfusicated = obfuscateAuth(url);
      expect(obfusicated).toBe('http://username@host.com/');
    });

    it('must totally mask password less than 6 chars', () => {
      const url = 'http://user:pass@host.com/';
      const obfusicated = obfuscateAuth(url);
      expect(obfusicated).toBe('http://user:****@host.com/');
    });

    it('must partial mask password 6 chars or longer', () => {
      const url = 'http://username:password@host.com/';
      const obfusicated = obfuscateAuth(url);
      expect(obfusicated).toBe('http://username:p******d@host.com/');
    });
  });

  describe('a certificate', () => {
    it('must remove the header, footer and most of the body', () => {
      const certificate = '-----BEGIN CERTIFICATE-----\nABCDEF1234567890\n-----END CERTIFICATE-----';
      const obfusicated = obfuscateCertificate(certificate);
      expect(obfusicated).toBe('AB************90');
    });

    it('must combine key onto one line', () => {
      const certificate = '-----BEGIN CERTIFICATE-----\nABCDEF12\n34567890\n-----END CERTIFICATE-----';
      const obfusicated = obfuscateCertificate(certificate);
      expect(obfusicated).toBe('AB************90');
    });

    it('must not mind of the footer and/or header are missing', () => {
      const certificate = `ABCDEF1234567890`;
      const obfusicated = obfuscateCertificate(certificate);
      expect(obfusicated).toBe('AB************90');
    });

    it('must keep the output less than 30 characters', () => {
      const certificate = `0123456789012345678901234567890123456789`;
      const obfusicated = obfuscateCertificate(certificate);
      expect(obfusicated).toBe('012**********...**********789');
    });
  });
});
