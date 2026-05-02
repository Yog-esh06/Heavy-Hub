import { useEffect, useMemo, useRef, useState } from "react";
import {
  getMessages,
  markMessagesRead,
  sendMessage,
  subscribeToMessages,
  unsubscribeFromMessages,
  uploadChatImage,
  uploadVoiceMessage,
} from "../../services/chat.service";

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) => (name || "?").trim().charAt(0).toUpperCase();

const BookingChatPanel = ({
  bookingId,
  currentUserId,
  currentUserName,
  otherParticipants = [],
  booking,
  currentUser,
  title,
}) => {
  const resolvedBookingId = bookingId || booking?.id;
  const resolvedCurrentUserId = currentUserId || currentUser?.id || currentUser?.uid;
  const resolvedCurrentUserName =
    currentUserName || currentUser?.displayName || currentUser?.email || "You";
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [typing] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartRef = useRef(0);

  useEffect(() => {
    if (!resolvedBookingId) return undefined;

    let active = true;

    getMessages(resolvedBookingId)
      .then((data) => {
        if (active) {
          setMessages(data);
        }
      })
      .catch(console.error);

    if (resolvedCurrentUserId) {
      markMessagesRead(resolvedBookingId, resolvedCurrentUserId).catch(console.error);
    }

    const subscription = subscribeToMessages(resolvedBookingId, (message) => {
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    });

    return () => {
      active = false;
      unsubscribeFromMessages(subscription);
    };
  }, [resolvedBookingId, resolvedCurrentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages]
  );

  const handleSendText = async () => {
    const text = draft.trim();
    if (!text || !resolvedBookingId || !resolvedCurrentUserId) return;

    setSending(true);
    try {
      await sendMessage(resolvedBookingId, resolvedCurrentUserId, resolvedCurrentUserName, text);
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !resolvedBookingId || !resolvedCurrentUserId) return;

    setSending(true);
    try {
      const fileUrl = await uploadChatImage(file, resolvedBookingId);
      await sendMessage(
        resolvedBookingId,
        resolvedCurrentUserId,
        resolvedCurrentUserName,
        file.name,
        "image",
        fileUrl
      );
    } finally {
      setSending(false);
      event.target.value = "";
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !resolvedBookingId || !resolvedCurrentUserId) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];
    recordingStartRef.current = Date.now();

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const duration = Math.round((Date.now() - recordingStartRef.current) / 1000);
      stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setSending(true);
      try {
        const fileUrl = await uploadVoiceMessage(audioBlob, resolvedBookingId);
        await sendMessage(
          resolvedBookingId,
          resolvedCurrentUserId,
          resolvedCurrentUserName,
          "Voice message",
          "voice",
          fileUrl,
          duration
        );
      } finally {
        setSending(false);
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {title ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">
              {otherParticipants.length > 0 ? `${otherParticipants.length} participants` : "Realtime chat"}
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {messages.length} messages
          </div>
        </div>
      ) : null}

      <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3">
        {sortedMessages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet.</p>
        ) : (
          sortedMessages.map((message) => {
            const isMine = message.senderId === resolvedCurrentUserId;
            const isSystem = message.messageType === "system";

            if (isSystem) {
              return (
                <div key={message.id} className="text-center text-xs italic text-slate-500">
                  {message.content}
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[85%] gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    {message.senderAvatar ? (
                      <img src={message.senderAvatar} alt={message.senderName} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      getInitials(message.senderName)
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      isMine ? "bg-emerald-600 text-white" : "bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    <p className={`mb-1 text-[11px] font-semibold ${isMine ? "text-emerald-100" : "text-slate-500"}`}>
                      {message.senderName || "User"}
                    </p>
                    {message.messageType === "image" && message.fileUrl ? (
                      <button type="button" onClick={() => setExpandedImage(message.fileUrl)} className="block">
                        <img src={message.fileUrl} alt={message.content || "Chat image"} className="h-36 w-36 rounded-lg object-cover" />
                      </button>
                    ) : null}
                    {message.messageType === "voice" && message.fileUrl ? (
                      <audio controls src={message.fileUrl} className="max-w-full">
                        Your browser does not support audio playback.
                      </audio>
                    ) : null}
                    {message.messageType === "text" || !message.messageType ? <p>{message.content}</p> : null}
                    {message.messageType === "voice" && message.fileDuration ? (
                      <p className={`mt-1 text-[11px] ${isMine ? "text-emerald-100" : "text-slate-400"}`}>
                        {message.fileDuration}s
                      </p>
                    ) : null}
                    <p className={`mt-1 text-[11px] ${isMine ? "text-emerald-100" : "text-slate-400"}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typing ? <p className="text-xs text-slate-500">typing...</p> : null}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
          title="Attach image"
        >
          {"\uD83D\uDCCE"}
        </button>
        <button
          type="button"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`rounded-xl border px-3 py-2 text-sm ${isRecording ? "border-red-400 text-red-600" : "border-slate-300 text-slate-700"}`}
          title="Hold to record"
        >
          {isRecording ? <span className="inline-flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />{"\uD83C\uDFA4"}</span> : "\uD83C\uDFA4"}
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendText();
            }
          }}
          placeholder="Send a message..."
          disabled={sending}
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 disabled:bg-slate-100"
        />
        <button
          type="button"
          onClick={handleSendText}
          disabled={sending}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {expandedImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} alt="Expanded chat attachment" className="max-h-full max-w-full rounded-lg" />
        </div>
      ) : null}
    </div>
  );
};

export default BookingChatPanel;
