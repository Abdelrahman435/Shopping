const express = require("express");
const favoritesController = require("../controllers/favoriteController");
const authController = require("./../controllers/authController");

const router = express.Router(); //to get access to params in courses router

router.use(authController.protect);

router.post("/addToFavorites/:id", favoritesController.addToFavorites);

module.exports = router;
