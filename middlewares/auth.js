const express = require("express");
const app = express();
app.use(express.json());
const User = require("../models/User");
//
//
const auth = async (req, res, next) => {
  console.log(`get into "auth"`);
  // console.log(req.headers.authorization); //Affiche Bearer o6W1skur7_fR5xt699ECOEaOn_opTmcl6Q_yza0EsYnfHRnetVIXMvDJGTKdzH4S
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    }); // On peut ajouter une méthode Mongoose ici: .select("") <==ici on note les clés que l'on souhaite garder et afficher.
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = user; // on crée une clé "user" dans req. La route dans laquelle le middleware est appelé pourra avoir accès à req.user
      return next();
    }
  }
};
//
module.exports = auth;
