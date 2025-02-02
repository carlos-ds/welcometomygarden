import { CHATS, MESSAGES } from './collections';
import { db } from './firebase';
import { getPublicUserProfile } from './user';
import { creatingNewChat, addChat, addMessage, hasInitialized } from '$lib/stores/chat';
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  onSnapshot,
  addDoc,
  Timestamp
} from 'firebase/firestore';

export const initiateChat = async (partnerUid: string) => {
  creatingNewChat.set(true);
  const partner = await getPublicUserProfile(partnerUid);
  creatingNewChat.set(false);
  return partner;
};

export const createChatObserver = async (currentUserId: string) => {
  const q = query(collection(db(), CHATS), where('users', 'array-contains', currentUserId));

  return onSnapshot(
    q,
    async (querySnapshot) => {
      const changes = querySnapshot.docChanges();
      const amount = querySnapshot.size;
      let counter = 0;
      await Promise.all(
        changes.map(async (change) => {
          const chat = change.doc.data();
          const partnerId = chat.users.find((id: string) => currentUserId !== id);
          const partner = await getPublicUserProfile(partnerId);
          chat.partner = partner;
          addChat({ id: change.doc.id, ...chat });
          counter++;
        })
      );
      if (counter === amount) hasInitialized.set(true);
    },
    (err) => {
      hasInitialized.set(true);
      console.error(err);
      throw err;
    }
  );
};

export const observeMessagesForChat = (chatId: string) => {
  const chatRef = doc(db(), CHATS, chatId);
  const chatMessagesCollection = collection(chatRef, MESSAGES);

  return onSnapshot(
    chatMessagesCollection,
    (snapshot) => {
      const changes = snapshot.docChanges();
      changes.forEach((message) => {
        addMessage(chatId, { id: message.doc.id, ...message.doc.data() });
      });
    },
    (err) => {
      console.error(err);
      throw err;
    }
  );
};

export const sendMessage = async (currentUserId: string, chatId: string, message: string) => {
  const chatRef = doc(db(), CHATS, chatId);
  const chatMessagesCollection = collection(chatRef, MESSAGES);

  await addDoc(chatMessagesCollection, {
    content: message.trim(),
    createdAt: Timestamp.now(),
    from: currentUserId
  });

  await updateDoc(chatRef, {
    lastActivity: Timestamp.now(),
    lastMessage: message.trim()
  });
};

export const create = async (uid1: string, uid2: string, message: string) => {
  const chatCollection = collection(db(), CHATS);

  const docRef = await addDoc(chatCollection, {
    users: [uid1, uid2],
    createdAt: Timestamp.now(),
    lastActivity: Timestamp.now(),
    lastMessage: message.trim()
  });

  const chatMessagesCollection = collection(docRef, MESSAGES);

  await addDoc(chatMessagesCollection, {
    content: message,
    createdAt: Timestamp.now(),
    from: uid1
  });

  return docRef.id;
};
