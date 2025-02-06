/** @format */

import crypto from "crypto";
import CryptoJS from "crypto-js";

export const generateEncryptionKey = () => {
  const currentDate = new Date().toISOString().split("T")[0];

  const baseString = `${currentDate}${process.env.NEXT_PUBLIC_ENCRYPTION_KEY}`;

  const hash = crypto.createHash("sha256").update(baseString).digest("hex");

  return hash.slice(0, 32);
};

export const encrypt = (data: string) => {
  return CryptoJS.AES.encrypt(data, generateEncryptionKey()).toString();
};

export const decrypt = (data: string) => {
  try {
    const decryptedText = CryptoJS.AES.decrypt(data, generateEncryptionKey()).toString(CryptoJS.enc.Utf8);
    if (!decryptedText) throw Error();
    return decryptedText;
  } catch {
    const modelStore = JSON.parse(localStorage.getItem("modelStore") || "{}");

    if (modelStore && modelStore.state) {
      delete modelStore.state.models;
    }

    localStorage.setItem("modelStore", JSON.stringify(modelStore));

    return "{}";
  }
};

export const decryptServer = (data: string) => {
  try {
    const decryptedText = CryptoJS.AES.decrypt(data, generateEncryptionKey()).toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return "{}";
    return decryptedText;
  } catch {
    return "{}";
  }
};
