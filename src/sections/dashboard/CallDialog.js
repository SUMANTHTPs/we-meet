import React from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
  Stack,
} from "@mui/material";

import { faker } from "@faker-js/faker";

import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import axiosInstance from "../../utils/axios";
import { ResetAudioCallQueue } from "../../redux/slices/audioCall";
import { socket } from "../../socket";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CallDialog = ({ open, handleClose }) => {
  const { directChat } = useSelector((state) => state.conversation);
  const { token, userId } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [callDetails] = useSelector((state) => state.audioCall.callQueue);

  const { currentConversation } = directChat;

  const appID = 1692763432;
  const server = "wss://webliveroom1692763432-api.coolzcloud.com/ws";

  // roomID => ID of conversation => currentConversation.id
  // token => generate on backend & get on App
  // userID => ID of this user
  // userName => slug formed by user's name

  const roomID = callDetails?.roomID || currentConversation.id;
  const userID = callDetails?.userID || userId;
  const userName = callDetails?.userName || userId;

  // Step 1

  // Initialize the ZegoExpressEngine instance
  const zg = new ZegoExpressEngine(appID, server);

  const streamID = callDetails?.streamID || currentConversation.userId;

  const handleDisconnect = (event, reason) => {
    if (reason && reason === "backdropClick") {
      return;
    } else {
      // handle Call Disconnection => this will be handled as cleanup when this dialog unmounts
      dispatch(ResetAudioCallQueue());

      // clean up event listeners
      socket?.off("call_accepted");
      socket?.off("call_denied");
      socket?.off("call_missed");

      // stop publishing local audio stream to remote users, call the stopPublishingStream method with the corresponding stream ID passed to the streamID parameter.
      zg.stopPublishingStream(streamID);
      // stop playing a remote audio
      zg.stopPlayingStream(userID);
      // log out of the room
      zg.logoutRoom(roomID);
      // at the end call handleClose Dialog
      handleClose();
    }
  };

  useEffect(() => {
    // TODO => emit audio_call event

    // create a job to decline call automatically after 30 sec if not picked

    const timer = setTimeout(() => {
      // TODO => You can play an audio indicating missed call at this line at sender's end

      socket.emit(
        "audio_call_not_picked",
        { to: currentConversation.userId, from: userID },
        () => {
          // Call verdict will be marked as Missed
        }
      );
    }, 30 * 1000);

    socket.on("call_missed", () => {
      // TODO => You can play an audio indicating call is missed at receiver's end
      // Abort call
      handleDisconnect();
    });

    socket.on("call_accepted", () => {
      // TODO => You can play an audio indicating call is started
      // clear timeout for "audio_call_not_picked"
      clearTimeout(timer);
    });

    if (!callDetails) {
      socket.emit("start_audio_call", {
        to: currentConversation.userId,
        from: userID,
        roomID,
      });
    }

    socket.on("call_denied", () => {
      // TODO => You can play an audio indicating call is denined
      // ABORT CALL
      handleDisconnect();
    });

    let localStream;

    // make a POST API call to server & fetch token

    let thisToken;

    async function fetchToken() {
      // You can await here
      const response = await axiosInstance.post(
        "/user/generate-zego-token",
        {
          userId: userID,
          roomId: roomID,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response, "TOKEN RESPONSE");
      thisToken = response.data.token;
      // ...
    }
    fetchToken();

    // Step 2 => Check browser compatibility

    zg.checkSystemRequirements()
      .then((result) => {
        // The [result] indicates whether it is compatible. It indicates WebRTC is supported when the [webRTC] is [true]. For more results, see the API documents.

        // {
        //   webRTC: true,
        //   customCapture: true,
        //   camera: true,
        //   microphone: true,
        //   videoCodec: { H264: true, H265: false, VP8: true, VP9: true },
        //   screenSharing: true,
        //   errInfo: {}
        // }
        console.log(result);

        const { webRTC, microphone } = result;

        if (webRTC && microphone) {
          zg.loginRoom(
            roomID,
            thisToken,
            { userID, userName },
            { userUpdate: true }
          )
            .then(async (result) => {
              console.log(result);

              // After calling the CreateStream method, you need to wait for the ZEGOCLOUD server to return the local stream object before any further operation.
              localStream = await zg.createStream({
                camera: { audio: true, video: false },
              });

              // Get the audio tag.
              const localAudio = document.getElementById("local-audio");
              // The local stream is a MediaStream object. You can render audio by assigning the local stream to the srcObject property of video or audio.
              localAudio.srcObject = localStream;

              // localStream is the MediaStream object created by calling creatStream in the previous step.
              zg.startPublishingStream(streamID, localStream);

              zg.on("publisherStateUpdate", (result) => {
                // Callback for updates on stream publishing status.
                // ...
                console.log(result);
                // * we can use this info to show connection status
              });

              zg.on("publishQualityUpdate", (streamID, stats) => {
                // Callback for reporting stream publishing quality.
                // ...
                // console.log(streamID, stats);
                // * we can use this info to show local audio stream quality
              });
            })
            .catch((error) => {
              console.log(error);
            });

          // Callback for updates on the current user's room connection status.
          zg.on("roomStateUpdate", (roomID, state, errorCode, extendedData) => {
            if (state === "DISCONNECTED") {
              // Disconnected from the room
              // * Can be used to show disconnected status for a user (especially useful in a group call)
            }

            if (state === "CONNECTING") {
              // Connecting to the room
              // * Can be used to show connecting status for a user (especially useful in a group call)
            }

            if (state === "CONNECTED") {
              // Connected to the room
              // * Can be used to show connected status for a user (especially useful in a group call)
            }
          });

          // Callback for updates on the status of ther users in the room.
          zg.on("roomUserUpdate", async (roomID, updateType, userList) => {
            console.warn(
              `roomUserUpdate: room ${roomID}, user ${
                updateType === "ADD" ? "added" : "left"
              } `,
              JSON.stringify(userList)
            );
            if (updateType === "left") {
              handleDisconnect();
            } else {
              // const current_users = JSON.stringify(userList);
              // * We can use current_users_list to build dynamic UI in a group call
              const remoteStream = await zg.startPlayingStream(userID);

              // Get the audio tag.
              const remoteAudio = document.getElementById("remote-audio");
              // The local stream is a MediaStream object. You can render audio by assigning the local stream to the srcObject property of video or audio.

              remoteAudio.srcObject = remoteStream;
              remoteAudio.play();
            }
          });

          // Callback for updates on the status of the streams in the room.
          zg.on(
            "roomStreamUpdate",
            async (roomID, updateType, streamList, extendedData) => {
              if (updateType === "ADD") {
                // New stream added, start playing the stream.
                console.log(
                  "ADD",
                  roomID,
                  updateType,
                  streamList,
                  extendedData
                );

                // * It would be quite useful to create and play multiple audio streams in a group call
              } else if (updateType === "DELETE") {
                // Stream deleted, stop playing the stream.
                console.log(
                  "DELETE",
                  roomID,
                  updateType,
                  streamList,
                  extendedData
                );

                // * Can be used to drop audio streams (more useful in a group call)
              }
            }
          );

          zg.on("playerStateUpdate", (result) => {
            // Callback for updates on stream playing status.
            // ...
            // * Can be used to display realtime status of a remote audio stream (Connecting, connected & Disconnected)
          });

          zg.on("playQualityUpdate", (streamID, stats) => {
            // Callback for reporting stream playing quality.
            // * Can be used to display realtime quality of a remote audio stream
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDisconnect}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <Stack direction="row" spacing={24} p={2}>
            <Stack>
              <Avatar
                sx={{ height: 100, width: 100 }}
                src={faker.image.avatar()}
              />
              <audio id="local-audio" controls={false} />
            </Stack>
            <Stack>
              <Avatar
                sx={{ height: 100, width: 100 }}
                src={faker.image.avatar()}
              />
              <audio id="remote-audio" controls={false} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDisconnect} variant="contained" color="error">
            End Call
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CallDialog;
