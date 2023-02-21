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
  // On commence par récupérer tous les scraps de la base de données
  // let allScraps = await Scrap.find();
  //On récupère un objet appelé filter côté client contenant condition et isFree.
  const userFilters = JSON.parse(req.query.filter);
  console.log("typeof userFilters ==== > ", typeof userFilters);
  console.log(" userFilters ==== > ", userFilters);
  //On crée un objet vide dans lequel tous les résultats des filtres selectionnées seront intégrés.
  let filters = {};

  try {
    //Tri
    //NAME
    if (userFilters.search) {
      filters.name = { $regex: userFilters.search, $options: "i" };
    }
    //CONDITION
    console.log("userFilters.condition =====> ", userFilters.condition);
    console.log(
      "userFilters.condition.perfect =====> ",
      userFilters.condition.perfect
    );
    const conditions = userFilters.condition;
    if (userFilters.perfect) {
      filters.condition = "Comme neuf";
    } else if (userFilters.good) {
      filters.condition = { $in: ["Comme neuf", "Très bon état"] };
    } else if (userFilters.acceptable) {
      filters.condition = { $in: ["Comme neuf", "Très bon état", "Correct"] };
    } else if (userFilters.damaged) {
      filters.condition = {
        $in: ["Comme neuf", "Très bon état", "Correct", "Abîmé"],
      };
    } else if (userFilters.ruined) {
      filters.condition = {
        $in: ["Comme neuf", "Très bon état", "Correct", "Abîmé", "Très abîmé"],
      };
    }

    //PRICE
    const freeScrap = userFilters.freeScrap;
    console.log("freeScrap ==== > ", freeScrap);
    if (freeScrap) {
      filters = freeScrap && { $or: [{ isFree: true }, { price: 0 }] };
    }
    let priceSorted = {};
    console.log("req.query.sort =====> ", req.query.sort);
    if (req.query.sort === "price-asc") {
      priceSorted = { price: 1 };
    }
    if (req.query.sort === "price-desc") {
      priceSorted = { price: -1 };
    }
    //REPONSE

    // if (userFilters.isAsc || userFilters.isDesc) {
    //   allScraps = await Scrap.find(filters).sort(priceSorted);
    // } else {
    //   allScraps = await Scrap.find(filters);
    // }

    const allScraps = await Scrap.find(filters).sort(priceSorted);
    // Nombre d'annonces trouvées en fonction des filtres
    const count = await Scrap.countDocuments();
    res.status(200).json(allScraps);
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
      height,
      length,
      mmLength,
      cmLength,
      mLength,
      width,
      mmWidth,
      cmWidth,
      mWidth,
      thickness,
      mmThickness,
      cmThickness,
      mThickness,
      diameter,
      mmDiameter,
      cmDiameter,
      mDiameter,
      depth,
      mmDepth,
      cmDepth,
      mDepth,
      shape,
      necessaryTool,
      normAndLabel,
      brand,
      pictures,
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
        height: height,
        length: length,
        mmLength: mmLength,
        cmLength: cmLength,
        mLength: mLength,
        width: width,
        mmWidth: mmWidth,
        cmWidth: cmWidth,
        mWidth: mWidth,
        thickness: thickness,
        mmThickness: mmThickness,
        cmThickness: cmThickness,
        mThickness: mThickness,
        diameter: diameter,
        mmDiameter: mmDiameter,
        cmDiameter: cmDiameter,
        mDiameter: mDiameter,
        depth: depth,
        mmDepth: mmDepth,
        cmDepth: cmDepth,
        mDepth: mDepth,
        shape: shape,
        necessaryTool: necessaryTool,
        normAndLabel: normAndLabel,
        brand: brand,
        // owner: req.user._id,
      });

      await newScrap.save();
      res.json(newScrap);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//Uploader une image
app.post("/scrap/upload", fileUpload(), async (req, res) => {
  console.log("get into route /scraps/upload");
  console.log("req.files.picture === >", req.files.picture);
  try {
    const pictureToUpload = req.files.picture;
    // On envoie une à Cloudinary un buffer converti en base64
    const result = await cloudinary.uploader.upload(
      convertToBase64(pictureToUpload)
    );
    return res.json(result);
  } catch (error) {
    console.log("Erreur du serveur Catch");
    return res.json({ error: error.message });
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
      if (email || password || username) {
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
