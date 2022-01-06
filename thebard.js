const Discord = require('discord.js');

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


let joinAudioChan = function(message){
	// Join audio channel
	let chan = null;
	if(message.member.voice.channel){
		chan = message.member.voice.channel;
	}
	else{
		chan = message.guild.channels.cache.filter(function (channel) { return channel.type === 'voice' }).first();
	}
	return chan.join();
	
};

/**
 * Handle Stream audio
 */
bot.on('message', message => {
	if (message.content.startsWith('!sing')) {
		joinAudioChan(message).then(function (connection) {
			connection.play(config.iceCastUrl);
			message.channel.send('playing time!')
		});
	}
	
	if (message.content.startsWith('!song')) {
		let activity = message.content.replace("!song ","");
		console.log("Set status to", activity);
		bot.user.setActivity(activity,{
			type: 'LISTENING'
		});
	}
	
	if (message.content.startsWith('!reset')) {
		message.channel.send("I'll be back...");
		message.guild.me.voice.channel.leave();
		
		setTimeout(()=>{
			console.log("I'll try to connect again...");
			joinAudioChan(message).then(function (connection) {
				connection.play(config.iceCastUrl);
				message.channel.send('playing time again!')
			});
		},2000)
	
		
	
		

	}
});




