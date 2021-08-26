import Comment from "../models/Comment";
import Video from "../models/Video";

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;

  const comment = await Comment.findById(id);

  if (String(comment.owner) !== String(_id)) {
    return res.sendStatus(403);
  }

  await Comment.findByIdAndRemove(id);
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    body: { text },
    params: { id },
    session: { user },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });

  video.comments.push(comment._id);
  await video.save();

  return res.status(201).json({ newCommentId: comment._id });
};
