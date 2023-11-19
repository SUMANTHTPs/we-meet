import React, { useEffect } from "react";
import { Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import SideNav from "./SideNav";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, socket } from "../../socket";
import { SelectConversation, showSnackbar } from "../../redux/slices/app";
import {
  AddDirectConversation,
  UpdateDirectConversation,
} from "../../redux/slices/conversation";

const DashboardLayout = () => {
  const isDesktop = useResponsive("up", "md");
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { conversations } = useSelector(
    (state) => state.conversation.directChat
  );
  const dispatch = useDispatch();

  const userId = window.localStorage.getItem("userId");

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

      socket.on("start_chat", (data) => {
        console.log(data);
        // add / update to conversation list
        const existingConversation = conversations.find(
          (el) => el.id === data._id
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

      socket.on("open_chat", (data) => {
        console.log(data);
        // add / update to conversation list
        const existingConversation = conversations.find(
          (el) => el.id === data._id
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
      socket?.off("open_chat");
      socket?.off("start_chat");
    };
  }, [isLoggedIn, socket]);

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }

  return (
    <>
      <Stack direction="row">
        {isDesktop && (
          // SideBar
          <SideNav />
        )}

        <Outlet />
      </Stack>
    </>
  );
};

export default DashboardLayout;
