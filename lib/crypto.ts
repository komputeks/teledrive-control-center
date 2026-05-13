import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const secret = process.env.TELEDRIVE_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
const key = crypto.createHash('sha256').update(secret).digest();

export function encryptValue(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptValue(payload: string) {
  const [ivHex, tagHex, encryptedHex] = payload.split(':');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}
