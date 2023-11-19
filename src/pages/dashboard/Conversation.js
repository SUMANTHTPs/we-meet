import { Stack, Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";

import { ChatHeader, ChatFooter } from "../../components/chat";
import useResponsive from "../../hooks/useResponsive";
import { Chat_History } from "../../data";
import {
  DocMsg,
  LinkMsg,
  MediaMsg,
  ReplyMsg,
  TextMsg,
  Timeline,
} from "../../sections/dashboard/Conversation";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchCurrentMessages,
  SetCurrentConversation,
} from "../../redux/slices/conversation";
import { socket } from "../../socket";

const Conversation = ({ isMobile, menu }) => {
  const dispatch = useDispatch();

  const { conversations, currentMessages } = useSelector(
    (state) => state.conversation.directChat
  );
  const { roomId } = useSelector((state) => state.app);

  useEffect(() => {
    const current = conversations.find((el) => el.id === roomId);

    socket.emit("get_messages", { conversationId: current.id }, (data) => {
      // data => list of messages
      console.log(data, "List of messages");
      dispatch(FetchCurrentMessages({ messages: data }));
    });

    dispatch(SetCurrentConversation(current));
  }, []);
  return (
    <Box p={isMobile ? 1 : 3}>
      <Stack spacing={3}>
        {currentMessages.map((el, idx) => {
          switch (el.type) {
            case "divider":
              return (
                // Timeline
                <Timeline key={idx} el={el} />
              );

            case "msg":
              switch (el.subtype) {
                case "img":
                  return (
                    // Media Message
                    <MediaMsg key={idx} el={el} menu={menu} />
                  );

                case "doc":
                  return (
                    // Doc Message
                    <DocMsg key={idx} el={el} menu={menu} />
                  );
                case "Link":
                  return (
                    //  Link Message
                    <LinkMsg key={idx} el={el} menu={menu} />
                  );

                case "reply":
                  return (
                    //  ReplyMessage
                    <ReplyMsg key={idx} el={el} menu={menu} />
                  );

                default:
                  return (
                    // Text Message
                    <TextMsg key={idx} el={el} menu={menu} />
                  );
              }

            default:
              return <></>;
          }
        })}
      </Stack>
    </Box>
  );
};

const ChatComponent = () => {
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();
  const messageListRef = useRef(null);

  const { currentMessages } = useSelector(
    (state) => state.conversation.directChat
  );

  useEffect(() => {
    // Scroll to the bottom of the message list when new messages are added
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [currentMessages]);

  return (
    <Stack
      height={"100%"}
      maxHeight={"100vh"}
      width={isMobile ? "100vw" : "auto"}
    >
      {/*  */}
      <ChatHeader />
      <Box
        ref={messageListRef}
        width={"100%"}
        sx={{
          position: "relative",
          flexGrow: 1,
          overflow: "scroll",

          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <SimpleBarStyle timeout={500} clickOnTrack={false}>
          <Conversation menu={true} isMobile={isMobile} />
        </SimpleBarStyle>
      </Box>

      {/*  */}
      <ChatFooter />
    </Stack>
  );
};

export default ChatComponent;

export { Conversation };
