const fetch = require('node-fetch');

const isDataAvailable = async (id) => {
	const response = await fetch(`https://api.withmono.com/accounts/${id}`, { 
		method: 'GET', 
		headers: {
			'Content-Type': 'application/json',
			'mono-sec-key': process.env['MONO_SECRET_KEY']
		}
	});
	const data = await response.json();
	if (data.meta && data.meta.data_status == "AVAILABLE") {
		return true
	}return false
}

module.exports = { isDataAvailable };