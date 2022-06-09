const mailer = require('nodejs-nodemailer-outlook');
const crypto = require('crypto');
require('dotenv').config();

const useMailAuth = () => {
	const user = process.env.OUTLOOK_ADDRESS;
	const pass = process.env.OUTLOOK_PASSWD;
	if (!user || !pass) throw new Error ('outlook data can not be null!');
	return [user, pass];
}

const generateCode = () => {
	const code = `${crypto.randomInt(1, 999999)}`;
	const fill = '000000';
	return fill.substr(code.length, 6) + code;
}

const htmlPattern = (name, code) => {
	return `
		<div style= "box-sizing: border-box; width: 100%; padding: 14px; background-color: #fff;">
			<div style= "box-sizing: border-box; width: 95%; min-height: 400px; padding: 21px; margin: auto; background-color: #f9f9f9; box-shadow: 0px 0px 14px #b0b0b0; border-radius: 5px;">
				<h1 style= "font-family: sans-serif; color: #2793f2;">Skytacts is here!</h1>
				<p style= "font-size: 14px;">
					<p style= "margin: 2px 0 6px 0; font-family: monospace; font-size: 14px;">Hey, ${name}!</p>
					<p style= "margin: 2px 0; padding: 0; font-family: monospace; font-size: 14px;">
						<span>You seem to have needed a confirmation code?</span>
					</p>
					<p style= "margin: 2px 0; padding: 0; font-family: monospace; font-size: 14px;">
						<span>Okey, voila:</span>
					</p>
				</p>
				<h1 style= "font-family: sans-serif;">${code}</h1>
				<p>
					<b style= "font-family: monospace; color: #b0b0b0; font-size: 14px;">
						If you did not, please ignore this email. 
					</b>
				</p>
				
			</div>
		</div>
	`;
}

const deliverCode = (mail) => {
	//check mail
	if (!mail) throw new Error ('mail can not be null!');
	//get user data
	const [user, pass] = useMailAuth();
	//get html pattern
	const code = generateCode();
	const [name] = mail.split('@');
	if (!name) throw new Error ('incorrect email address!');
	const html = htmlPattern(name, code);
	//return promise
	return new Promise((resolve, reject) => {
		//create signals
		const onError = err => reject(err);
		const onSuccess = i => resolve(code);
		//send mail with props
		mailer.sendEmail({
			auth: {
				user,
				pass,
			},
			from: user,
			to: mail,
			subject: "OTP code",
			html,
			onError: onError,
			onSuccess: onSuccess,
		});
	});
}
module.exports = deliverCode;
