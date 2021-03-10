const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Balance = require('../models/Balance');
const {reauthorise} = require('../controllers/allControllers');

const secret = process.env.MONO_WEBHOOK_SEC;

const requireAuth = ( req, res, next) => {
	const token = req.cookies.jwt;

	// check if jwt exists & is verified
	if (token) {
		jwt.verify(token, process.env['TOKEN'], (err, decodedToken) => {
			if (err) {
				console.log(err.message);
				res.redirect('/login');
			}else{
				// console.log(decodedToken);
				next();
			}
		});
	}else{
		res.redirect('/login');
	}
}

const checkUser = (req, res, next) => {
	const token = req.cookies.jwt;

	if (token) {
		jwt.verify(token, process.env['TOKEN'], async (err, decodedToken) => {
			if (err) {
				console.log(err.message);
				res.locals.data = null;
				res.locals.reauth = null;
				next();
			}else{
				let monoBalance = ""
				let user = await User.findById(decodedToken.id)
				
				if (user && user['monoId']){
					monoBalance = await Balance.findOne({ monoId:user.monoId })
				}

				res.locals.reauth = null;				
				res.locals.data = {
					user,
					monoBalance,
					publicKey: process.env['MONO_PUBLIC_KEY'],
					secretKey: process.env['MONO_SECRET_KEY']
				}
				
				next();
			}
		});
	}else{
		res.locals.data = null;
		res.locals.reauth = null;
		next();
	}
}

const verifyWebhook = (req, res, next) => {
    if (req.headers['mono-webhook-secret'] !== secret) {
        return res.status(401).json({
            message: "Unauthorized request."
        });
    }

    next();
}

const requireMonoReauthToken = async ( req, res, next) => {
	if (res.locals.data.user.monoStatus) {
		const reauthoriseToken = await reauthorise(res.locals.data.user.monoId)

		const query = {
			monoId: res.locals.data.user.monoId
		};
	
		const result = {
			$set: {
				monoReauthToken: reauthoriseToken,
			}
		}
	
		await User.updateOne(query, result, {new: true}, function(err, res) {});

		// res.locals.reauth = reauthoriseToken
		res.redirect('/monoReauth');
	}else{
		next();
	}
}

module.exports = { requireAuth, checkUser, verifyWebhook, requireMonoReauthToken };