import { createSlice } from "@reduxjs/toolkit";
import { socket } from "../../socket";

const initialState = {
  openAudioDialog: false,
  openNotificationDialog: false,
  callQueue: [], // can have max 1 call at any point of time
};

const slice = createSlice({
  name: "audioCall",
  initialState,
  reducers: {
    pushToAudioCallQueue(state, action) {
      // check audio_callQueue in redux store

      if (state.callQueue.length === 0) {
        state.callQueue.push(action.payload);
        state.openNotificationDialog = true; // this will open up the call dialog
      } else {
        // if queue is not empty then emit user_is_busy => in turn server will send this event to sender of call
        socket.emit("user_is_busy_audio_call", { ...action.payload });
      }

      // Ideally queue should be managed on server side
    },
    resetAudioCallQueue(state, action) {
      state.callQueue = [];
      state.openNotificationDialog = false;
    },
    closeNotificationDialog(state, action) {
      state.openNotificationDialog = false;
    },
    updateCallDialog(state, action) {
      state.openAudioDialog = action.payload.state;
      state.openNotificationDialog = false;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const PushToAudioCallQueue = (call) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.pushToAudioCallQueue(call));
  };
};

export const ResetAudioCallQueue = () => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetAudioCallQueue());
  };
};

export const CloseAudioNotificationDialog = () => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.closeNotificationDialog());
  };
};

export const UpdateAudioCallDialog = ({ state }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateCallDialog({ state }));
  };
};
