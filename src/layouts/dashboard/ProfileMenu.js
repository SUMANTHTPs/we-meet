import React from "react";
import { Avatar, Box, Fade, Menu, MenuItem, Stack } from "@mui/material";

import { faker } from "@faker-js/faker";

import { Profile_Menu } from "../../data";
import { useDispatch, useSelector } from "react-redux";
import { LogoutUser } from "../../redux/slices/auth";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { AWS_S3_REGION, S3_BUCKET_NAME } from "../../config";

const ProfileMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user } = useSelector((state) => state.app);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const userName = user?.firstName;
  const userImg = `https://${S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${user?.avatar}`;
  const userId = window.localStorage.getItem("userId");

  return (
    <>
      <Avatar
        id="profile-positioned-button"
        aria-controls={openMenu ? "profile-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={openMenu ? "true" : undefined}
        alt={userName}
        src={userImg}
        onClick={handleClick}
      />
      <Menu
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        TransitionComponent={Fade}
        id="profile-positioned-menu"
        aria-labelledby="profile-positioned-button"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box p={1}>
          <Stack spacing={1}>
            {Profile_Menu.map((el, idx) => (
              <MenuItem key={idx} onClick={handleClose}>
                <Stack
                  onClick={() => {
                    if (idx === 0) {
                      navigate("/profile");
                    } else if (idx === 1) {
                      navigate("/settings");
                    } else {
                      dispatch(LogoutUser());
                      socket.emit("end", { userId });
                    }
                  }}
                  sx={{ width: 100 }}
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                >
                  <span>{el.title}</span>
                  {el.icon}
                </Stack>{" "}
              </MenuItem>
            ))}
          </Stack>
        </Box>
      </Menu>
    </>
  );
};

export default ProfileMenu;
