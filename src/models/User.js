import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false }, // user가 깃헙 로그인 했는지 여부를 알기위해. 이것은 유저가 이메일로 로그인하려는데 패스워드가 없을 때 유용할 수 있음. 깃헙 아이디를 체크하면 되니까.
  username: { type: String, required: true, unique: true },
  password: { type: String },
  location: { type: String, required: true },
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
