const jwt = require('jsonwebtoken');

module.exports.adminMiddleware = async(req, res, next) => {
    const {accessToken} = req.cookies

    if (!accessToken) {
        return res.status(409).json({ error: 'Please Login First' })
    } else {
        try {
            const deCodeToken = await jwt.verify(accessToken, process.env.JWT_SECRET)
            
            // Check if user is admin
            if (deCodeToken.role !== 'admin') {
                return res.status(403).json({ error: 'Access Denied. Admin privileges required.' })
            }
            
            req.role = deCodeToken.role
            req.id = deCodeToken.id
            next()            
        } catch (error) {
            return res.status(409).json({ error: 'Please Login' })
        }        
    }
}
