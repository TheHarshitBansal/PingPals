import { createSlice } from "@reduxjs/toolkit";
import { socket } from "../../socket";

const initialState = {
  open_dialog: false,
  open_notification_dialog: false,
  call_queue: [],
  incoming: false,
  type: null,
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    pushToCallQueue(state, action) {
      if (state.call_queue.length === 0) {
        state.call_queue.push(action.payload.call);
        if (action.payload.incoming) {
          state.open_notification_dialog = true
          state.incoming = true;
          state.type = action.payload.type;
        }
        else {
          state.open_dialog = true;
          state.incoming = false;
            state.type = action.payload.type;
        }
      } else {
        //INFO: if queue is not empty then emit user_is_busy => in turn server will send this event to sender of call
        socket.emit("user_is_busy_audio_call", { ...action.payload });
      }
    },
    resetCallQueue(state, action) {
      state.call_queue = [];
      state.open_notification_dialog = false;
      state.incoming = false;
        state.type = null;
    },
    closeNotificationDialog(state, action) {
      state.open_notification_dialog = false;
    },
    updateCallDialog(state, action) {
      state.open_dialog = action.payload.state;
      state.open_notification_dialog = false;
    },
  },
});

export const {
  pushToCallQueue,
  resetCallQueue,
  closeNotificationDialog,
  updateCallDialog,
} = callSlice.actions;

export default callSlice.reducer;