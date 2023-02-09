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
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const auth = require("./middlewares/auth");
//config
const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
mongoose
  .set("strictQuery", true)
  .connect(process.env.MONGODB_URI || MONGODB_URI_SECONDARY);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_SECRETAPIKEY,
});
//fonctions
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
//import des models
const User = require("./models/User");
const Scrap = require("./models/Scrap");
//
//ROUTES
//Afficher les offres
app.get("/scraps", async (req, res) => {
  console.log("get into route /scraps");
  try {
    const allScraps = await Scrap.find();
    console.log("allscraps ===> ", allScraps);
    res.status(200).json(allScraps);
    // res.status(200).json("coucou, ceci est la réponse du back /scraps");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//Afficher une offre
app.get("/scrap/:id", async (req, res) => {
  console.log("get into route /scrap/:id");
  const idScrap = req.params.id;
  try {
    const result = await Scrap.findById(idScrap);
    console.log("Result ===> ", result);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//Créer une offre
app.post("/scrap/create", fileUpload(), async (req, res) => {
  console.log("get into route /scraps/create");

  try {
    const {
      name,
      condition,
      description,
      quantity,
      price,
      isFree,
      isForSell,
      category,
      homePickup,
      sending,
      material,
      weight,
      pictures,
      height,
      length,
      width,
      thickness,
      diameter,
      depth,
      shape,
      necessaryTool,
      normAndLabel,
      brand,
    } = req.body;
    if (name) {
      const newScrap = new Scrap({
        name: name,
        condition: condition,
        quantity: quantity,
        description: description,
        price: price,
        isFree: isFree,
        isForSell: isForSell,
        category: category,
        homePickup: homePickup,
        sending: sending,
        material: material,
        weight: weight,
        pictures: pictures,
        height: height,
        length: length,
        width: width,
        thickness: thickness,
        diameter: diameter,
        depth: depth,
        shape: shape,
        necessaryTool: necessaryTool,
        normAndLabel: normAndLabel,
        brand: brand,
        // owner: req.user._id,
      });
      //   const pictureScrap = await cloudinary.uploader.upload(
      //     convertToBase64(req.files.pictures)
      //   );
      //   newScrap.pictures = pictureScrap;

      await newScrap.save();
      res.json(newScrap);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Inscription
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
        const newUser = new User({
          email: email,
          username: username,
          token: token,
          salt: salt,
          hash: hash,
        });
        await newUser.save();
        res.json({
          _id: newUser._id,
          token: newUser.token,
          username: newUser.username,
          email: newUser.email,
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
// const port = process.env.PORT || process.env.localPort;
app.listen(3000, () => {
  console.log(`Le serveur a demarré sur le port 3000 `);
});
