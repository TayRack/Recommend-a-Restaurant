const express = require("express")
const multer = require('multer');

const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectId;

const db = require('../database/database');

const storageConfig = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'images');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  } 
});

const upload = multer({ storage: storageConfig});

const router = express.Router();

router.get("/restaurants", async function (req, res) {
  //const htmlFilePath = path.join(__dirname, "views", "restaurants.html");
  //res.sendFile(htmlFilePath);
  let order = req.query.order;
  if (order !=='asc' && order !=='desc') {
    order = 'asc';
  }

  let nextOrder = 'desc'
  if (order === 'desc') {
    nextOrder ='asc';
  }

  const storedRestaurants = await db.getDb().collection('Restaurants').find().toArray();

  storedRestaurants.sort(function(resA, resB) { 
    if (order === 'asc' && resA.name > resB.name || order === 'desc' && resB.name > resA.name) {
      return 1;
    }
    return -1;
  });

  res.render("restaurants", {
    numberOfRestaurants: storedRestaurants.length,
    restaurants: storedRestaurants,
    nextOrder: nextOrder,
  });
});

router.get("/restaurants/:id", async function (req, res) {
  const restaurantId = req.params.id;

  const storedRestaurantsItem = await db.getDb().collection('Restaurants').findOne({_id: new ObjectId(restaurantId)});


  if (!storedRestaurantsItem) {
    return res.status(404).render("404");
  }

  res.render("restaurant-detail", {restaurant: storedRestaurantsItem});
});

router.get("/recommend", function (req, res) {
  //const htmlFilePath = path.join(__dirname, "views", "recommend.html");
  //res.sendFile(htmlFilePath);
  res.render("recommend");
});

router.post("/recommend", upload.single('image'), async function (req, res) {
  const restaurants = req.body;
  const uploadedImageFile = req.file;

  const restaurantInfo = {
    name: restaurants.name,
    address: restaurants.address,
    cuisine: restaurants.cuisine,
    website: restaurants.website,
    description: restaurants.description,
    imagePath: uploadedImageFile.path
  };

  
  const result = await db.getDb().collection("Restaurants").insertOne(restaurantInfo);
  res.redirect("/confirm");
});

router.get("/confirm", function (req, res) {
  //const htmlFilePath = path.join(__dirname, "views", "confirm.html");
  //res.sendFile(htmlFilePath);
  res.render("confirm");
});

module.exports = router;
