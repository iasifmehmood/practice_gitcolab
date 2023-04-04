const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
const logger = require("../logger");
dotenv.config();

const encryptionKey = crypto.randomBytes(32);

const secret = process.env.secretKey;

const algorithm = "aes-256-cbc";

const encrypt = (payload, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload)),
    cipher.final(),
  ]);
  return {
    iv: iv.toString("base64"),
    data: encrypted.toString("base64"),
  };
};

const decrypt = (encrypted, key) => {
  const iv = Buffer.from(encrypted.iv, "base64");
  const data = Buffer.from(encrypted.data, "base64");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString());
};

/*
@Generate_Token:
    Description_Case_1:                    will generate encrypted jwt token base on payload which will be use to login into the system.
    Description_Case_2:                    will generate encrypted jwt token base on payload (which is email in this case).
*/

exports.generateToken = payload => {
  const encryptedPayload = encrypt(payload, encryptionKey);
  const token = jwt.sign(
    {
      encrypted_payload: encryptedPayload,
    },
    secret,
    { algorithm: "HS256" },
    {
      expiresIn: "1200s", // expires in 20 minutes
    }
  );

  return token;
};

/*
@Decrypted_Payload:
    Description_Case_1:                    will decrypt jwt token base on token (which will help user to verify payload and login to the system)
    Description_Case_2:                    will decrypt jwt token base on token (which is sent to user via email). Which will help user to update password.
*/

exports.decryptedPayload = token => {
  const verifyAndDecrypt = (token, key) => {
    const decoded = jwt.verify(token, secret);
    const encryptedPayload = decoded.encrypted_payload;
    return decrypt(encryptedPayload, key);
  };

  const decryptedPayload = verifyAndDecrypt(token, encryptionKey);

  // logger.info(decryptedPayload);

  return decryptedPayload;
};
