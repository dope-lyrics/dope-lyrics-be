import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { PRODUCTION_URL } from "../constants";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text: string) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

type Text = ReturnType<typeof encrypt>;
function decrypt(text: Text) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

type UserData = { username: string; email: string; password: string };
function generateUrl(userData: UserData) {
  const encrpytedData = encrypt(JSON.stringify(userData));
  const _userData = jwt.sign(
    encrpytedData,
    process.env.REGISTER_USER_DATA as string,
    { expiresIn: "24h" }
  );

  return `${PRODUCTION_URL}/verify/${_userData}`;
}

export { encrypt, decrypt, generateUrl };
export type { UserData };
