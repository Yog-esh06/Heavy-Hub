const HELP_TOPICS = {
  general: {
    keywords: ["help", "start", "home", "website", "navigation"],
    response:
      "You can browse vehicles from the home page without signing in. Use Browse Rent for rentals, Browse Buy for outright purchase listings, and sign in only when you want to book, list equipment, or manage dashboard actions.",
  },
  auth: {
    keywords: ["login", "sign in", "auth", "account", "google"],
    response:
      "Authentication uses Firebase Google sign-in. Browsing is public, but booking, cart actions, owner listings, and driver workflows require sign-in.",
  },
  booking: {
    keywords: ["book", "booking", "rent", "cart", "checkout", "driver"],
    response:
      "To rent a vehicle, open its detail page, review pricing and dates, then continue to booking. If you are not signed in, the app will redirect you to login before protected actions.",
  },
  owner: {
    keywords: ["owner", "listing", "sell", "upload", "equipment"],
    response:
      "Owners can sign in, choose the owner role, and create listings from the owner dashboard. Listings support pricing, images, location, and availability details.",
  },
  driver: {
    keywords: ["driver", "apply", "job", "availability"],
    response:
      "Drivers can apply through the driver dashboard, upload documents, set availability, and review assigned jobs once approved.",
  },
  maps: {
    keywords: ["map", "location", "heatmap", "nearby", "distance"],
    response:
      "Map views now support list, spread, and heat-style density summaries. If a Google Maps key is added later, this can be extended into richer interactive mapping.",
  },
};

const routeHints = {
  "/": "You are on the home page. Featured vehicles and quick entry points are available here.",
  "/browse/rent": "You are browsing rental inventory. Filters and nearby discovery help narrow results.",
  "/browse/buy": "You are browsing sale listings. Compare price, location, and category before contacting a seller.",
  "/login": "You are on the sign-in screen. Google sign-in is used for authentication.",
  "/dashboard": "You are inside the dashboard area. Your available actions depend on the active role.",
};

const fallbackAnswer = (question, pathname) => {
  const normalized = question.toLowerCase();
  for (const topic of Object.values(HELP_TOPICS)) {
    if (topic.keywords.some((keyword) => normalized.includes(keyword))) {
      return `${routeHints[pathname] || ""} ${topic.response}`.trim();
    }
  }

  return (
    routeHints[pathname] ||
    "I can help with navigation, login, booking flow, listings, drivers, or map features. Ask something like 'how do I book', 'where do I add a listing', or 'what does this map show?'."
  );
};

export const getAssistantReply = async ({ question, pathname, context }) => {
  const endpoint = import.meta.env.VITE_AI_HELP_ENDPOINT;

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, pathname, context }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.reply) {
          return data.reply;
        }
      }
    } catch {
      // fall back to local helper
    }
  }

  return fallbackAnswer(question, pathname);
};
