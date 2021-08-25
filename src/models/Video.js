import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 }, // String === {type: String}
  fileUrl: { type: String, required: true },
  thumbUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }], // string 배열이 될 것이다.
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

// videoSchema.pre("save", async function () {
//   const regex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+|[a-z]+/gi;

//   // this.hashtags = ["string"]임.
//   // 이유는, 우리가 schema를 만들때 hashtags부분은 어레이가 될거라고 미리 선언해줘서
//   // 우리가 인풋에 그냥 스트링을 넣어도 몽구스가 그냥 알아서 어레이로 변환함.

//   this.hashtags = this.hashtags[0].split(",").map((hashtag) => {
//     const regexed = hashtag.match(regex)[0];
//     return `#${regexed}`;
//   });
// });

videoSchema.static("formatHashtags", function (hashtags) {
  const regex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+|[a-z]+/gi;

  return hashtags.split(",").map((hashtag) => {
    const regexed = hashtag.match(regex)[0];
    return `#${regexed}`;
  });
});

const Video = mongoose.model("Video", videoSchema);

export default Video; // 모두가 이 비디오 모델을 사용할 수 있게 하기위해.
