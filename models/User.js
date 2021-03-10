const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');


// Create Schema
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Please enter an email'],
		unique: true,
		lowercase: true,
		// validate: [(val) => {}, 'Please enter a valid email']
		validate: [isEmail, 'Please enter a valid email']
	},
	password: {
		type: String,
		required: [true, 'Please enter a password'],
		minlength: [6, 'Minimum password length is 6 characters']
	},
	monoId: {
		type: String,
		default: ''
	},
	monoCode: {
		type: String,
		default: ''
	},
	monoStatus: {
		type: Boolean,
		default: false
	},
	monoReauthToken: {
		type: String,
		default: ''
	},
});


// fire a function after doc saved to db
// userSchema.post('save', function(doc, next) {
// 	console.log('new user was C & S', doc);
// 	next();
// });

// fire a function after doc saved to db
userSchema.pre('save', async function(next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	// console.log('user about to be created', this);
	next();
});

// Static method to login user
userSchema.statics.login = async function(email, password) {
	const user = await this.findOne({ email });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error('incorrect password');
	}
	throw Error('incorrect email');
}


const User = mongoose.model('user', userSchema);

module.exports = User;