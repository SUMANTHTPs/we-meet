import { createSlice } from "@reduxjs/toolkit";

// import custom axios instance
import axios from "../../utils/axios";
import { showSnackbar } from "./app";

const initialState = {
  isLoggedIn: false,
  token: "",
  isLoading: false,
  email: "",
  error: false,
  userId: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
    logIn(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
    },
    signOut(state, action) {
      state.isLoggedIn = false;
      state.token = "";
      state.userId = null;
    },
    updateRegisterEmail(state, action) {
      state.email = action.payload.email;
    },
  },
});

export default slice.reducer;

// Log in

export function LoginUser(formValues) {
  return async (dispatch, getState) => {
    await axios
      .post(
        "/auth/login",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        dispatch(
          slice.actions.logIn({
            isLoggedIn: true,
            token: response.data.token,
            userId: response.data.userId,
          })
        );
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
        window.localStorage.setItem("userId", response.data.userId);
      })
      .catch(function (error, response) {
        console.log(error);
        dispatch(showSnackbar({ severity: "error", message: error.message }));
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.response.data.message,
          })
        );
      });
  };
}

export function LogoutUser() {
  return async (dispatch, getState) => {
    window.localStorage.removeItem("userId");
    dispatch(slice.actions.signOut());
    dispatch(
      showSnackbar({ severity: "success", message: "Logout successful" })
    );
  };
}

export function ForgotPassword(formValues) {
  return async (dispatch, get) => {
    //forgot-password
    await axios
      .post(
        "/auth/forgot-password",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(showSnackbar({ severity: "error", message: error.message }));
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.response.data.message,
          })
        );
      });
  };
}

export function NewPassword(formValues) {
  return async (dispatch, get) => {
    //Reset-password
    await axios
      .post(
        "/auth/reset-password",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(showSnackbar({ severity: "error", message: error.message }));
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.response.data.message,
          })
        );
      });
  };
}

export function RegisterUser(formValues) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    await axios
      .post(
        "/auth/register",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        dispatch(
          slice.actions.updateRegisterEmail({ email: formValues.email })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
      })
      .catch((error) => {
        console.log(error);
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.message + error.response.data.message,
          })
        );
      })
      .finally(() => {
        if (!getState().auth.error) {
          window.location.href = "/auth/verify";
        }
      });
  };
}

export function VerifyEmail(formValues) {
  return async (dispatch, getState) => {
    await axios
      .post(
        "/auth/verify-otp",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        dispatch(
          slice.actions.logIn({
            isLoggedIn: true,
            token: response.data.token,
            userId: response.data.userId,
          })
        );
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
      })
      .catch((error) => {
        console.log(error);
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.message + error.response.data.message,
          })
        );
      });
  };
}
