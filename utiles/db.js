const mongoose = require('mongoose');

module.exports.dbConnect = async()=>{
    try {
        const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/almaMate'
        await mongoose.connect(dbUrl)
        console.log("Database connected..")
    } catch (error) {
        console.log(error.message)
    }
}