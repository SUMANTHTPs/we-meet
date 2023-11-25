import React, { useEffect } from "react";
import { Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import SideNav from "./SideNav";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, socket } from "../../socket";
import Alert from "@mui/material/Alert";
import {
  FetchUserProfile,
  SelectConversation,
  showSnackbar,
} from "../../redux/slices/app";
import {
  AddDirectConversation,
  UpdateDirectConversation,
  AddDirectMessage,
} from "../../redux/slices/conversation";
import {
  CloseAudioNotificationDialog,
  PushToAudioCallQueue,
  UpdateAudioCallDialog,
} from "../../redux/slices/audioCall";
import AudioCallNotification from "../../sections/dashboard/audio/CallNotification";
import VideoCallNotification from "../../sections/dashboard/video/CallNotification";
import AudioCallDialog from "../../sections/dashboard/audio/CallDialog";
import VideoCallDialog from "../../sections/dashboard/video/CallDialog";
import {
  PushToVideoCallQueue,
  UpdateVideoCallDialog,
} from "../../redux/slices/videoCall";

const DashboardLayout = () => {
  const isDesktop = useResponsive("up", "md");
  const dispatch = useDispatch();
  const { openAudioNotificationDialog, openAudioDialog } = useSelector(
    (state) => state.audioCall
  );
  const { openVideoNotificationDialog, openVideoDialog } = useSelector(
    (state) => state.videoCall
  );
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { conversations, currentConversation } = useSelector(
    (state) => state.conversation.directChat
  );

  const { userId } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(FetchUserProfile());
  });
  const handleCloseAudioDialog = () => {
    dispatch(UpdateAudioCallDialog({ state: false }));
  };
  const handleCloseVideoDialog = () => {
    dispatch(UpdateVideoCallDialog({ state: false }));
  };

  useEffect(() => {
    if (isLoggedIn) {
      window.onload = function () {
        if (!window.location.hash) {
          window.location = window.location + "#loaded";
          window.location.reload();
        }
      };

      window.onload();

      if (!socket) {
        connectSocket(userId);
      }

      socket.on("audio_call_notification", (data) => {
        // TODO => dispatch an action to add this in call_queue

        dispatch(PushToAudioCallQueue(data));
      });

      socket.on("video_call_notification", (data) => {
        // TODO => dispatch an action to add this in call_queue
        dispatch(PushToVideoCallQueue(data));
      });

      socket.on("new_message", (data) => {
        const message = data.message;
        console.log(currentConversation, data);
        // check if msg we got is from currently selected conversation
        if (currentConversation?.id === data.conversationId) {
          dispatch(
            AddDirectMessage({
              id: message._id,
              type: "msg",
              subtype: message.type,
              message: message.text,
              incoming: message.to === userId,
              outgoing: message.from === userId,
            })
          );
        }
      });

      socket.on("start_chat", (data) => {
        console.log(data);
        // add / update to conversation list
        const existingConversation = conversations.find(
          (el) => el?.id === data._id
        );
        if (existingConversation) {
          // update direct conversation
          dispatch(UpdateDirectConversation({ conversation: data }));
        } else {
          // add direct conversation
          dispatch(AddDirectConversation({ conversation: data }));
        }
        dispatch(SelectConversation({ roomId: data._id }));
      });

      socket.on("new_friend_request", (data) => {
        dispatch(
          showSnackbar({
            severity: "success",
            message: "New friend request received",
          })
        );
      });

      socket.on("request_accepted", (data) => {
        dispatch(
          showSnackbar({
            severity: "success",
            message: "Friend Request Accepted",
          })
        );
      });

      socket.on("request_sent", (data) => {
        dispatch(showSnackbar({ severity: "success", message: data.message }));
      });
    }

    // Remove event listener on component unmount
    return () => {
      socket?.off("new_friend_request");
      socket?.off("request_accepted");
      socket?.off("request_sent");
      socket?.off("start_chat");
      socket?.off("new_message");
      socket?.off("audio_call_notification");
    };
  }, [isLoggedIn, socket]);

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }

  return (
    <>
      <Alert severity="error">
        Serverless Functions on Vercel are stateless and have a maximum
        execution duration. As a result, it is not possible to maintain a
        WebSocket connection to a Serverless Function. So chatting and calling feature won't work!
      </Alert>
      <Stack direction="row">
        {isDesktop && (
          // SideBar
          <SideNav />
        )}

        <Outlet />
      </Stack>
      {openAudioNotificationDialog && (
        <AudioCallNotification
          open={openAudioNotificationDialog}
          handleClose={CloseAudioNotificationDialog}
        />
      )}
      {openAudioDialog && (
        <AudioCallDialog
          open={openAudioDialog}
          handleClose={handleCloseAudioDialog}
        />
      )}
      {openVideoNotificationDialog && (
        <VideoCallNotification open={openVideoNotificationDialog} />
      )}
      {openVideoDialog && (
        <VideoCallDialog
          open={openVideoDialog}
          handleClose={handleCloseVideoDialog}
        />
      )}
    </>
  );
};

export default DashboardLayout;
