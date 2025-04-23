const Location = require('../models/Location')
const SavedLocationGroup = require('../models/SavedLocationGroup')
const CustomError = require('../utils/customError')



const getAllLocations = async (req, res, next) => {
    try {
        
        const locations = await Location.find().lean()

        if(locations.length === 0) {
            /* return res.status(400).json({ msg: "No locations found"}) */
            throw new CustomError('No locations found', 400)
        }

        if(locations) {
            const flattenedLocations = locations.flatMap(location => (
                location.roomPrice.map((room) => (
                    {
                        ...location,
                        roomCount: room.roomCount,
                        roomPrice: room.price,
                        roomPerson: location.roomPerson.find(person => person.roomCount === room.roomCount).maxPerson
                    }
                ))
            ))

            const sortedAndGrouped = flattenedLocations.sort((a, b) => a.roomPrice - b.roomPrice)
                                                       .reduce((acc, item) => {
                                                        if(!acc[item.roomCount]) {
                                                            acc[item.roomCount] = []
                                                        }
                                                        acc[item.roomCount].push(item)
                                                        return acc
                                                       }, {})

            let locationIndex = {}
            Object.keys(sortedAndGrouped).forEach(roomCount => {
                sortedAndGrouped[roomCount].forEach((location) => {
                if(!locationIndex[location._id]) locationIndex[location._id] = []
                locationIndex[location._id].push(roomCount)
                })
                })
            res.status(200).json({sortedAndGrouped, locationIndex})
        }
       
    } catch (error) {
        next(error)
    }
}


const getSingleLocation = async (req, res, next) => {
    try {
        const { userId: ownerId } = req

        if(!ownerId) {
            throw new CustomError('UserId required', 400)
        }
        
        const locations = await Location.find({ownerId}).lean()

        if(locations.length === 0) {
            /* throw new CustomError('No locations found', 400) */
           return res.status(200).json([])
        }
        console.log("single locations", locations)
        res.status(200).json(locations)
        
       
    } catch (error) {
        next(error)
    }
}



const createNewLocation = async (req, res, next) => {
    try {
        const { userId: ownerId, phoneNumber } = req
       
        const { latitude, longitude, street, locality, district, roomCount, roomPrice, roomPerson, duration } = req.body

        console.log('ownerId', ownerId)
        console.log('phoneNumber', phoneNumber)
        console.log('latitude', latitude)
        console.log('longitude', longitude)
        console.log('street', street)
        console.log('locality', locality)
        console.log('district', district)
        console.log('roomCount', roomCount)
        console.log('roomPrice', roomPrice)
        console.log('roomPerson', roomPerson)
        console.log('duration', duration)

        if(!ownerId || !latitude || !longitude || !street || !locality || !district || !phoneNumber || !Array.isArray(roomCount) || !Array.isArray(roomPerson) || !Array.isArray(roomPrice) || !duration) {
            throw new CustomError('All fields are required', 400); // Use CustomError for consistency
        }

        const newLocation = await Location.create({ownerId, latlng: {latitude, longitude}, street, locality, district, phoneNumber, roomCount, roomPrice, roomPerson, duration})

        if(newLocation) {
            let temporaryLocation = newLocation
            const flattenedArray = [temporaryLocation].flatMap(location => (
                location.roomPrice.map((room) => (
                    {
                        ...location.toObject(),
                        roomCount: room.roomCount,
                        roomPrice: room.price,
                        roomPerson: location.roomPerson.find((person) => person.roomCount === room.roomCount)?.maxPerson
                    }
                ))
            ))

            const sortedAndGrouped = flattenedArray.sort((a, b) => a.roomPrice - b.roomPrice)
                                                   .reduce((acc, item) => {
                                                    if(!acc[item.roomCount]) acc[item.roomCount] = []
                                                    acc[item.roomCount].push(item)
                                                    return acc
                                                   }, {})
            
            
            console.log("New location saved")
            res.status(201).json({
                msg: "New Location created!",
                data: { sortedAndGrouped, newLocation }
            }
            )
        }
        
    } catch (error) {
        next(error) // Pass the error to the centralized error handler
    }
}


const updateLocation = async (req, res, next) => {
    try {
        const { id } = req.params
        const { userId: ownerId } = req
        const { roomCount, roomPrice, roomPerson } = req.body

        if(!id || !Array.isArray(roomCount) || !Array.isArray(roomPerson) || !Array.isArray(roomPrice) || !ownerId) {
            throw new CustomError('All fields are required', 400)
        }

        const location = await Location.findById(id)/* .lean().exec() */
        
       /*  const duplicate = await Location.findOne({ownerId}).lean().exec()
        if(duplicate && duplicate._id.toString() !== id) {
            throw new CustomError('Owner has already submitted the location or duplicate ownerId', 400)
        } */
       console.log(roomCount, roomPrice, roomPerson)
       location.roomCount = roomCount
       location.roomPrice = roomPrice
       location.roomPerson = roomPerson
    

        const updatedLocation = await location.save()

        if(updatedLocation) {
            const temporaryLocation = updatedLocation
         // find the savedlocation group using userId
        const locationGroup = await SavedLocationGroup.findOne({userId: ownerId}).populate('savedLocationIds').lean()

        // flattening the updated location and creating sorted and grouped updatedLocation
        console.log(temporaryLocation.roomCount, temporaryLocation.roomPrice, temporaryLocation.roomPerson)
        console.log([temporaryLocation])
        const sortedAndGrouped = [temporaryLocation].flatMap(location => (
            location.roomPrice.map((room) => ({
                ...location.toObject(),
                roomCount: room.roomCount,
                roomPrice: room.price,
                roomPerson: location.roomPerson.find((person) => person.roomCount === room.roomCount).maxPerson
            }))
        ))
        .sort((a, b) => a.roomPrice - b.roomPrice)
        .reduce((acc, item) => {
            if(!acc[item.roomCount]) acc[item.roomCount] = []
            acc[item.roomCount].push(item)
            return acc
        }, {})
    
        /* console.log("From location updation", updatedLocation)
        console.log("populated ids", locationGroup.savedLocationIds) */
        console.log(sortedAndGrouped, "from updation")
        res.status(200).json({
            msg: "Location updated successfully",
            data: {updatedLocation, sortedAndGrouped, updatedLocationId: id, savedLocationIds: locationGroup?.savedLocationIds || [] }
        })
        
            
        }
        
    } catch (error) {
        next(error)
    }
}



