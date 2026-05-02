
export const APP_NAME = "Free State FM";

export const CONTACT_INFO = {
  email: "info@freestatefm.co.za",
  phone: "0610569549",
  social: {
    facebook: "https://web.facebook.com/freestatefm",
    instagram: "https://www.instagram.com/freestatefm/"
  }
};

// Live stream source
export const LIVE_STREAM_URL = "https://live.freestatefm.co.za/stream";

export const BROADCAST_SCHEDULE = [
  // Sunday
  { time: "15:00 - 18:00", show: "Sunday Soul Serenade", dj: "Patrick Tsolo", days: [0] },
  // Default for all other times
  { time: "00:00 - 24:00", show: "Music Train", dj: "24/7 Digital Radio", days: [0,1,2,3,4,5,6] },
];
