export const APP_NAME = "E-Wedding";
export const APP_DESCRIPTION = "Create beautiful wedding invitations online";

export const PACKAGES = {
  free: {
    name: "Free Trial",
    nameKh: "កញ្ចប់សាកល្បង",
    price: 0,
    durationDays: 30,
    maxGuests: 50,
    maxPhotos: 2,
    features: {
      templates: "ធៀបគំរូធម្មតា (1-2)",
      linkDuration: "រយៈពេល 30 ថ្ងៃ",
      guests: "រហូតដល់ 50 នាក់",
      photos: "រូបថត 2 សន្លឹក",
      qrCode: true,
      map: true,
      backgroundMusic: "តន្ត្រីស្តង់ដារ",
      rsvp: false,
      countdown: false,
      watermark: true,
      support: "ឆ្លើយតបតាមសំណួរញឹកញាប់",
    },
  },
  standard: {
    name: "Standard",
    nameKh: "កញ្ចប់ស្តង់ដារ",
    price: 18,
    durationDays: 180,
    maxGuests: -1,
    maxPhotos: 10,
    features: {
      templates: "ធៀបគំរូសម័យទំនើប (5+)",
      linkDuration: "រយៈពេល 6 ខែ",
      guests: "គ្មានកំណត់",
      photos: "រូបថត 6-10 សន្លឹក",
      qrCode: true,
      map: true,
      backgroundMusic: "បញ្ចូលតន្ត្រីផ្ទាល់ខ្លួន",
      rsvp: true,
      countdown: true,
      watermark: false,
      support: "ជំនួយតាម Telegram",
    },
  },
  vip: {
    name: "VIP / Luxury",
    nameKh: "កញ្ចប់ប្រណិត",
    price: 40,
    durationDays: 365,
    maxGuests: -1,
    maxPhotos: 20,
    features: {
      templates: "ធៀបគំរូប្រណិតទាំងអស់",
      linkDuration: "អចិន្ត្រៃយ៍ (1 ឆ្នាំ)",
      guests: "គ្មានកំណត់",
      photos: "រូបថត 20+ សន្លឹក (HD)",
      qrCode: true,
      map: true,
      backgroundMusic: "បញ្ចូលតន្ត្រីផ្ទាល់ខ្លួន",
      rsvp: true,
      countdown: true,
      watermark: false,
      support: "ជំនួយរៀបចំទិន្នន័យគ្រប់ជំហាន",
    },
  },
} as const;

export const TEMPLATE_CATEGORIES = [
  { id: "modern", name: "Modern", nameKh: "សម័យ" },
  { id: "classic", name: "Classic", nameKh: "ប្រពៃណី" },
  { id: "luxury", name: "Luxury", nameKh: "ប្រណិត" },
] as const;
