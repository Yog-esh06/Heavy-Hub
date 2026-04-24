import { useEffect, useMemo, useState } from "react";
import { sendChatMessage, subscribeToChatMessages, subscribeToChatRoom } from "../../services/chat.service";

const formatTime = (value) => {
  if (!value) return "";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BookingChatPanel = ({
  booking,
  currentUser,
  channelType,
  title,
  currentUserRole = "user",
}) => {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!booking?.id) return undefined;

    const unsubscribeRoom = subscribeToChatRoom({
      bookingId: booking.id,
      channelType,
      onRoom: setRoom,
    });

    const unsubscribeMessages = subscribeToChatMessages({
      bookingId: booking.id,
      channelType,
      onMessages: setMessages,
    });

    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
    };
  }, [booking?.id, channelType]);

  const canMessage = useMemo(() => {
    if (!room || !currentUser?.uid) return false;
    return Array.isArray(room.participants) && room.participants.includes(currentUser.uid) && room.status !== "closed";
  }, [room, currentUser?.uid]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !canMessage) return;

    setSending(true);
    try {
      await sendChatMessage({
        bookingId: booking.id,
        channelType,
        senderId: currentUser.uid,
        senderRole: currentUserRole,
        text,
      });
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  if (!booking?.driverId) {
    return null;
  }

  if (!room) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">
          Chat will be available once the driver-linked booking channel is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 capitalize">
            {room.status || "active"} | {room.channelType?.replace("_", " ")}
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {messages.length} messages
        </div>
      </div>

      <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet.</p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === currentUser?.uid;
            return (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  isMine ? "ml-auto bg-emerald-600 text-white" : "bg-white text-slate-800 shadow-sm"
                }`}
              >
                <p>{message.text}</p>
                <p className={`mt-1 text-[11px] ${isMine ? "text-emerald-100" : "text-slate-400"}`}>
                  {message.senderRole} {formatTime(message.createdAt)}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSend();
            }
          }}
          placeholder={canMessage ? "Send a message..." : "Messaging unavailable"}
          disabled={!canMessage || sending}
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 disabled:bg-slate-100"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canMessage || sending}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default BookingChatPanel;
