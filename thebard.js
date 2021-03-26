const Discord = require('discord.js');
const Canvas = require('canvas');

const bot = new Discord.Client();
const config = require('./config/base.json');
const gameSystem = require(`./config/gameSystem/${config.gameSystem}.json`);

const inviteUrl = `https://discordapp.com/oauth2/authorize?client_id=${config.clientId}&scope=bot&permissions=3148800`

bot.on('ready', function () {
	console.log("The Bard entered the Inn and is ready to sing!");
	console.log("Invite him to your table:", inviteUrl);
	console.log("Ask him for a song with: !sing");
	if(config.setAvatar) {
		bot.user.setAvatar("./assets/bard.png")
				.then(() => console.log("avatar loaded"))
				.catch(console.error)
	}
});

bot.login(config.botToken);

if(config.welcomeUser){
	bot.on('guildMemberAdd', member => {
		member.createDM().then(channel => {
			return channel.send('Bienvenue sur mon serveur ' + member.displayName)
		}).catch(console.error)
		// On pourrait catch l'erreur autrement ici (l'utilisateur a peut être désactivé les MP)
	});
}

/**
 * Handle Stream audio
 */
bot.on('message', message => {
  if (message.content.startsWith('!sing')) {
		// Join audio channel
		message.guild.channels.cache.filter(function (channel) { return channel.type === 'voice' }).first().join()
			.then(function (connection) {
				connection.play(config.iceCastUrl);
				message.channel.send('playing time!')
			})
		}
});

// Pass the entire Canvas object because you'll need to access its width, as well its context
const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 50;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};


/**
 * Roll for initiative with command  /r initiative or /r i
 */
bot.on('message', async message => {
  if (message.content === '/r initiative' || message.content === '/r i') {
		const channel = message.channel;
		if (!channel) return;
		const canvas = Canvas.createCanvas(500, 110);
		const ctx = canvas.getContext('2d');

		// Slightly smaller text placed above the member's display name
		ctx.font = '28px sans-serif';
		ctx.fillStyle = '#ffffff';

		// Add an exclamation point here and below
		ctx.font = applyText(canvas, `${message.member.displayName}`);
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`${message.member.displayName}`, canvas.width / 2.5, canvas.height / 1.8);

		let initiative = Math.floor(20*Math.random())+1;

		const avatar = await Canvas.loadImage('./assets/dice/d20.png');
		ctx.drawImage(avatar, 5, 5, 100, 100);
		ctx.font = '19px sans-serif';
		ctx.textAlign = "center";
		ctx.fillText(`${initiative}`, 56, canvas.height / 1.75);

		const attachment = new Discord.MessageAttachment(canvas.toBuffer(), './assets/bard.png');
		channel.send(`Initiative pour ${message.member}: ${initiative}`, attachment);
		console.log(`${message.member.displayName} has rolled for initiative: ${initiative}`);
	}

  // Match a /r <atk> <def>
	else if(message.content.match(/\/r \d \d/g)){
		const channel = message.channel;
		if (!channel) return;

		let reg = /\/r (\d) (\d)/g;
		let match = reg.exec(message.content);

		let atkNumber = parseInt(match[1], 10);
		let defNumber = parseInt(match[2], 10);

		let atkArray = Array.from({ length: atkNumber }, (_, i) => Math.floor(6*Math.random())+1).sort((a, b) => a - b);
		let defArray = Array.from({ length: defNumber }, (_, i) => Math.floor(6*Math.random())+1).sort((a, b) => a - b);


		const canvas = Canvas.createCanvas(650, 110);
		const ctx = canvas.getContext('2d');
		// Slightly smaller text placed above the member's display name
		ctx.font = '28px sans-serif';
		ctx.fillStyle = '#ffffff';

		const atkImg = await Canvas.loadImage('./assets/atk.png');
		const defImg = await Canvas.loadImage('./assets/def.png');
		const divider = await Canvas.loadImage('./assets/divider.png');

		const diceSuccess = await Canvas.loadImage('./assets/dice/d6-success.png');
		const diceFail = await Canvas.loadImage('./assets/dice/d6-fail.png');

		let xOffset = 5;
		let successCount = {atk:0,def:0};

		let resultOffset = xOffset+14;
		ctx.drawImage(atkImg, xOffset, 5, 50, 50);
		ctx.font = '20px sans-serif';


		atkArray.forEach(atkRes => {
			xOffset+=60;
			if( atkRes <= gameSystem.successThreshold){
				ctx.drawImage(diceSuccess, xOffset, 5, 50, 50);
				successCount.atk++;
			}
			else{
				ctx.drawImage(diceFail, xOffset, 5, 50, 50);
			}
			ctx.fillText(`${atkRes}`, xOffset+13, 38);
		});

		xOffset+=60;
		ctx.drawImage(divider, xOffset+25, 5, 3, 50);

		defArray.forEach(defRes => {
			xOffset+=60;
			if( defRes <= gameSystem.successThreshold ){
				ctx.drawImage(diceSuccess, xOffset, 5, 50, 50);
				successCount.def++;
			}
			else{
				ctx.drawImage(diceFail, xOffset, 5, 50, 50);
			}
			ctx.fillText(`${defRes}`, xOffset+13, 38);
		});

		xOffset+=60;
		ctx.drawImage(defImg, xOffset, 5, 50, 50);
		ctx.font = '28px sans-serif';
		ctx.fillText(`${successCount.atk}`, resultOffset, 80);
		ctx.fillText(`${successCount.def}`, xOffset+14, 80);

		const attachment = new Discord.MessageAttachment(canvas.toBuffer(), './assets/bard.png');

		console.log(`Jet pour ${message.member.displayName}: ${atkArray} / ${defArray} || ATK: ${successCount.atk}  DEF: ${successCount.def}`);
		channel.send(`Jet pour ${message.member}:`, attachment);
	}

	// Match a /r quick
	else if(message.content === "/r quick"){
		const channel = message.channel;
		if (!channel) return;

		const canvas = Canvas.createCanvas(650, 110);
		const ctx = canvas.getContext('2d');
		// Slightly smaller text placed above the member's display name
		ctx.font = '28px sans-serif';
		ctx.fillStyle = '#ffffff';

		const quickImg = await Canvas.loadImage('./assets/quick.png');
		const diceSuccess = await Canvas.loadImage('./assets/dice/d6-success.png');
		const diceFail = await Canvas.loadImage('./assets/dice/d6-fail.png');

		let xOffset = 5;
		let successCount = 0;

		ctx.drawImage(quickImg, xOffset, 5, 50, 50);

		let resultOffset = xOffset+14;
		ctx.font = '20px sans-serif';

		let atkArray = Array.from({ length: 6 }, (_, i) => Math.floor(6*Math.random())+1).sort((a, b) => a - b);

		atkArray.forEach(atkRes => {
			xOffset+=60;
			if(atkRes<=gameSystem.successThreshold){
				ctx.drawImage(diceSuccess, xOffset, 5, 50, 50);
				successCount++;
			}
			else{
				ctx.drawImage(diceFail, xOffset, 5, 50, 50);
			}
			ctx.fillText(`${atkRes}`, xOffset+13, 38);
		});

		ctx.font = '28px sans-serif';
		ctx.fillText(`${successCount}`, resultOffset, 80);

		const attachment = new Discord.MessageAttachment(canvas.toBuffer(), './assets/bard.png');

		console.log(`Réussite éclair pour ${message.member.displayName}: ${atkArray}  || SUCCESS: ${successCount}`);
		channel.send(`Réussite éclair pour ${message.member}:`, attachment);
	}

});
