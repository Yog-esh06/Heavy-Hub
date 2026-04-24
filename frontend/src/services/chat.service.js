import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const CHAT_CHANNELS = {
  RENTER_DRIVER: "renter_driver",
  DRIVER_OWNER: "driver_owner",
};

export const getBookingChatRoomId = (bookingId, channelType) => `${bookingId}__${channelType}`;

export const subscribeToChatRoom = ({ bookingId, channelType, onRoom }) => {
  const roomRef = doc(db, "bookingChats", getBookingChatRoomId(bookingId, channelType));
  return onSnapshot(roomRef, (snapshot) => {
    onRoom(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  });
};

export const subscribeToChatMessages = ({ bookingId, channelType, onMessages }) => {
  const roomId = getBookingChatRoomId(bookingId, channelType);
  const messagesRef = collection(db, "bookingChats", roomId, "messages");
  const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(messagesQuery, (snapshot) => {
    onMessages(snapshot.docs.map((message) => ({ id: message.id, ...message.data() })));
  });
};

export const sendChatMessage = async ({
  bookingId,
  channelType,
  senderId,
  senderRole,
  text,
}) => {
  const roomId = getBookingChatRoomId(bookingId, channelType);
  const messagesRef = collection(db, "bookingChats", roomId, "messages");

  await addDoc(messagesRef, {
    senderId,
    senderRole,
    text,
    createdAt: serverTimestamp(),
  });
};
