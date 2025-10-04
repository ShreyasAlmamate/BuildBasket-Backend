const jwt = require('jsonwebtoken');

module.exports.authMiddleware = async(req, res, next) =>{
    const {accessToken} = req.cookies

    if (!accessToken) {
        return res.status(409).json({ error : 'Please Login First'})
    } else {
        try {
            const deCodeToken = await jwt.verify(accessToken,process.env.JWT_SECRET)
            req.role = deCodeToken.role
            req.id = deCodeToken.id
            next()            
        } catch (error) {
            return res.status(409).json({ error : 'Please Login'})
        }        
    }
}

module.exports.isSeller = async(req, res, next) =>{
    let token = req.cookies.accessToken;
    
    // Also check Authorization header for API testing
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(409).json({ error : 'Please Login First'})
    } else {
        try {
            const deCodeToken = await jwt.verify(token,process.env.JWT_SECRET)
            if (deCodeToken.role !== 'seller') {
                return res.status(403).json({ error : 'Access denied. Seller role required.'})
            }
            req.seller = { id: deCodeToken.id, role: deCodeToken.role }
            req.role = deCodeToken.role
            req.id = deCodeToken.id
            next()            
        } catch (error) {
            return res.status(409).json({ error : 'Please Login'})
        }        
    }
}