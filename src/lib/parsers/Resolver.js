const url = require('url');
const { Message, User, GuildMember, Role, Guild, Channel } = require('discord.js');

/**
 * The base resolver class
 */
class Resolver {

	/**
	 * @param {KlasaClient} client The Klasa Client
	 */
	constructor(client) {
		/**
		 * The Klasa Client
		 * @type {KlasaClient}
		 */
		Object.defineProperty(this, 'client', { value: client });
	}

	/**
	 * Fetch a Message object by its Snowflake or instanceof Message.
	 * @param {Snowflake} message The message snowflake to validate.
	 * @param {Channel} channel The Channel object in which the message can be found.
	 * @returns {?external:Message}
	 */
	async msg(message, channel) {
		if (message instanceof Message) return message;
		return this.constructor.regex.snowflake.test(message) ? channel.fetchMessage(message).catch(() => null) : undefined;
	}

	/**
	 * Resolve a User object by its instance of User, GuildMember, or by its Snowflake.
	 * @param {User} user The user to validate.
	 * @returns {?external:User}
	 */
	async user(user) {
		if (user instanceof User) return user;
		if (user instanceof GuildMember) return user.user;
		if (typeof user === 'string' && this.constructor.regex.userOrMember.test(user)) {
			return this.client.user.bot ?
				this.client.fetchUser(this.constructor.regex.userOrMember.exec(user)[1]).catch(() => null) :
				this.client.users.get(this.constructor.regex.userOrMember.exec(user)[1]);
		}
		return null;
	}

	/**
	 * Resolve a GuildMember object by its instance of GuildMember, User, or by its Snowflake.
	 * @param {(GuildMember|User|Snowflake)} member The number to validate.
	 * @param {Guild} guild The Guild object in which the member can be found.
	 * @returns {?external:GuildMember}
	 */
	async member(member, guild) {
		if (member instanceof GuildMember) return member;
		if (member instanceof User) return guild.fetchMember(member);
		if (typeof member === 'string' && this.constructor.regex.userOrMember.test(member)) {
			const user = this.client.user.bot ?
				await this.client.fetchUser(this.constructor.regex.userOrMember.exec(member)[1]).catch(() => null) :
				this.client.users.get(this.constructor.regex.userOrMember.exec(member)[1]);
			if (user) return guild.fetchMember(user).catch(() => null);
		}
		return null;
	}

	/**
	 * Resolve a Channel object by its instance of Channel, or by its Snowflake.
	 * @param {(Channel|Snowflake)} channel The channel to validate.
	 * @returns {?external:Channel}
	 */
	async channel(channel) {
		if (channel instanceof Channel) return channel;
		if (typeof channel === 'string' && this.constructor.regex.channel.test(channel)) return this.client.channels.get(this.constructor.regex.channel.exec(channel)[1]);
		return null;
	}

	/**
	 * Resolve a Guild object by its instance of Guild, or by its Snowflake.
	 * @param {(Guild|Snowflake)} guild The guild to validate/find.
	 * @returns {?external:Guild}
	 */
	async guild(guild) {
		if (guild instanceof Guild) return guild;
		if (typeof guild === 'string' && this.constructor.regex.snowflake.test(guild)) return this.client.guilds.get(guild);
		return null;
	}

	/**
	 * Resolve a Role object by its instance of Role, or by its Snowflake.
	 * @param {(Role|Snowflake)} role The role to validate/find.
	 * @param {Guild} guild The Guild object in which the role can be found.
	 * @returns {?external:Role}
	 */
	async role(role, guild) {
		if (role instanceof Role) return role;
		if (typeof role === 'string' && this.constructor.regex.role.test(role)) return guild.roles.get(this.constructor.regex.role.exec(role)[1]);
		return null;
	}

	/**
	 * Resolve a Boolean instance.
	 * @param {(boolean|string)} bool The boolean to validate.
	 * @returns {?boolean}
	 */
	async boolean(bool) {
		if (bool instanceof Boolean) return bool;
		if (['1', 'true', '+', 't', 'yes', 'y'].includes(String(bool).toLowerCase())) return true;
		if (['0', 'false', '-', 'f', 'no', 'n'].includes(String(bool).toLowerCase())) return false;
		return null;
	}

	/**
	 * Resolve a String instance.
	 * @param {string} string The string to validate.
	 * @returns {?string}
	 */
	async string(string) {
		return String(string);
	}

	/**
	 * Resolve an Integer.
	 * @param {(string|number)} integer The integer to validate.
	 * @returns {?number}
	 */
	async integer(integer) {
		integer = parseInt(integer);
		if (Number.isInteger(integer)) return integer;
		return null;
	}

	/**
	 * Resolve a Float.
	 * @param {(string|number)} number The float to validate.
	 * @returns {?number}
	 */
	async float(number) {
		number = parseFloat(number);
		if (!isNaN(number)) return number;
		return null;
	}

	/**
	 * Resolve a hyperlink.
	 * @param {string} hyperlink The hyperlink to validate.
	 * @returns {?string}
	 */
	async url(hyperlink) {
		const res = url.parse(hyperlink);
		if (res.protocol && res.hostname) return hyperlink;
		return null;
	}

}

/**
 * Standard regular expressions for matching mentions and snowflake ids
 * @type {Object}
 * @property {RegExp} userOrMember Regex for users or members
 * @property {RegExp} channel Regex for channels
 * @property {RegExp} role Regex for roles
 * @property {RegExp} snowflake Regex for simple snowflake ids
 */
Resolver.regex = {
	userOrMember: new RegExp('^(?:<@!?)?(\\d{17,19})>?$'),
	channel: new RegExp('^(?:<#)?(\\d{17,19})>?$'),
	role: new RegExp('^(?:<@&)?(\\d{17,19})>?$'),
	snowflake: new RegExp('^(\\d{17,19})$')
};

module.exports = Resolver;
