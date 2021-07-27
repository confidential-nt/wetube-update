import Video from "../models/Video";

export const home = async (req, res) => {
  // Video.find({}, (error, videos) => {
  //   return res.render("home", { pageTitle: "Home", videos });
  // }); 콜백 이용한 Video.find

  const videos = await Video.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (!video) {
    // 누군가가 존재하지 않은 video 페이지를 방문했을 때를 대비한 것.
    return res.render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id); // video object가 반드시 필요함.

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;

  const video = await Video.exists({
    _id: id,
  }); // 굳이 video object 가 필요없기 때문에 그저 존재여부만 묻는 것.

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  return res.redirect(`/videos/${id}`);
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    const regex = new RegExp(keyword, "gi");
    videos = await Video.find({
      title: { $regex: regex },
    }).sort({ createdAt: "desc" });
  }

  res.render("search", { pageTitle: "Search", videos });
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;

  await Video.findByIdAndDelete(id);

  return res.redirect("/");
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;

  try {
    await Video.create({
      // 커서를 갖다대면 Video.create는 프로미즈를 리턴한다는 것을 알 수 있다.
      title,
      description,
      // createdAt: Date.now(), 변하는 값이 아닌데 매번 아렇게 쳐야하는 건 곤욕. 따라서 schema에 가서 default 값으로 설정.
      hashtags: Video.formatHashtags(hashtags),
      // meta: {
      //   views: 0,
      //   rating: 0,
      // },
    });

    return res.redirect(`/`);
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error.message,
    });
  }
};
