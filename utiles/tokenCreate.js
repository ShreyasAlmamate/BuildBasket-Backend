const jwt = require('jsonwebtoken')
module.exports.createToken = async(data) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    const token = await jwt.sign(data, secret, {
        expiresIn: '7d'
    });
    return token;
}