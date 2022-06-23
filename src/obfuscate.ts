import urlLib from 'url';

export function obfuscate(str?: string): string | undefined {
  if (!str) return str;

  let showBits = Math.floor(str.length / 6);
  if (showBits > 3) showBits = 3;

  const start = str.substr(0, showBits);
  const end = str.substr(-showBits, showBits);

  const middle = new Array(str.length - (showBits * 2 - 1)).join('*');

  return start + middle + end;
}

export function obfuscateAuth(urlString: string): string {
  const url = urlLib.parse(urlString);

  if (url.auth && url.auth.split) {
    const bits = url.auth.split(':');

    if (bits[1]) {
      bits[1] = obfuscate(bits[1]) ?? bits[1];
      url.auth = bits.join(':');
    }
  }

  return (url as any).format();
}

const defaultCertificateHeader = '-----BEGIN CERTIFICATE-----';
const defaultCertificateFooter = '-----END CERTIFICATE-----';

export function obfuscateCertificate(
  certificate: string,
  certificateHeader: string = defaultCertificateHeader,
  certificateFooter: string = defaultCertificateFooter,
) {
  if (!certificate) return certificate;

  const headerPos = certificate.indexOf(certificateHeader);
  if (headerPos !== -1) {
    certificate = certificate.substring(headerPos + certificateHeader.length);
  }

  const footerPos = certificate.indexOf(certificateFooter);
  if (footerPos !== -1) {
    certificate = certificate.substring(0, footerPos);
  }

  certificate = certificate.split(/\s+/).join('');

  let showBits = Math.floor(certificate.length / 6);
  if (showBits > 3) showBits = 3;

  const start = certificate.substr(0, showBits);
  const end = certificate.substr(-showBits, showBits);

  let middle = new Array(certificate.length - (showBits * 2 - 1)).join('*');
  if (middle.length > 26) {
    middle = '**********...**********';
  }

  return start + middle + end;
}
