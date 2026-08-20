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
      templates: "Basic Templates (1-2)",
      linkDuration: "30 days",
      guests: "Up to 50 guests",
      photos: "2 photos",
      qrCode: true,
      map: true,
      backgroundMusic: "Standard music only",
      rsvp: false,
      countdown: false,
      watermark: true,
      support: "FAQ only",
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
      templates: "Modern Templates (5+)",
      linkDuration: "6 months",
      guests: "Unlimited",
      photos: "6-10 photos",
      qrCode: true,
      map: true,
      backgroundMusic: "Upload custom music",
      rsvp: true,
      countdown: true,
      watermark: false,
      support: "Telegram Support",
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
      templates: "All Luxury Templates",
      linkDuration: "Lifetime (1 year)",
      guests: "Unlimited",
      photos: "20+ photos (HD Gallery)",
      qrCode: true,
      map: true,
      backgroundMusic: "Upload custom music",
      rsvp: true,
      countdown: true,
      watermark: false,
      support: "Done-for-you setup assistance",
    },
  },
} as const;

export const TEMPLATE_CATEGORIES = [
  { id: "modern", name: "Modern", nameKh: "សម័យ" },
  { id: "classic", name: "Classic", nameKh: "ប្រពៃណី" },
  { id: "luxury", name: "Luxury", nameKh: "ប្រណិត" },
] as const;
