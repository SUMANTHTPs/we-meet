import { createSlice } from "@reduxjs/toolkit";
import { socket } from "../../socket";

const initialState = {
  openVideoDialog: false,
  openNotificationDialog: false,
  callQueue: [], // can have max 1 call at any point of time
};

const slice = createSlice({
  name: "videoCall",
  initialState,
  reducers: {
    pushToVideoCallQueue(state, action) {
      // check video_callQueue in redux store

      if (state.callQueue.length === 0) {
        state.callQueue.push(action.payload);
        state.openNotificationDialog = true; // this will open up the call dialog
      } else {
        // if queue is not empty then emit user_is_busy => in turn server will send this event to sender of call
        socket.emit("user_is_busy_video_call", { ...action.payload });
      }

      // Ideally queue should be managed on server side
    },
    resetVideoCallQueue(state, action) {
      state.callQueue = [];
      state.openNotificationDialog = false;
    },
    closeNotificationDialog(state, action) {
      state.openNotificationDialog = false;
    },
    updateCallDialog(state, action) {
      state.openVideoDialog = action.payload.state;
      state.openNotificationDialog = false;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const PushToVideoCallQueue = (call) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.pushToVideoCallQueue(call));
  };
};

export const ResetVideoCallQueue = () => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetVideoCallQueue());
  };
};

export const CloseVideoNotificationDialog = () => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.closeNotificationDialog());
  };
};

export const UpdateVideoCallDialog = ({ state }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateCallDialog({ state }));
  };
};
