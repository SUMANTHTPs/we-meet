import { Box, Stack } from "@mui/material";
import React from "react";
import { Chat_History } from "../../data";
import { DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg, Timeline } from "./MsgTypes";

function Message() {
  return (
    <Box p={3} spacing={3}>
      <Stack spacing={2}>
        {Chat_History.map((el) => {
          switch (el.type) {
            case "divider":
              return <Timeline el={el} />;
            case "msg":
              switch (el.subtype) {
                case "img":
                  // img msg
                  return <MediaMsg el={el} />;
                case "doc":
                  // doc msg
                  return <DocMsg el={el} />;
                case "link":
                  // link msg
                  return <LinkMsg el={el} />;
                case "reply":
                  // reply msg
                  return <ReplyMsg el={el} />;

                default:
                  // text msg
                  return <TextMsg el={el} />;
              }
              break;
            default:
              return <></>;
          }
        })}
      </Stack>
    </Box>
  );
}

export default Message;
