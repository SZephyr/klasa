const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Message', 'TextChannel', 'DMChannel', 'GroupDMChannel']);
	}

	extend(content, options) {
		if (!this.channel) return this.send(content, options);
		const commandMessage = this.client.commandMessages.get(this.id);
		if (commandMessage && (!options || !('files' in options))) return commandMessage.response.edit(content, options);
		return this.channel.send(content, options)
			.then((mes) => {
				if (mes.constructor.name === 'Message' && (!options || !('files' in options))) this.client.commandMessages.set(this.id, { trigger: this, response: mes });
				return mes;
			});
	}

};
