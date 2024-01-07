export function genRandomText(len: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < len; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    text += characters[randomIndex];
  }
  return text;
}

export function genRandomEmail() {
  const suffix = "@163.com";
  const prefix = genRandomText(6);
  return `${prefix}${suffix}`;
}
