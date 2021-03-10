const User = require('../models/User');
const Balance = require('../models/Balance');
const jwt = require('jsonwebtoken');

// JWT and Cookie expiry
const maxAge = 3*24*60*60;

// handle errors
const handleErrors = (err) => {
	let errors = { email: '', password: '' };

	// handle login errors
	if (err.message === 'incorrect email') {
		errors.email ="This email is not registered"
	}

	if (err.message === 'incorrect password') {
		errors.password ="Wrong password"
	}

	// duplicate error code
	if (err.code === 11000) {
		errors.email = "Email is already taken.";
		return errors;
	}

	// validation errors
	if (err.message.includes('user validation failed')) {
		Object.values(err.errors).forEach(({properties}) => {
			errors[properties.path] = properties.message;
		})
	}
	return errors;	
}

const createToken = (id) =>{
	return jwt.sign({ id }, process.env['TOKEN'], {
		expiresIn: maxAge
	});
}

module.exports.signup_get = (req,res) => {
	res.render('signup');
}

module.exports.login_get = (req,res) => {
	res.render('login');
}

module.exports.signup_post = async (req,res) => {
	const { email, password } = req.body;

	try{
		const user = await User.create({email, password});
		const token = createToken(user._id);
		res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
		// res.status(201).json(user);
		res.status(201).json({user: user._id});
	}
	catch(err){
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
}

module.exports.login_post = async (req,res) => {
	const { email, password } = req.body;
	
	try{
		const user = await User.login(email,password);
		const token = createToken(user._id);
		res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
		res.status(200).json({ user: user._id })
	}
	catch (err){
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
}

module.exports.logout_get = (req, res) => {
	res.cookie('jwt', '', { maxAge: 1 });
	res.redirect('/');
}