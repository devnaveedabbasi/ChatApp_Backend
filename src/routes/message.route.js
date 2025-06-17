import { Router } from "express";
import { getUserForSidebar,getMessages, sendMessage } from "../controllers/message.controller.js";
import protectedRoute from '../middlewears/auth.middlewares.js'
import { upload } from "../middlewears/multer.middlewares.js";
const router=Router()

router.get("/get-users" ,protectedRoute,getUserForSidebar)
router.get("/:id",protectedRoute,getMessages)
router.post("/send/:id", upload?.single("image"),protectedRoute ,sendMessage);

export default router