//import { JsonWebToken } from "jsonwebtoken"
import jwt from 'jsonwebtoken'
//const jwt = JsonWebToken()

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    
    jwt.verify(token, 'thisIsAccessTokenSecretForJwtToMakeAuthorization', (err) => {
        if (err) return res.sendStatus(463)
        next()
    })
}
 
export default authenticateToken