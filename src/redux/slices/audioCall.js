import { createSlice } from "@reduxjs/toolkit";
import { socket } from "../../socket";
import axiosInstance from "../../utils/axios";

const initialState = {
  openAudioDialog: false,
  openAudioNotificationDialog: false,
  callQueue: [], // can have max 1 call at any point of time
  incoming: false,
};

const slice = createSlice({
  name: "audioCall",
  initialState,
  reducers: {
    pushToAudioCallQueue(state, action) {
      // check audio_callQueue in redux store

      if (state.callQueue.length === 0) {
        state.callQueue.push(action.payload.call);
        if (action.payload.incoming) {
          state.openAudioNotificationDialog = true; // this will open up the call dialog
          state.incoming = true;
        } else {
          state.openAudioDialog = true;
          state.incoming = false;
        }
      } else {
        // if queue is not empty then emit user_is_busy => in turn server will send this event to sender of call
        socket.emit("user_is_busy_audio_call", { ...action.payload });
      }

      // Ideally queue should be managed on server side
    },
    resetAudioCallQueue(state, action) {
      state.callQueue = [];
      state.openAudioNotificationDialog = false;
      state.incoming = false;
    },
    closeNotificationDialog(state, action) {
      state.openAudioNotificationDialog = false;
    },
    updateCallDialog(state, action) {
      state.openAudioDialog = action.payload.state;
      state.openAudioNotificationDialog = false;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const PushToAudioCallQueue = (call) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.pushToAudioCallQueue({ call, incoming: true }));
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

export const StartAudioCall = (id) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetAudioCallQueue());
    axiosInstance
      .post(
        "/user/start-audio-call",
        { id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getState().auth.token}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        dispatch(
          slice.actions.pushToAudioCallQueue({
            call: response.data.data,
            incoming: false,
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
};
