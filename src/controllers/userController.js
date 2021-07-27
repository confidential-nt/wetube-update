import User from "../models/User";
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

export const edit = (req, res) => res.send("user edit");
export const remove = (req, res) => res.send("user remove");

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

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

export const logout = (req, res) => res.send("logout");
export const see = (req, res) => res.send("see video");
