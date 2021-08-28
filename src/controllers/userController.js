import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;

  try {
    if (password !== password2) {
      throw new Error("Password confirmation doesn't match.");
    }

    const exists = await User.exists({
      $or: [{ username }, { email }],
    });

    if (exists) {
      throw new Error("This username/email is already taken.");
    }

    await User.create({
      name,
      email,
      username,
      password,
      password2,
      location,
    });

    return res.redirect("/login");
  } catch (error) {
    return res
      .status(400)
      .render("join", { pageTitle: "Join", errorMessage: error });
  }
};

export const getEdit = (req, res) =>
  res.render("edit-profile", { pageTitle: "Edit Profile" });
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, username: preUsername, email: preEmail, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  let condition = [];

  try {
    if (preUsername !== username) {
      condition.push({ username });
    }

    if (preEmail !== email) {
      condition.push({ email });
    }

    if (condition.length) {
      const exist = await User.exists({
        $or: condition,
      });

      if (exist) {
        throw new Error("This username/email is already taken.");
      }
    }
    const isHeroku = process.env.NODE_ENV === "production";
    const user = await User.findByIdAndUpdate(
      _id,
      {
        avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
        name,
        email,
        username,
        location,
      },
      { new: true }
    );

    req.session.user = user;
    req.flash("info", "Profile Updated!");
    return res.redirect("/users/edit");
  } catch (e) {
    return res.render("edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: e.message,
    });
  }
};

export const remove = (req, res) => res.send("user remove");

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, socialOnly: false });

  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this username doesn't exists.",
    });
  }

  // check if password correct
  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";

  const config = {
    client_id: process.env.GH_CLIENT, // 딱히 비밀은 아닌데, 반복되어서 사용되어질 것이므로.
    allow_signup: false,
    scope: "read:user user:email",
  };

  const params = new URLSearchParams(config).toString();

  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";

  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };

  const params = new URLSearchParams(config).toString();

  const finalUrl = `${baseUrl}?${params}`;

  const data = await fetch(finalUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  const json = await data.json();

  if ("access_token" in json) {
    const { access_token } = json;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );

    if (!emailObj) {
      res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        name: userData.name || "anonymous",
        avatarUrl: userData.avatar_url,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true, // 소셜로그인만 사용한 경우를 표시하기 위해.
        location: userData.location || "no location",
      });
    }

    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
  } else {
    res.redirect("/login");
  }
};

export const logout = (req, res) => {
  // req.session.destroy();
  req.session.loggedIn = false;
  req.session.user = null;

  req.flash("info", "Good Bye :)");
  setTimeout(() => {
    req.session.destroy();
  }, 1000);
  return res.redirect("/");
};

export const getChangePasword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPassword2 },
  } = req;

  const user = await User.findById(_id);

  const ok = await bcrypt.compare(oldPassword, user.password);

  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }

  if (newPassword !== newPassword2) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password is not same with the confirmation",
    });
  }

  user.password = newPassword;
  await user.save();
  req.flash("info", "Password Updated");
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner", // 이걸 하지 않으면 또 비디오들의 owner를 가져올 수가 없구나..
    },
  });

  if (!user) {
    return res.status(404).render("404", {
      pageTitle: "User Not Found",
    });
  }

  return res.render("users/profile", {
    pageTitle: `${user.name}의 Profile`,
    user,
  });
};
