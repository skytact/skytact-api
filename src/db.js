const mongoose = require('mongoose');

module.exports = {
	connect: DB_HOST => {
		//
		mongoose.connect(DB_HOST)
			.then(()=>{
				console.log('okey');
			})
			.catch((err)=> {
				console.log('not okey');
				process.exit();
			});
	},
	close: () => {
		mongoose.connection.close();
	}
}
