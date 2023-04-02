import crypto from "node:crypto";
import { CLIENT_PRODUCTION_URL } from "../constants";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text: string) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return (
    iv.toString("hex") + process.env.CRYPTO_DIVIDER + encrypted.toString("hex")
  );
}

function decrypt(text: string) {
  const parsedStr = parseString(text);
  try {
    let iv = Buffer.from(parsedStr.iv, "hex");
    let encryptedText = Buffer.from(parsedStr.encryptedData, "hex");
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    if (!decrypted) throw new Error("No data!");

    return decrypted.toString();
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

type UserData = {
  username: string;
  password: string;
  email: string;
  iat: Date;
  exp: Date;
};

function decryptUserData(text: string): UserData {
  const obj = JSON.parse(decrypt(text)) || {};
  return {
    ...obj,
    iat: new Date(obj.iat),
    exp: new Date(obj.exp),
  };
}

function parseString(str: string): { iv: string; encryptedData: string } {
  const [_iv, encrptedData] = str.split(process.env.CRYPTO_DIVIDER as string);
  return { iv: _iv, encryptedData: encrptedData };
}

function generateUrl<T>(userData: T) {
  const encrpytedData = encrypt(JSON.stringify(userData));

  return `${CLIENT_PRODUCTION_URL}/verify/${encrpytedData}`;
}

export { encrypt, decrypt, generateUrl, decryptUserData };
