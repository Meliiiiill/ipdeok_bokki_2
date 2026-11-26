(() => {
  const accountsKey = "ipdeokbokki.auth.accounts";
  const sessionKey = "ipdeokbokki.auth.session";
  const invalidLoginMessage =
    "이메일 또는 비밀번호가 올바르지 않습니다. 입력한 정보를 다시 확인해 주세요.";

  function normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  function readAccounts() {
    return JSON.parse(localStorage.getItem(accountsKey) ?? "[]");
  }

  function notifyAuthChange() {
    window.dispatchEvent(new Event("ipdeok:authchange"));
  }

  async function getPasswordHash(password, salt) {
    if (!window.crypto?.subtle) {
      throw new Error("Live Server의 localhost 또는 HTTPS에서 페이지를 열어 주세요.");
    }

    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const bits = await window.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: encoder.encode(salt),
        iterations: 600000
      },
      key,
      256
    );

    return Array.from(new Uint8Array(bits), (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  async function register(email, password) {
    const address = normalizeEmail(email);

    if (!address || password.length < 8) {
      throw new Error("이메일과 8자 이상의 비밀번호를 입력해 주세요.");
    }

    const salt = window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : Array.from(window.crypto.getRandomValues(new Uint8Array(16))).join("-");

    const passwordHash = await getPasswordHash(password, salt);
    const accounts = readAccounts();

    if (accounts.some((account) => account.email === address)) {
      throw new Error("이미 가입한 이메일이에요.");
    }

    accounts.push({ email: address, salt, passwordHash });
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
  }

  async function login(email, password, remember = false) {
    const address = normalizeEmail(email);
    const account = readAccounts().find((item) => item.email === address);

    if (!account) {
      throw new Error(invalidLoginMessage);
    }

    const passwordHash = await getPasswordHash(password, account.salt);

    if (passwordHash !== account.passwordHash) {
      throw new Error(invalidLoginMessage);
    }

    if (remember) {
      localStorage.setItem(sessionKey, account.email);
      sessionStorage.removeItem(sessionKey);
    } else {
      sessionStorage.setItem(sessionKey, account.email);
      localStorage.removeItem(sessionKey);
    }

    notifyAuthChange();
  }

  function currentUser() {
    const email = sessionStorage.getItem(sessionKey) ?? localStorage.getItem(sessionKey);

    if (!email) return null;

    const exists = readAccounts().some((account) => account.email === email);
    return exists ? { email } : null;
  }

  function logout() {
    sessionStorage.removeItem(sessionKey);
    localStorage.removeItem(sessionKey);
    notifyAuthChange();
  }

  window.IpdeokAuth = { register, login, currentUser, logout };
})();