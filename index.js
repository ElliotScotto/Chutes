//import packages
const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
//
const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI);
//import des models
const User = require("./models/User");
//Routes
app.get("/", (req, res) => {
  res.json({ message: "Ceci est la route / de l'API Chutes" });
});
app.post("/scraps/signin", async (req, res) => {
  console.log("route : /scraps/signin");
  console.log(req.body);
  try {
    // Création d'un nouveau document grâce aux données envoyées via Postman :
    const { username, email, password } = req.body;
    const newUserMail = await User.findOne({ email });
    const newUserName = await User.findOne({ username });
    if (newUserMail) {
      res.json({ message: "Cet email est déjà utilisé." });
    } else if (newUserName) {
      res.json({ message: "Ce nom d'utilisateur existe déjà." });
    } else if (password.length < 8) {
      res.json({
        message: "Votre mot de passe doit comporter au moins 8 caractères",
      });
    } else {
      if (email && password && username) {
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);
        const user = new User({
          email: email,
          username: username,
          token: token,
          salt: salt,
          hash: hash,
        });
        await user.save();
        res.json({
          _id: user._id,
          token: user.token,
          username: user.username,
          email: user.email,
        });
      } else {
        res.json({ error: "Tous les champs doivent être remplis" });
      }
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});
//
//
app.all("*", function (req, res) {
  res.status(404).json({ message: "Page non trouvée" });
});
//
const port = process.env.PORT || process.env.localPort;
app.listen(port, () => {
  console.log("Le serveur a demarré");
});
