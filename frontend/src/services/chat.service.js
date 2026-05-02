import { isSupabaseConfigured, supabase } from "../config/supabase";
import { askGemini } from "../config/gemini";

const normalizeMessage = (row) => {
  if (!row) {
    return null;
  }

  return {
    ...row,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar || row.sender?.photo_url || "",
    createdAt: row.created_at,
    messageType: row.message_type,
    fileUrl: row.file_url,
    fileDuration: row.file_duration,
    isRead: row.is_read,
  };
};

export async function getMessages(bookingId) {
  if (!isSupabaseConfigured || !bookingId) {
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:users(display_name, photo_url)")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeMessage);
}

export async function sendMessage(
  bookingId,
  senderId,
  senderName,
  content,
  type = "text",
  fileUrl = null,
  fileDuration = null
) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to use chat.");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      booking_id: bookingId,
      sender_id: senderId,
      sender_name: senderName,
      content,
      message_type: type,
      file_url: fileUrl,
      file_duration: fileDuration,
    })
    .select()
    .single();

  if (error) throw error;
  return normalizeMessage(data);
}

export async function uploadVoiceMessage(audioBlob, bookingId) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to upload chat media.");
  }

  const fileName = `voice-${bookingId}-${Date.now()}.webm`;
  const { error } = await supabase.storage.from("chat-media").upload(fileName, audioBlob, {
    contentType: "audio/webm",
  });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("chat-media").getPublicUrl(fileName);
  return publicUrl;
}

export async function uploadChatImage(file, bookingId) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to upload chat media.");
  }

  const fileName = `chat-${bookingId}-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("chat-media").upload(fileName, file);
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("chat-media").getPublicUrl(fileName);
  return publicUrl;
}

export function subscribeToMessages(bookingId, callback) {
  if (!isSupabaseConfigured) {
    return null;
  }

  return supabase
    .channel(`messages:${bookingId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `booking_id=eq.${bookingId}`,
      },
      (payload) => callback(normalizeMessage(payload.new))
    )
    .subscribe();
}

export function unsubscribeFromMessages(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

export async function markMessagesRead(bookingId, userId) {
  if (!isSupabaseConfigured) {
    return;
  }

  await supabase.from("messages").update({ is_read: true }).eq("booking_id", bookingId).neq("sender_id", userId);
}

export async function getAIHelpResponse(userMessage, history = []) {
  try {
    const response = await askGemini(userMessage, history);
    return { success: true, message: response };
  } catch (error) {
    return { success: false, message: "I'm having trouble connecting right now. Please try again." };
  }
}

export const CHAT_CHANNELS = {
  RENTER_DRIVER: "renter_driver",
  DRIVER_OWNER: "driver_owner",
};

export async function sendChatMessage({ bookingId, senderId, senderRole, text }) {
  return sendMessage(bookingId, senderId, senderRole, text);
}

export function subscribeToChatRoom({ bookingId, onRoom }) {
  if (!isSupabaseConfigured) {
    onRoom(null);
    return () => {};
  }

  let active = true;
  supabase
    .from("bookings")
    .select("id, renter_id, owner_id, driver_id, status")
    .eq("id", bookingId)
    .maybeSingle()
    .then(({ data }) => {
      if (!active) return;
      if (!data) {
        onRoom(null);
        return;
      }
      onRoom({
        id: bookingId,
        status: data.status || "active",
        participants: [data.renter_id, data.owner_id, data.driver_id].filter(Boolean),
      });
    });

  return () => {
    active = false;
  };
}

export function subscribeToChatMessages({ bookingId, onMessages }) {
  let active = true;
  getMessages(bookingId).then((messages) => {
    if (active) {
      onMessages(messages);
    }
  });

  const subscription = subscribeToMessages(bookingId, (message) => {
    if (!active) return;
    onMessages((current) => {
      const nextMessages = typeof current === "function" ? current([]) : current;
      return Array.isArray(nextMessages) ? [...nextMessages, message] : [message];
    });
  });

  return () => {
    active = false;
    unsubscribeFromMessages(subscription);
  };
}
