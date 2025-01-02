import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if (!getApps().length) {
  const firebaseConfig = {
    credential: cert({
      projectId: "triv-1075b",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDXDVoN2ruGXcUg\nZKvp+r+Gytal0oL5Khkkp27e+5G1CSsrXZEAh9DRP2mWZJr3dllEm/+vUjfLBLYF\nLzjtxQ5ooo3I/v8OPdTB7T1mgWUuLGfqqNDnZVbqkynfnHah1QegUihghvpa0t1i\nQBRf5ZdkpJ33icu1kAQTbnucrXuWRzpgZhk/2Qw3q1NXwLdlIy5Q18gR9D/GElng\np85ppr0bshOSH+ytFLnA96psxQF4yFjZeUU32xX3FxHDx+GfcbVugEG/wm4vM/bY\nLJBz9BbWLhsp3aefxlBkAhV4CXtq6uB29uE146lXAcajg6J8mnNiUbACVnwv7sL5\nPvR6B6LvAgMBAAECggEASNeCbdftleU0LLU8z+u5rRgOnatQ5sHeM16tPMU8hPQe\nlblDMMlQL1hJ1QGtxe1l7kni0MlKEa++UcI9h7gsGcAZw3+v9+x0oN1RY2On2Hx9\nFGxrGj3ms1z2nYHbYxSL2T+K4qtFqLbs+ucWn6beYV4rDZo0kILABq7xGtBeYLeP\nt9KSuc9y+8NWCSEZJUAm4ca3h1puRCaxwHjSi+TmCFAxySuqIm95OlFsLEqRunvr\nRcD1YStxLguTPQtuaAtDbiIZj2RnyFu0SeRwV6nPYlBW+pAsuNbhPHyOt8dT+8wY\n/pNIRJiowtKg7jgqHTT5lqZUTqnKJnSjXUstrj4Z1QKBgQDru4Y+oSZP4hPO49/o\nOYdW9SJ3+c2q3nSrhVMXvOzS0ceuTueib8JqWwRdnEpuFaszqu/h/ZJyt189WoUo\nxdEqKhbrZP3C3jdZxP0rtghLpY07zw73Tz9Tf+nWQsT80+15E1ofSp7LpsrxaxcJ\nFv/kJmiO5z1q/VhKdEFFDkavAwKBgQDpiqcBQSbeUU9IBJnyIGPhEbus2RBMw3CF\njDogKIPCo2FyvtLiA99AGmCe5h3MTeSHuS/d04ELQNEEz5cz3BrH8hfvLNFx6sDD\n1AItqwvzdZhFko2EL55hWboGi8PfIY+otj5xOpVUG6ry5RFMwS/C2ej35qdTfnkK\n2pDjxFjypQKBgQChFOg7/cR/S747Xs2PE1ifHC0sjJ90hkR1PEq2atvth3oKa1Kv\nVe0k3gMSsIzPwrDVQpZe9/ZNu24yL5vUa7BtPoug2MbqlQx/pDNX3jC2+G6VEv1o\nE1fzh/HS/pc7KNoaJRYtUcFG6je9Vm9MP9ImJfTGyc7XQD1Hyz8aoBG+3wKBgQC5\nFcSjTuIiASim99aVuKvPfMFTDDhJzf5IKMkMIW/C+r7JNIhmzRDKed0nMVJeT0EV\ne2N/FxdHNtgwSuEXHZIv8iKbz9YxxQ1+ZXBQhyWSjhje0nXLU/3eQ0EV3QCfvrZe\nzAgSro4YOVEy7O3X+acDcrWaejcUCcCeJHf9uuePbQKBgQDFYm0SSr2gT3gUhHeR\nwqn3/dqAuJvGg7+B5z3xwwoKRzs/W8snKTUFNyiXEjb971ICXwvduiWhM2V+3SSq\ntjNAF+1F8QFQqit1n8X3mKmywpGuWk0JgB8DpE0vsdD1YJx4X7eSetnqH9fH6v+v\nBkc9Y5ZZ8UptfQtfgQSk5I5gtw==\n-----END PRIVATE KEY-----\n",
      clientEmail: "firebase-adminsdk-a17m7@triv-1075b.iam.gserviceaccount.com",
    }),
    apiKey: "AIzaSyDTFS7GetK_2S0pZvIwUdsVzcQf-bDVtJg",
    authDomain: "triv-1075b.firebaseapp.com",
    storageBucket: "triv-1075b.firebasestorage.app",
    messagingSenderId: "577496131531",
    appId: "1:577496131531:web:218567b08d88f1e43f784e",
    measurementId: "G-H9QQX54TLF",
  };

  initializeApp(firebaseConfig);
}

export const db = getFirestore();
export const storage = getStorage();