const deleteLocation = async (req, res, next) => {
    try {
        const { id } = req.params
        const { userId } = req

        if(!id || !userId) {
            throw new CustomError('Id required to delete', 400)
        }

        const location = await Location.findById(id).lean()

        if(location) {
            await Location.deleteOne({ _id: id })

            const locationGroup = await SavedLocationGroup.findOne({userId})
            if(locationGroup) {
                const updatedLocation = locationGroup.savedLocationIds.filter((locationId) => locationId.toString() !== id)
                locationGroup.savedLocationIds = updatedLocation
                const updatedGroup = await locationGroup.save()
                if(updatedGroup) {
                    console.log('location deleted and updated the savedLocationIDs also')
                    res.status(200).json({msg: "Location deleted"})
                }
            }
            
        }
        
    } catch (error) {
        next(error)
    }
}




const getAllLocationGroup = async (req, res, next) => {
    try {

        const { userId } = req

        if(!userId) {
            throw new CustomError("UserId required", 400)
        }
        
        const locationGroup = await SavedLocationGroup.findOne({userId}).populate('savedLocationIds').lean()

        if(locationGroup.savedLocationIds.length === 0) {
           /*  throw new CustomError('No locationGroup found', 400) */
           return res.status(200).json([])
        }

        console.log("Saved Locations Group", locationGroup.savedLocationIds)
        res.status(200).json(locationGroup.savedLocationIds)
       
    } catch (error) {
        next(error)
    }
}


const createSavedLocation = async (req, res, next) => {
    try {
        console.log("I am from locationGroup1")
        const { userId} = req
        const selectedLocationIds = req.body
        console.log(userId, selectedLocationIds)

        if(!userId || !Array.isArray(selectedLocationIds)) {
            throw new CustomError('All fields are required', 400)
        }
        console.log("I am from locationGroup")

        const locationGroup = await SavedLocationGroup.findOne({userId})
        if(locationGroup) {
            const updatedLocationIds = [...new Set(locationGroup.savedLocationIds.concat(selectedLocationIds))]
            locationGroup.savedLocationIds = updatedLocationIds
            const updatedGroup = await locationGroup.save()

            if(updatedGroup) {
                

                // Populate the savedLocationIds field
                const populatedGroup = await updatedGroup.populate('savedLocationIds')
                console.log("From duplicate saved location group", populatedGroup.savedLocationIds)
                return res.status(201).json({
                    msg: "Location Group Updated",
                    data: populatedGroup.savedLocationIds
                })
            }
        }

          // Create a new location group if none exists
        const newLocationGroup = await SavedLocationGroup.create({userId,  savedLocationIds: selectedLocationIds})

        if(newLocationGroup) {
            console.log("New location Group saved", newLocationGroup.savedLocationIds)

            // Populate the savedLocationIds field
            const populatedNewGroup = await newLocationGroup.populate('savedLocationIds')
            res.status(201).json({
                msg: "New Location Group created!",
                data: populatedNewGroup.savedLocationIds
            }
            )
        }
        
    } catch (error) {
        next(error)
    }
}


const deleteSavedLocation = async (req, res, next) => {
    try {
        const { userId } = req
        const { id } = req.params

        if(!userId || !id) {
            throw new CustomError('All fields are required', 400)
        }

        const locationGroup = await SavedLocationGroup.findOne({userId})
        if(locationGroup) {
            console.log(id, "before filtering ids", locationGroup.savedLocationIds)
            let updatedLocationIds = locationGroup.savedLocationIds.filter((locationId) => locationId.toString() !== id )
            console.log("updatedLocationIds", updatedLocationIds)
            locationGroup.savedLocationIds = updatedLocationIds
            const updatedGroup = await locationGroup.save()

            if(updatedGroup) {
                console.log("After Deletion of location group", updatedGroup.savedLocationIds)
                return res.status(200).json({
                    msg: "Location Group Updated",
                    data: updatedGroup.savedLocationIds
                })
            }

            
            
        }
        
    } catch (error) {
        next(error)
    }
}




module.exports = { getAllLocations, createSavedLocation, getSingleLocation, getAllLocationGroup, createNewLocation, updateLocation, deleteLocation, deleteSavedLocation }