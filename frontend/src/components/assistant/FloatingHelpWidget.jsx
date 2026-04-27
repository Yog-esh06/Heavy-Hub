import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAIResponse } from "../../services/helpAssistant.service";

const suggestedPromptsByRoute = {
  "/": [
    "How do I browse rentals?",
    "When do I need to sign in?",
    "Where can I see sale listings?",
  ],
  "/browse/rent": [
    "How do I book a vehicle?",
    "What does the map heat view mean?",
    "Can I request a driver?",
  ],
  "/browse/buy": [
    "How do I contact a seller?",
    "What is the difference between rent and sale?",
    "Can I browse without login?",
  ],
  "/login": [
    "Why am I being asked to sign in?",
    "What roles can I choose?",
    "What does Firebase auth do here?",
  ],
};

const FloatingHelpWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Need help? Ask about navigation, booking, listings, login, or map views.",
    },
  ]);

  const suggestions = useMemo(() => {
    const direct = suggestedPromptsByRoute[location.pathname];
    if (direct) {
      return direct;
    }
    if (location.pathname.startsWith("/dashboard")) {
      return ["How do dashboards work?", "How do I switch roles?", "Where do I manage bookings?"];
    }
    return ["How do I use this site?", "Where do I browse vehicles?", "How does login work?"];
  }, [location.pathname]);

  async function handleSend(preset) {
    const nextInput = typeof preset === "string" ? preset : input;
    if (!nextInput.trim()) {
      return;
    }

    const userText = nextInput.trim();
    const userMsg = { role: "user", content: userText };
    const newHistory = [...history, userMsg];

    setHistory(newHistory);
    setMessages((prev) => [...prev, { id: `${Date.now()}-user`, role: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const { message } = await getAIResponse(userText, history);
      const aiMsg = { role: "assistant", content: message };
      setHistory((prev) => [...prev, aiMsg]);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-assistant`, role: "assistant", text: message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-assistant-error`, role: "assistant", text: "Something went wrong. Try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">HeavyHub Help</p>
              <p className="text-xs text-slate-300">Assistant for navigation and site guidance</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="max-h-[380px] space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "assistant"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "ml-auto bg-emerald-600 text-white"
                }`}
              >
                {message.text}
              </div>
            ))}
            {isLoading ? (
              <div className="max-w-[88%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Ask for help..."
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isLoading}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-black"
        >
          AI Help
        </button>
      )}
    </div>
  );
};

export default FloatingHelpWidget;
