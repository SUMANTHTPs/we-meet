import { createSlice } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import { faker } from "@faker-js/faker";

const userId = window.localStorage.getItem("userId");

const initialState = {
  directChat: {
    conversations: [],
    currentConversation: null,
    currentMessages: [],
  },
  groupChat: {},
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const list = action.payload.conversations.map((el) => {
        const user = el.participants.find(
          (elm) => elm._id.toString() !== userId
        );
        return {
          id: el._id,
          userId: user._id,
          name: `${user.firstName} ${user.lastName}`,
          online: user.status === "Online",
          img: faker.image.avatar(),
          msg: faker.music.songName(),
          time: "9:36",
          unread: 0,
          pinned: false,
        };
      });

      state.directChat.conversations = list;
    },
    updateDirectConversation(state, action) {
      const thisConversation = action.payload.conversation;
      state.directChat.conversations = state.directChat.conversations.map(
        (el) => {
          if (el.id !== thisConversation._id) {
            return el;
          } else {
            const user = thisConversation.participants.find(
              (elm) => elm._id.toString() !== userId
            );
            return {
              id: thisConversation._id._id,
              userId: user._id,
              name: `${user.firstName} ${user.lastName}`,
              online: user.status === "Online",
              img: faker.image.avatar(),
              msg: faker.music.songName(),
              time: "9:36",
              unread: 0,
              pinned: false,
            };
          }
        }
      );
    },
    addDirectConversation(state, action) {
      const thisConversation = action.payload.conversation;
      const user = thisConversation.participants.find(
        (elm) => elm._id.toString() !== userId
      );
      state.directChat.conversations = state.directChat.conversations.filter(
        (el) => el.id !== thisConversation._id
      );
      state.directChat.conversations.push({
        id: thisConversation._id._id,
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        online: user.status === "Online",
        img: faker.image.avatar(),
        msg: faker.music.songName(),
        time: "9:36",
        unread: 0,
        pinned: false,
      });
    },
    setCurrentConversation(state, action) {
      state.directChat.currentConversation = action.payload;
    },
    fetchCurrentMessages(state, action) {
      const messages = action.payload.messages;
      const formattedMessages = messages.map((el) => ({
        id: el._id,
        type: "msg",
        subtype: el.type,
        message: el.text,
        incoming: el.to === userId,
        outgoing: el.from === userId,
      }));
      state.directChat.currentMessages = formattedMessages;
    },
    addDirectMessage(state, action) {
      state.directChat.currentMessages.push(action.payload.message);
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const FetchDirectConversations = ({ conversations }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchDirectConversations({ conversations }));
  };
};
export const AddDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectConversation({ conversation }));
  };
};
export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
  };
};

export const SetCurrentConversation = (currentConversation) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setCurrentConversation(currentConversation));
  };
};

export const FetchCurrentMessages = ({ messages }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchCurrentMessages({ messages }));
  };
};

export const AddDirectMessage = (message) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectMessage({ message }));
  };
};
