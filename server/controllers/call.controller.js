import {generateToken04} from '../services/zegoServerAssistant.js'
import Call from '../models/call.model.js'
import asyncHandler from '../middlewares/asyncHandler.middleware.js';

const appID = process.env.ZEGO_APP_ID;
const serverSecret = process.env.ZEGO_SERVER_SECRET;

export const generateZegoToken = asyncHandler(async (req, res) => {
    try {
        const { userId, room_id } = req.body

        const effectiveTimeInSeconds = 3600;
        const payloadObject = {
          room_id,
          privilege: {
            1: 1,
            2: 1, 
          },
          stream_id_list: null,
        };
        const payload = JSON.stringify(payloadObject);
        const token = generateToken04(
          appID * 1,
          userId,
          serverSecret,
          effectiveTimeInSeconds,
          payload
        );
        res.status(200).json({
          status: "success",
          message: "Token generated successfully",
          token,
        });
      } catch (err) {
        res.status(500).json({
          status: "error",
          message: err.message,
        });
      }
})

export const getLogs = asyncHandler(async (req, res) => {
    const user_id = req.user._id;

  const call_logs = [];

  const calls = await Call.find({
    participants: { $all: [user_id] },
  }).populate("from to");

  for (let elm of calls) {
    const missed = elm.verdict !== "Accepted";
    if (elm.from._id.toString() === user_id.toString()) {
      const other_user = elm.to;

      // outgoing
      call_logs.push({
        id: elm._id,
        img: other_user.avatar,
        name: other_user.name,
        incoming: false,
        missed,
        type: elm.type,
      });
    } else {
      // incoming
      const other_user = elm.from;

      // outgoing
      call_logs.push({
        id: elm._id,
        img: other_user.avatar,
        name: other_user.firstName,
        incoming: true,
        missed,
        type: elm.type,
      });
    }
  }

  res.status(200).json({
    status: "success",
    message: "Call Logs Found successfully!",
    data: call_logs,
  });
})

export const startCall = asyncHandler(async (req, res) => {
  const from = req.user._id;
  const to = req.body.id;
    const type = req.body.type;

  const to_user = await User.findById(to);

  const new_call = await Call.create({
    participants: [from, to],
    from,
    to,
    status: "Ongoing",
    type,
  });

  res.status(200).json({
    data: {
      from: to_user,
      roomID: new_call._id,
      streamID: to,
      userID: from,
      userName: from,
    },
    type,
  });
})

