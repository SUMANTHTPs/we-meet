import { Stack, Typography } from "@mui/material";
import React from "react";
import VerifyForm from "../../sections/auth/VerifyForm";

function VerifyRegistration() {
  return (
    <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
      <Typography variant="h4">Please verify OTP</Typography>
      <Stack direction={"row"} spacing={0.5}>
        <Typography variant="body2">Sent to email sumanth@gmail.com</Typography>
      </Stack>
      {/* Verify form  */}
      <VerifyForm />
    </Stack>
  );
}

export default VerifyRegistration;
