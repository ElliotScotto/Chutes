const mongoose = require("mongoose");
const Scrap = mongoose.model("Scrap", {
  name: { type: String, required: true, maxlength: 40 },
  condition: {
    type: String,
    required: true,
    enum: ["Comme neuf", "Très bon état", "Correct", "Abîmé", "Très abîmé"],
  },
  description: { type: String, minlength: 10, maxlength: 300, required: true },
  quantity: { type: Number, default: 1, required: true },
  price: { type: Number, required: true },
  isForLend: { type: Boolean, default: false, required: false },
  category: {
    type: [String],
    required: true,
    enum: [
      "Quincaillerie",
      "Outils",
      "Peinture",
      "Sol",
      "Electricité",
      "Plomberie",
      "Toiture",
      "Menuiserie",
      "Gros-oeuvre",
      "Jardin",
      "Divers",
    ],
  },
  pictures: { type: Array, required: false },
  homePickup: { type: Boolean, default: true, required: true },
  sending: { type: Boolean, default: false, required: false },
  weight: { type: String, required: true },
  material: { type: [String], required: true },
  height: { type: Number, required: false },
  length: { type: Number, required: false },
  width: { type: Number, required: false },
  thickness: { type: Number, required: false },
  diameter: { type: Number, required: false },
  depth: { type: Number, required: false },
  shape: {
    type: [String],
    required: false,
    enum: [
      "Rond",
      "Carré",
      "Rectangle",
      "Triangle",
      "Plat",
      "Ovoïde",
      "Pentagone",
      "Hexagone",
      "Octagone",
    ],
  },
  necessaryTool: { type: String, required: false },
  normAndLabel: { type: String, required: false },
  brand: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
module.exports = Scrap;
