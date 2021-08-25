import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  deleteVideo,
  getUpload,
  postUpload,
} from "../controllers/videoController";
import {
  protectorMiddleware,
  shareBufferMiddleware,
  videoUpload,
} from "../middlewares";

const videoRouter = express.Router();

videoRouter
  .route("/upload")
  .all(protectorMiddleware, shareBufferMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);

videoRouter.get("/:id([0-9a-f]{24})/delete", protectorMiddleware, deleteVideo); // get을 사용하는 이유? 단순히 이 url을 방문할뿐이기 때문.

export default videoRouter;
