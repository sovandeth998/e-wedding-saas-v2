const KH_WEEKDAYS = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const KH_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

export function formatKhmerDate(d: Date): string {
  return `ថ្ងៃ${KH_WEEKDAYS[d.getDay()]} ${d.getDate()} ${KH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatKhmerDateShort(d: Date): string {
  return `${d.getDate()} ${KH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatKhmerTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
