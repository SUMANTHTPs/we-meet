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
      const this_conversation = action.payload.conversation;
      state.directChat.conversations = state.directChat.conversations.map(
        (el) => {
          if (el.id !== this_conversation._id) {
            return el;
          } else {
            const user = this_conversation.participants.find(
              (elm) => elm._id.toString() !== userId
            );
            return {
              id: this_conversation._id._id,
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
      console.log("called");
      const this_conversation = action.payload.conversation;
      const user = this_conversation.participants.find(
        (elm) => elm._id.toString() !== userId
      );
      state.directChat.conversations = state.directChat.conversations.filter(
        (el) => el.id !== this_conversation._id
      );
      state.directChat.conversations.push({
        id: this_conversation._id._id,
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
