const fetch = require('node-fetch');
const User = require('../models/User');
const Balance = require('../models/Balance');
const WebH = require('../models/Webhook');
const {isDataAvailable} = require('../controllers/helper');

module.exports.dashboard = async (req,res, next) => {

	if(res.locals.data.user.monoId){

		const url = `https://api.withmono.com/accounts/${res.locals.data.user.monoId}/identity`

		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY']
			}
		});

		const data = await response.json();
		res.locals.dashboard = data;

		next();
	}else{
		next();
	}

}

module.exports.dashboardPost = async (req,res, next) => {
	// Retrieve code and user id from front end
	const { code, id } = req.body;

	url = "https://api.withmono.com/account/auth";

	if(code){
		// Retrieve mono id from front end
		const response = await fetch(url, { 
			method: 'POST',
			body: JSON.stringify({ code }),
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY']
			}
		}).then(res_ => res_.json())
		  .then(function (res_) {

			const dispatch = {
				$set: {
					monoId: res_.id,
					monoCode: code,
					monoStatus: false
				}
			}
			
			// Update collection with mono id and code
			User.updateOne({_id: id}, dispatch, {new: true}, function(err, res) {});
			// Create instance in our balance collection
			Balance({ monoId: res_.id }).save();
			
			res.status(200).json('done')
		  })  
		  .catch(err => res.status(501).send("Error fetching id"));

		  
	}else{
		res.status(500).json({ error: "Error somewhere" })
	}


	
	// next();
}


module.exports.balances = async (req,res, next) => {
	if(res.locals.data.user.monoId){
		const url = `https://api.withmono.com/accounts/${res.locals.data.user.monoId}`

		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY']
			}
		});

		const data = await response.json();
		res.locals.balances = data;
		next();
	}
	else{
		res.locals.balances = ""
		next();
	}
}

module.exports.transactions = async (req,res, next) => {
	if(res.locals.data.user.monoId){

		if (await isDataAvailable(res.locals.data.user.monoId)) {

			const url = req.query.page || `https://api.withmono.com/accounts/${res.locals.data.user.monoId}/transactions`

			const response = await fetch(url, { 
				method: 'GET', 
				headers: {
					'Content-Type': 'application/json',
					'mono-sec-key': process.env['MONO_SECRET_KEY']
				}
			});

			const data = await response.json();
			res.locals.transactions = data;
			next();
		
		}

		res.locals.transactions = "PROCESSING";
		next()

	}
	else{
		res.locals.transactions = null;
		next();
	}

}

module.exports.alltransactions = async (req,res, next) => {
	
	if(res.locals.data.user.monoId){
		
		// Check if data is still processing
		if (await isDataAvailable(res.locals.data.user.monoId)) {

			let url = `https://api.withmono.com/accounts/${res.locals.data.user.monoId}/transactions`	
			let page = req.query.page || 1
			let finalUrl = url + `?page=${page}`

			const response = await fetch(finalUrl, { 
				method: 'GET', 
				headers: {
					'Content-Type': 'application/json',
					'mono-sec-key': process.env['MONO_SECRET_KEY']
				}
			});

			const data = await response.json();
			res.locals.transactions = data;
			next();			
		}

		res.locals.transactions = "PROCESSING";
		next()

	}
	else{
		res.locals.transactions = null;
		next();
	}

}

module.exports.reauthorise = async function(id){
		let url = `https://api.withmono.com/accounts/${id}/reauthorise`	

		const response = await fetch(url, { 
			method: 'POST', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY']
			}
		});

		const data = await response.json();

		return data.token;
}

// NOTE
// This feature is only available to select partners. Reach out to us on slack about your product feature and why this should be enabled for your business.

// By default, all connected accounts are automatically refreshed once every 24 hours.
// You can contact us at hi@mono.co if you want to change the update frequency to:

// 6h, all connected accounts will be refreshed every 6h (4 times a day)
// 12h, all connected accounts will be refreshed every 12h (2 times a day)

module.exports.webhook = async (req,res, next) => {

	const webhook = req.body;

	if (webhook.event == "mono.events.account_updated") {
		await WebH.create({test: "updated"});

		if (webhook.data.meta.data_status == "AVAILABLE") { // AVAILABLE, PROCESSING, FAILED
			
			const data = webhook.data.account;

			// You can update your records on success

			const query = {
				monoId: data._id
			};

			const result = {
				$set: {
					monoId: data._id,
					institution: data.institution.name, // name:bankCode:type
					name: data.name,
					accountNumber: data.accountNumber,
					type: data.type,
					currency: data.currency,
					balance: data.balance,
					bvn: data.bvn
				}
			}

			await Balance.updateOne(query, result, {new: true}, function(err, res) {});

			await WebH.create({test: "updated___available_id: "+data._id});

			// webhook.data.account
		}
		else if (webhook.data.meta.data_status == "PROCESSING") {
			await WebH.create({test: "updated___processing"});
			// Lol! Just chill and wait
		}
	}

	else if (webhook.event == "mono.events.reauthorisation_required") {
		// webhook.data.account._id

		// You can retrieve your token here for re-authentication
		// reauthorise(webhook.data.account._id)
		const query = {
			monoId: data._id
		};

		const result = {
			$set: {
				monoStatus: true,
			}
		}

		await User.updateOne(query, result, {new: true}, function(err, res) {});

		await WebH.create({test: "reauthorisation_required"});

	}

	else if (webhook.event == "mono.events.account_reauthorized") {
		// webhook.data.account._id

		// Account Id. will be sent on successful reauthorisation. Nothing much to do here.
		await WebH.create({test: "account_reauthorized"});

	}

    return res.sendStatus(200);
	
}

module.exports.manualSync = async (req,res, next) => {

	if(res.locals.data.user.monoId){
		const url = `https://api.withmono.com/accounts/${res.locals.data.user.monoId}/sync`

		// console.log(123412345);

		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY']
			}
		});

		const data = await response.json();

		console.log(data);
		// res.locals.dashboard = data;

		next();
	}else{
		next();
	}

}


module.exports.monoReauth = async (req,res, next) => {

	const query = {
		monoId: req.body.id
	};

	const result = {
		$set: {
			monoStatus: true,
		}
	}

	await User.updateOne(query, result, {new: true}, function(err, res) {});
	
	res.status(201).json({status: "redirect"});
	
}