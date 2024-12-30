const express = require('express')
const router = express.Router()

const locationController = require('../controllers/locationController')
const verifyToken = require("../middlewares/verifyToken")

router.route('/selected-locations')
  .get(verifyToken, locationController.getAllLocationGroup)
  .post(verifyToken, locationController.createSavedLocation)

  router.route('/selected-locations/:id')
  .delete(verifyToken, locationController.deleteSavedLocation)

router.route('/')
  .get(verifyToken, locationController.getAllLocations)
  .post(verifyToken, locationController.createNewLocation)

router.route('/single')
.get(verifyToken, locationController.getSingleLocation)

router.route('/:id')
  .put(verifyToken, locationController.updateLocation)
  .delete(verifyToken, locationController.deleteLocation)


module.exports = router