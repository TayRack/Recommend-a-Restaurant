const express = require("express");
const uuid = require("uuid");

const resData = require("../utility/restaurant-data");

const router = express.Router();

router.get("/restaurants", function (req, res) {
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

  const storedRestaurants = resData.getStoredRestaurants();

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

router.get("/restaurants/:id", function (req, res) {
  const restaurantId = req.params.id; //variable for the generated id

  const storedRestaurants = resData.getStoredRestaurants();
  for (const restaurant of storedRestaurants) {
    if (restaurant.id === restaurantId) {
      return res.render("restaurant-detail", {
        rid: restaurantId,
        restaurant: restaurant,
      });
    }
  }

  res.status(404).render("404");
});

router.get("/recommend", function (req, res) {
  //const htmlFilePath = path.join(__dirname, "views", "recommend.html");
  //res.sendFile(htmlFilePath);
  res.render("recommend");
});

router.post("/recommend", function (req, res) {
  const restaurant = req.body;
  restaurant.id = uuid.v4();
  const restaurantsInStorage = resData.getStoredRestaurants();

  restaurantsInStorage.push(restaurant);

  resData.updateRestaurantsInStorage(restaurantsInStorage);

  res.redirect("/confirm");
});

router.get("/confirm", function (req, res) {
  //const htmlFilePath = path.join(__dirname, "views", "confirm.html");
  //res.sendFile(htmlFilePath);
  res.render("confirm");
});

module.exports = router;
