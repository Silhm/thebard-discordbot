const Discord = require('discord.js');
const Canvas = require('canvas');

const bot = new Discord.Client();

bot.on('ready', function () {
	console.log("Je suis connecté !");
/*  bot.user.setAvatar("./assets/bard2.png")
    .then(() => console.log("avatar OK"))
    .catch(console.error)
  */
});

bot.login('Njk4OTI2NDYyNDQ2NjAwMjMy.XpM-DQ.j-DnV5XT7I7nwC7ny6U6VPdf9QE');

bot.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong !')
  }
});

/*bot.on('guildMemberAdd', member => {
  member.createDM().then(channel => {
    return channel.send('Bienvenue sur mon serveur ' + member.displayName)
  }).catch(console.error)
  // On pourrait catch l'erreur autrement ici (l'utilisateur a peut être désactivé les MP)
})
*/


bot.on('message', message => {

  if (message.content.startsWith('!play')) {
		// On récupère les arguments de la commande
		let args = message.content.split(' ');
		// On rejoint le channel audio
		const voiceChannel = message.member.voice.channel.join()
			.then(function (connection) {
				// From a path
				//connection.play('audio.mp3');
				// From a ReadableStream
				//connection.play(fs.createReadStream('audio.mp3'));
				// From a URL
				connection.play('http://10.0.0.42:8000/thebard.ogg');
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




bot.on('message', async message => {
  if (message.content === '/r initiative') {

		const channel = message.channel;
		if (!channel) return;

		const canvas = Canvas.createCanvas(500, 110);
		const ctx = canvas.getContext('2d');

		//const background = await Canvas.loadImage('./bg-parchemin.jpg');
		//ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		//ctx.strokeStyle = '#74037b';
		//ctx.strokeRect(0, 0, canvas.width, canvas.height);

		// Slightly smaller text placed above the member's display name
		ctx.font = '28px sans-serif';
		ctx.fillStyle = '#ffffff';

		// Add an exclamation point here and below
		ctx.font = applyText(canvas, `${message.member.displayName}`);
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`${message.member.displayName}`, canvas.width / 2.5, canvas.height / 1.8);

		let initiative = Math.floor(20*Math.random())+1;

		const avatar = await Canvas.loadImage('./dice/d20.png');
		ctx.drawImage(avatar, 5, 5, 100, 100);
				ctx.font = '19px sans-serif';
				ctx.textAlign = "center"
		ctx.fillText(`${initiative}`, 56, canvas.height / 1.75);

		const attachment = new Discord.MessageAttachment(canvas.toBuffer(), './assets/bard.png');
		channel.send(`Initiative pour ${message.member}: ${initiative}`, attachment);
		console.log(`${message.member.displayName} has rolled for initiative: ${initiative}`);
	}
	else if(message.content.match(/\/r \d \d/g)){
		const channel = message.channel;
		if (!channel) return;

		let reg = /\/r (\d) (\d)/g;
		let match = reg.exec(message.content);

		let atkNumber = parseInt(match[1], 10);
		let defNumber = parseInt(match[2], 10);

		let atkArray = Array.from({ length: atkNumber }, (_, i) => Math.floor(6*Math.random())+1);
		let defArray = Array.from({ length: defNumber }, (_, i) => Math.floor(6*Math.random())+1);

		channel.send(`Jet pour ${message.member}: ${atkArray} / ${defArray}`);


	}


});
