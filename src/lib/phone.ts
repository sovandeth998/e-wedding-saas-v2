export function normalizeKhmerPhone(input: string): string | null {
  let p = input.replace(/[\s\-().]/g, "");
  if (p.startsWith("+855")) p = "855" + p.slice(4);
  else if (p.startsWith("0")) p = "855" + p.slice(1);
  if (!/^855\d{8,9}$/.test(p)) return null;
  return p;
}

export function phoneToEmail(phone: string): string {
  return `${phone}@ewd.phone`;
}

export function isPhoneInput(value: string): boolean {
  const v = value.replace(/[\s\-().]/g, "");
  return /^\+?\d+$/.test(v) && (v.startsWith("0") || v.startsWith("855") || v.startsWith("+855"));
}

export function formatPhoneDisplay(phone: string): string {
  if (phone.startsWith("855")) return "+" + phone;
  return phone;
}
