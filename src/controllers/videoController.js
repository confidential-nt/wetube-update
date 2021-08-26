import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";

export const home = async (req, res) => {
  // Video.find({}, (error, videos) => {
  //   return res.render("home", { pageTitle: "Home", videos });
  // }); 콜백 이용한 Video.find

  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  // const owner = await User.findById(video.owner); 바보같은 방법!

  if (!video) {
    // 누군가가 존재하지 않은 video 페이지를 방문했을 때를 대비한 것.
    return res.render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;

  const video = await Video.findById(id); // video object가 반드시 필요함.

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You're not the owner of the video.");
    return res.status(403).redirect("/"); //403: forbidden
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const { _id } = req.session.user;

  const video = await Video.findById(id); // 굳이 video object 가 필요없기 때문에 그저 존재여부만 묻는 것.

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You're not the owner of the video.");
    return res.status(403).redirect("/"); //403: forbidden
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  req.flash("success", "Changes Saved.");
  return res.redirect(`/videos/${id}`);
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    const regex = new RegExp(keyword, "gi");
    videos = await Video.find({
      title: { $regex: regex },
    })
      .sort({ createdAt: "desc" })
      .populate("owner");
  }

  res.render("search", { pageTitle: "Search", videos });
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;

  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You're not the owner of the video.");
    return res.status(403).redirect("/"); //403: forbidden
  }

  await Video.findByIdAndDelete(id);

  return res.redirect("/");
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  const { video, thumb } = req.files;
  const { _id } = req.session.user;

  try {
    const newVideo = await Video.create({
      // 커서를 갖다대면 Video.create는 프로미즈를 리턴한다는 것을 알 수 있다.
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      // createdAt: Date.now(), 변하는 값이 아닌데 매번 아렇게 쳐야하는 건 곤욕. 따라서 schema에 가서 default 값으로 설정.
      hashtags: Video.formatHashtags(hashtags),
      // meta: {
      //   views: 0,
      //   rating: 0,
      // },
      owner: _id,
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();

    return res.redirect(`/`);
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error.message,
    });
  }
};

export const registerView = async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404); // 얜 주소를 바꾸지도, (그래서 누구나 접근 가능) 템플릿을 렌더링하지도 않는 컨트롤러임. 백엔드에 정보를 전송하고 처리하는 것만 함. 따라서 이 경우에 백엔드가 할 수 있는 대답은 이게 전부.
  }

  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};
