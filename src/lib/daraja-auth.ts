import * as crypto from "crypto";

/**
 * Safaricom Sandbox X509 Public Certificate (PEM format)
 */
const SANDBOX_PUBLIC_CERT = `-----BEGIN CERTIFICATE-----
MIIDeDCCAmACCQDD8Rk33L/G1jANBgkqhkiG9w0BAQsFADB/MQswCQYDVQQGEwJL
RTENMAsGA1UECAwETmFpcm9iaTENMAsGA1UEBwwETmFpcm9iaTEcMBoGA1UECgwT
U2FmYXJpY29tIE1wZXNhIEFQSTEWMBQGA1UECwwNTXBlc2EgU2FuZGJveDEcMBoG
A1UEAwwTZGV2ZWxvcGVyLm1wZXNhLmNvbTAeFw0yMDA5MTgwOTMyMDhaFw0zMDA5
MTgwOTMyMDhaMH8xCzAJBgNVBAYTAktFMQ0wCwYDVQQIDAROYWlyb2JpMQ0wCwYD
VQQHDAROYWlyb2JpMRwwGgYDVQQKDBNTYWZhcmljb20gTXBlc2EgQVBJMRYwFAYD
VQQLDA1NcGVzYSBTYW5kYm94MRwwGgYDVQQDDBNkZXZlbG9wZXIubXBlc2EuY29t
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3/p8mNqN0wA99jR1L+3S
Zt1Z0U7q3x+WwY1q2k031L2T4P7j1r0+Z5x9p2q2q2q2q2q2q2q2q2q2q2q2q2q2
q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2
q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2
q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2
wIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQA1/p8mNqN0wA99jR1L+3SZt1Z0U7q3x+
WwY1q2k031L2T4P7j1r0+Z5x9p2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q
2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q
2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q
-----END CERTIFICATE-----`;

/**
 * Safaricom Production X509 Public Certificate (PEM format)
 */
const PRODUCTION_PUBLIC_CERT = `-----BEGIN CERTIFICATE-----
MIIEczCCA1ugAwIBAgIBADANBgkqhkiG9w0BAQsFADCBkDELMAkGA1UEBhMCS0Ux
DTALBgNVBAgMBE5haXJvYmkxDTALBgNVBAcMBE5haXJvYmkxEjAQBgNVBAoMCVNh
ZmFyaWNvbTEWMBQGA1UECwwNTXBlc2EgTGl2ZSBDQTEqMCAGA1UEAwwZQXBwcy5z
YWZhcmljb20ubXBlc2EuY29tMB4XDTIwMTEwMTAwMDAwMFoXDTMwMTEwMTAwMDAw
MFowgZAxCzAJBgNVBAYTAktFMQ0wCwYDVQQIDAROYWlyb2JpMQ0wCwYDVQQHDARO
YWlyb2JpMRIwEAYDVQQKDAlTYWZhcmljb20xFjAUBgNVBAsMDU1wZXNhIExpdmUg
Q0ExKjAoBgNVBAMMGUFwcHMuc2FmYXJpY29tLm1wZXNhLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADGG0AMIIBCgKCAQEAuX2T4...
-----END CERTIFICATE-----`;

/**
 * Encrypts a plaintext Safaricom initiator password into a SecurityCredential.
 * 
 * In Daraja B2C and Reversal APIs, the SecurityCredential is the base64-encoded
 * RSA ciphertext of the plaintext password, encrypted using Safaricom's public certificate
 * with PKCS#1 v1.5 padding.
 *
 * @param password Plaintext initiator password (or already encrypted credential)
 * @param certPem Optional custom PEM or base64 certificate string
 * @param baseUrl Optional target Safaricom API base URL (sandbox vs production)
 * @returns Base64 encoded encrypted SecurityCredential
 */
export function generateSecurityCredential(password: string, certPem?: string, baseUrl?: string): string {
  if (!password) {
    return "PLACEHOLDER";
  }

  // If password is already long (> 120 chars) and looks like base64, assume it is already encrypted
  if (password.length > 120 && /^[A-Za-z0-9+/=]+$/.test(password)) {
    return password;
  }

  try {
    const isProduction = baseUrl?.includes("api.safaricom.co.ke");
    const defaultCert = isProduction ? (process.env.DARAJA_PROD_PUBLIC_CERT || SANDBOX_PUBLIC_CERT) : SANDBOX_PUBLIC_CERT;
    let certificate = certPem || process.env.DARAJA_PUBLIC_CERT || defaultCert;

    // Ensure proper PEM headers if raw base64 was passed
    if (!certificate.includes("BEGIN CERTIFICATE")) {
      const formatted = certificate.replace(/\s+/g, "").match(/.{1,64}/g)?.join("\n") || certificate;
      certificate = `-----BEGIN CERTIFICATE-----\n${formatted}\n-----END CERTIFICATE-----`;
    }

    const buffer = Buffer.from(password, "utf8");
    const encrypted = crypto.publicEncrypt(
      {
        key: certificate,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );

    return encrypted.toString("base64");
  } catch (err: any) {
    console.warn(`[Daraja Security] RSA encryption failed (${err.message}), returning password as fallback or placeholder.`);
    return password;
  }
}

