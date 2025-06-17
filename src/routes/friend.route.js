import { Router } from "express";
import verifyJwt from "../middlewears/auth.middlewares.js";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getAllFriends,
  getFriendRequests,
  getSentFriendRequests,
  getSuggestedFriends,
  rejectedFriendRequest,
  sendFriendRequest,
  unfriend,
} from "../controllers/friend.controller.js";
const router = Router();

router.post("/request", verifyJwt, sendFriendRequest);
router.post("/cancel-request", verifyJwt, cancelFriendRequest);


router.post("/accept", verifyJwt, acceptFriendRequest);
router.post("/rejected", verifyJwt, rejectedFriendRequest);
router.post("/unfriend", verifyJwt, unfriend);

router.get("/get-requests", verifyJwt, getFriendRequests);
router.get("/get-sent-requests", verifyJwt, getSentFriendRequests);


router.get("/all-friend", verifyJwt, getAllFriends);
router.get("/all-suggested-friends", verifyJwt, getSuggestedFriends);

export default router;
