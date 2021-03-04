  const superagent = require('superagent');
  const Discord = require('discord.js');
  const xml2js = require('xml2js');
  const fileSystem = require('fs');
  const Statcord = require('statcord.js');
  const Jimp = require('jimp');
  const ignoredStuff = JSON.parse(fileSystem.readFileSync('ignoredStuff.json'))
  const client = new Discord.Client();
  const bot = client;

  const statcord = new Statcord.Client({
  client,
  key: "",
  postCpuStatistics: true, 
  postMemStatistics: true, 
  postNetworkStatistics: true,
  });

  client.on("ready", async () => {
  console.log("ready");

  statcord.autopost();
  });

  statcord.on("post", status => {
  if (!status) console.log("Successful post");
  else console.error(status);
  });
  client.login('')

  async function GetE621Images(tags = "", limit = "1", order = "random", nsfw = false) {

  var domain = ""
  if (nsfw) {
  domain = 'e621.net'
  }
  else {
  domain = 'e926.net'
  }

  tags = tags.trim().replace(' ', '+').toLowerCase()
  tags = tags +
  "+order:" + order
  "+hi_res"

  let webRequest = `https://${domain}/posts.json?tags=${tags}&limit=${limit}`
  let { body } = await superagent.get(webRequest).set('User-Agent', 'DiscordTestBot')

  return body.posts
  }

  function IsIgnored(msg, command = null) {
  if (msg.channel.type != "text")
  return false

  if (msg.member.hasPermission("MANAGE_MESSAGES"))
  return false

  var serverId = msg.guild.id

  if (!ignoredStuff[serverId])
  return false

  if (ignoredStuff[serverId].channels.includes(msg.channel.id))
  return [true, "This channel is currently being ignored"]

  if (ignoredStuff[serverId].users.includes(msg.author.id))
  return [true, "You are not allowed to use me"]

  if (ignoredStuff[serverId].commands.includes(command))
  return [true, "This command isn't allowed in this channel"]

  return false
  }

  Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)]
  }

  var allCategories = PopulateCategoriesVar()
  function PopulateCategoriesVar() {
  let categories = []
  for (var cmd in commandList) {
  categories.push(cmd.category)
  }
  return categories
  }

  var categoryUsage = {
  "moderation": "Commands to moderate the server!",
  "images": "These commands allow for image mirroring and image manipulation!",
  "bombs": "Shows up to 5 images depending on what command you use!",
  "emotions": "Let them know how you feel!",
  "actions": "Do some stuff, I guess.",
  "server": "Server-related things!",
  "misc": "Miscellaneous commands!"
  }

  var commandList = {

"help": {
  description: "Displays this menu!",
  usage: "$help  or  $help {command}",
  category: "misc",
  process: async function(msg, parameters) {
  var embed = new Discord.MessageEmbed().setColor("#06FBFE")

  if (parameters) {
  var getPageNumber = parameters.replace(/\D+/g, '').trim()
  if (!getPageNumber)
  getPageNumber = 1
  parameters = parameters.replace(/\d+/g, '').trim()
  if (categoryUsage[parameters]) {
  let capitalizeCategoryName = parameters.charAt(0).toUpperCase() + parameters.slice(1)
  embed
  .setTitle(capitalizeCategoryName)
  .setDescription("Use `$commandName` to issue a command or do `$help {category} {page}` to change pages!")

  var fieldLimit = 6

  var fieldRangeMax = fieldLimit * getPageNumber
  var fieldRangeMin = fieldRangeMax - fieldLimit
  var fieldCount = 0
  for (var cmd in commandList) {

  let command = commandList[cmd]
  if (command.category === parameters) {
  fieldCount++
  if (fieldCount <= fieldRangeMin)
  continue
  if (fieldCount > fieldRangeMax)
  continue

  if (command.description)
  embed.addField(cmd, command.description, true)
  else
  embed.addField(cmd, "--", false)
  }
  }
  var maxPages = Math.ceil(fieldCount / fieldLimit)
  embed.setFooter(`Showing page  ${getPageNumber}  of  ${maxPages}`)

  if (embed.fields.length == 0)
  msg.channel.send(`No results found on that page!\nMax page count for  **${capitalizeCategoryName}**  is  **${maxPages}**`)
  else
  msg.channel.send(embed)
  }

  else if (commandList[parameters]) {
  msg.channel.send(`**$${parameters}** - **\`${commandList[parameters].usage}\`**\n${commandList[parameters].description}`)
  }
  else {
  msg.channel.send("Couldn't find that command, or category!  Use `$help` for a list!")
  }
  }
  else {
  embed
  .setTitle("Categories")
  .setFooter("Created by: Dusk#4396")
  .setDescription("Use `$help <category name>` to show commands for that category!")
  let helpMessageBody = ""
  for (var category in categoryUsage) {
  embed.addField(category, categoryUsage[category], true)
  }

  msg.channel.send(embed)
  }
  }
  },

"avatar": {
  description: "Shows the avatar of the chosen user!",
  usage: "$avatar",
  category: "actions",
  process: async function(msg, parameters) {
  let mentionedUser = msg.mentions.users.first()

  if (mentionedUser) {
  msg.channel.send(`This is **${mentionedUser}**'s current avatar:`)
  msg.channel.send(mentionedUser.displayAvatarURL({ dynamic: true }))
  }
  else {
  msg.channel.send("This is your current avatar:")
  msg.channel.send(msg.author.displayAvatarURL({ dynamic: true }))
  }
  }
  },

"yesorno": {
  description: "For when you can't decide.",
  usage: "`$yesorno`",
  category: "actions",
  process: async function(msg, parameters) {

  let responses = [
  "Yes",
  "No"
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  msg.channel.send(`${randomResponse}`)
  return
  }
  },

"options": {
  description: "For when you can't decide!",
  usage: "`$options {2 options, split by 'or'}`",
  category: "actions",
  process: async function(msg, parameters) {


  let parameters1 = parameters.split("or")

  if (parameters) {

  let responses = [
  `${parameters1[0]}`,
  `${parameters1[1]}`,
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  msg.channel.send(`${randomResponse}`)
  }

  }
  },

"rp": {
  description: "C-can i join?",
  usage: "`$rp`",
  category: "actions",
  process: async function(msg, parameters) {

  msg.channel.send(`**${msg.author.username}** is looking for an RP partner!`)

  }
  },

"cuddle": {
  description: "Give someone the good cuddles!",
  usage: "$cuddle {users}",
  category: "actions",
  process: async function(msg, parameters) {
  let images = await GetE621Images("+score:>10+hug+hugging+rating:s+duo+-mlp+-my_little_pony", 1, "random", msg.channel.nsfw)

  let users = msg.mentions.users.map((user) => user.username).join(', ')

  if (users === msg.author) {
  msg.channel.send(`**${msg.author.username}** cuddles themselves! :3`)
  return
  }

  if (!parameters) {
  msg.channel.send(`**${msg.author.username}** cuddles themselves! :3`)
  return
  }

  if (users) {
  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE") 
  .setDescription(`**${msg.author.username}** cuddles **${users}**`)
  .setImage(images[0].file.url)
  .setFooter("Issue loading an image? Try the command again! It was most likely on e621's behalf!")
  msg.channel.send(embed1)
  }
  else {
  msg.channel.send(`**${msg.author.username}** cuddles themselves! :3`)
  }
  }
  },

"pet": {
  description: "Give someone the good pets!",
  usage: "$pet {users}",
  category: "actions",
  process: async function(msg, parameters) {
  let images = await GetE621Images("+score:>10+petting+rating:s+duo+-mlp+-my_little_pony", 1, "random", msg.channel.nsfw)

  let users = msg.mentions.users.map((user) => user.username).join(', ')

  if (users === msg.author) {
  msg.channel.send(`**${msg.author.username}** pets themselves! :3`)
  return
  }

  if (!parameters) {
  msg.channel.send(`**${msg.author.username}** pets themselves! :3`)
  return
  }

  if (users) {
  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE") 
  .setDescription(`**${msg.author.username}** pets **${users}**`)
  .setImage(images[0].file.url)
  .setFooter("Issue loading an image? Try the command again! It was most likely on e621's behalf!")
  msg.channel.send(embed1)
  }
  else {
  msg.channel.send(`**${msg.author.username}** pets themselves! :3`)
  }
  }
  },

"lick": {
  description: "Give someone the good licc",
  usage: "$lick {users}",
  category: "actions",
  process: async function(msg, parameters) {
  let images = await GetE621Images("+score:>10+rating:s+duo+lick", 1, "random", msg.channel.nsfw)

  let users = msg.mentions.users.map((user) => user.username).join(', ')

  if (users === msg.author) {
  msg.channel.send(`**${msg.author.username}** cuddles themselves! :3`)
  return
  }

  if (!parameters) {
  msg.channel.send(`**${msg.author.username}** cuddles themselves! :3`)
  return
  }

  if (users) {
  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE") 
  .setDescription(`**${msg.author.username}** licks **${users}**`)
  .setImage(images[0].file.url)
  .setFooter("Issue loading an image? Try the command again! It was most likely on e621's behalf!")
  msg.channel.send(embed1)
  }
  else {
  msg.channel.send(`**${msg.author.username}** cuddles themselves! :3`)
  }
  }
  },

"sad": {
  description: "Show someone that you're sad.",
  usage: "`$sad`",
  category: "actions",
  process: async function(msg, parameters) {
  msg.channel.send(`**${msg.author.username}** is big saed. ;w;`)
  }
  },

"flop": {
  description: "Flop on da ground!",
  usage: "`$flop`",
  category: "actions",
  process: async function(msg, parameters) {
  msg.channel.send(`**${msg.author.username}** flops onto the ground and vibes.`)
  }
  },

"hug": {
  description: "Huggies!",
  usage: "`$hug {user}`",
  category: "actions",
  process: async function(msg, parameters) {
  let images = await GetE621Images("+score:>10+hug+hugging+rating:s", 1, "random", msg.channel.nsfw)

  let mentionedUser = msg.mentions.users.map((user) => user.username).join(', ')

  if (msg.author === mentionedUser) {
  msg.channel.send(`**${msg.author.username}** hugs themselves. Aww!`)
  return
  }

  if (!parameters) {

  let messages = [
  `**${msg.author.username}** hugs themselves. Aww!`,
  ]

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  msg.channel.send(`${randomMessage}`)
  return
  }

  let responses = [
  `**${msg.author.username}** tackle hugs **${mentionedUser}**`,
  `**${msg.author.username}** glomps **${mentionedUser}**`,
  `**${msg.author.username}** hugs **${mentionedUser}**`,
  `**${msg.author.username}** gives **${mentionedUser}** all the huggies!`,
  `**${msg.author.username}** snuggles **${mentionedUser}**`,
  `**${msg.author.username}** cuddles **${mentionedUser}**`,
  `**${msg.author.username}** pounces on **${mentionedUser}** and hugs them tightly`,
  `**${msg.author.username}** bear hugs **${mentionedUser}**`,
  `**${msg.author.username}** jumps on **${mentionedUser}**'s back and hugs them`,
  `**${msg.author.username}** pounces on **${mentionedUser}** and hugs them!`,
  `**${msg.author.username}** jumps on **${mentionedUser}** and snuggles them!`,
  `**${msg.author.username}** wraps **${mentionedUser}** in a big hug and squeezes tightly!`,
  `**${msg.author.username}** blushes a bit as they hug **${mentionedUser}**!`,
  `**${mentionedUser}** is hugged by **${msg.author.username}**!`
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE") 
  .setDescription(randomResponse)
  .setImage(images[0])

  msg.channel.send(embed1)

  if (msg.author === mentionedUser) {
  msg.channel.send(`**${msg.author.username}** hugs themselves. Aww!`)
  return
  }

  }
  },

"headpat": {
  description: "*headpats*",
  usage: "`$headpat {User}`",
  category: "actions",
  process: async function(msg, parameters) {

  let images = await GetE621Images("+petting+rating:s", 1, "random", msg.channel.nsfw)

  let mentionedUser = msg.mentions.users.map((user) => user.username).join(', ')

  if (parameters) {
  var embed1 = new Discord.MessageEmbed()
  .setColor("#06FBFE")
  .setImage(images[0].file.url)
  .setDescription(`**${msg.author.username}** headpats **${mentionedUser}**`)
  .setFooter("Issue loading an image? Try the command again! It was most likely on e621's behalf!")
  msg.channel.send(embed1)
  return
  }
  if (!mentionedUser) {
  msg.channel.send(`**${msg.author.username}** Gives themselves a headpat. Aww`)
  superagent
  .get('https://some-random-api.ml/animu/pat')
  .then(res => {
  msg.channel.send(res.body.link)
  });
  return
  }
  }
  },

"me": {
  description: "Displays your userinfo",
  usage: "`$me`",
  category: "actions",
  process: async function(msg, parameters) {

  let user = msg.author

  if (!parameters) {
  const embed1 = new Discord.MessageEmbed()
  .setColor("#06FBFE")
  .setDescription(`Your username: ${user.username}\nYour ID: ${user.id}\nYour Avatar:`)
  .setImage(user.displayAvatarURL({ dynamic: true }))
  msg.channel.send(embed1)
  }

  if (parameters) {
  msg.channel.send("Oi! Use `$user` to get info on someone else!")
  return
  }
  }
  },

"mem": {
  description: "Displays your userinfo",
  usage: "`$me`",
  category: "actions",
  process: async function(msg, parameters) {
  msg.channel.send(`${process.memoryUsage().heapUsed / 1024 / 1024}`)
  }
  },

"frenchkiss": {
  description: "Give someone a __***real***__ good smooch!",
  usage: "`$frenchkiss {user}`",
  category: "actions",
  process: async function(msg, parameters) {

  let mentionedUser = msg.mentions.users.first()

  if (mentionedUser === msg.author) {
  msg.channel.send(`***${msg.author.username}** kisses... themselves? ~~Impressive.~~`)
  return
  }

  if (!mentionedUser) {
  msg.channel.send("Oi! You gotta actually ping a member!")
  return
  }

  if (parameters) {
  let images = await GetE621Images("+french_kiss+rating:s", 1, "random", msg.channel.nsfw)
  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE")
  .setImage(images[0].file.url)
  .setDescription(`**${msg.author.username}** frenchkisses **${mentionedUser}**. ~~Kinda gross ngl~~`)
  .setFooter("Issue loading an image? Try the command again! It was most likely on e621's behalf!")
  msg.channel.send(embed1)
  }

  if (!parameters) {
  msg.channel.send("Please give me a user to kiss! :3")
  return
  }
  }
  },

"kiss": {
  description: "Give someone a good smooch!",
  usage: "`$kiss {user}`",
  category: "actions",
  process: async function(msg, parameters) {
  let mentionedUser = msg.mentions.users.first()

  if (!parameters) {
  msg.channel.send("Please give me a user to kiss! :3")
  return
  }

  if (!mentionedUser) {
  msg.channel.send("Oi! You gotta actually ping a member!")
  return
  }

  if (mentionedUser === msg.author) {
  msg.channel.send(`***${msg.author.username}** kisses... themselves?* ~~Impressive.~~`)
  return
  }

  if (parameters) {
  let images = await GetE621Images("+kiss+kissing+rating:s", 1, "random", msg.channel.nsfw)

  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE")
  .setImage(images[0].file.url)
  .setDescription(`**${msg.author.username}** kisses **${mentionedUser}**`)
  .setFooter("Issue loading an image? Try the command again! It was most likely on e621's behalf!")
  msg.channel.send(embed1)
  }
  }
  },

"dropkick": {
  description: "Dropkick someone!",
  usage: "`$dropkick {user}`",
  category: "actions",
  process: async function(msg, parameters) {

  let mentionedUser = msg.mentions.users.first()

  if (mentionedUser === msg.author) {
  msg.channel.send(`***${msg.author.username}** dropkicks... themselves?* ~~Impressive.~~`)
  return
  }

  if (!mentionedUser) {
  msg.channel.send("Oi! You gotta actually ping a member!")
  return
  }

  if (parameters) {
  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE")
  .setImage("https://media1.tenor.com/images/6d596e108829d9239d4ee232166e8778/tenor.gif?itemid=11327017")
  .setDescription(`**${msg.author.username}** dropkicks **${mentionedUser}**!`)
  msg.channel.send(embed1)
  }

  if (!parameters) {
  msg.channel.send("Please give me a user to dropkick! >:3")
  return
  }
  }
  },

"marry": {
  description: "Marry someone!",
  usage: "`$marry {user}`",
  category: "actions",
  process: async function(msg, parameters) {

  let mentionedUser = msg.mentions.users.first()

  if (mentionedUser === msg.author) {
  msg.channel.send(`***${msg.author.username}** marries... themselves?*`)
  return
  }

  if (!mentionedUser) {
  msg.channel.send("Oi! You gotta actually ping a member!")
  return
  }

  if (parameters) {
  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE")
  .setImage("https://media.tenor.com/images/fc01f0ca94b19de216eeecca3dbd0ccd/tenor.gif")
  .setDescription(`I now pronounce **${msg.author.username}** and **${mentionedUser}** married!`)
  msg.channel.send(embed1)
  }

  if (!parameters) {
  msg.channel.send("Please give me the user you wanna get married to! >:3")
  return
  }
  }
  },

"whois": {
  description: "Displays another users information.",
  usage: "`$whois {user}`",
  category: "actions",
  process: async function(msg, parameters) {
  let mentionedUser = msg.mentions.users.first()

  if (mentionedUser === msg.author) {
  msg.channel.send("Use `$me` for info on yourself!")
  return
  }

  if (parameters) {
  const embed1 = new Discord.MessageEmbed()
  .setColor("#06FBFE")
  .setDescription(`Username: ${mentionedUser}\nID: ${mentionedUser.id}\nAvatar:`)
  .setImage(mentionedUser.displayAvatarURL({ dynamic: true }))
  msg.channel.send(embed1)
  .setFooter(`Comamnd run by: **${msg.author.username}**.`)
  }

  if (!parameters) {
  msg.channel.send("Please give me a user to get the info of! :3")
  return
  }
  }
  },

"oof": {
  description: "OOF!",
  usage: "$oof",
  category: "actions",
  process: async function(msg,parameters) {
  msg.channel.send("OOF!\nhttps://static.wikia.nocookie.net/roblox/images/9/91/BiggestHead.png/revision/latest?cb=20190905155620")
  }
  },

"foxfact": {
  description: "Random fox fact.",
  usage: "`$foxfact`",
  category: "actions",
  process: async function(msg, parameters) {
  superagent
  .get('https://some-random-api.ml/facts/fox')
  .then(res => {
  msg.channel.send(res.body.fact)
  });
  }
  },

"urcute": {
  description: "Call someone cute!",
  usage: "`$urcute {@user}`",
  category: "actions",
  process: async function(msg, parameters) {

  let mentionedUser = msg.mentions.users.first()

  if (!mentionedUser) {
  msg.channel.send("Hm. I don't think that's a user. <:wthinking:664569858368995350>")
  return
  }

  if (msg.author === mentionedUser) {
  msg.channel.send("That is true but, c'mon.")
  return
  }

  if (mentionedUser)
  msg.channel.send(`Aww! **${msg.author.username}** thinks **${mentionedUser}** is cute!`)
  }
  },

"boop": {
  description: "Boop someone's snoot!",
  usage: "`$boop {@user}`",
  category: "actions",
  process: async function(msg, parameters) {

  let mentionedUser = msg.mentions.users.first()

  if (msg.author === mentionedUser) {
  msg.channel.send(`**${msg.author.username}** boops themselves. Maybe someone should boop them?`)
  return
  }

  if (mentionedUser) {
  msg.channel.send()
  let images = await GetE621Images("+boop+rating:s", 1, "random", msg.channel.nsfw)

  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE")
  .setImage(images[0].file.url)
  .setDescription(`**${msg.author.username}** boops **${mentionedUser}**'s snoot!`)
  .setFooter("Issue loading an image? Try the command again! It was most likely on e621's behalf!")
  msg.channel.send(embed1)
  }
  else
  msg.channel.send(`no u!~`)
  }
  },

"sit": {
  description: "Sit on someone!",
  usage: "`$sit {@user}`",
  category: "actions",
  process: async function(msg, parameters) {

  let mentionedUser = msg.mentions.users.first()

  if (msg.author === mentionedUser) {
  msg.channel.send(`**${msg.author.username}** just sits on the ground looking cute.`)
  return
  }

  if (mentionedUser)
  msg.channel.send(`**${msg.author.username}** sits on **${mentionedUser}**!`)
  else
  msg.channel.send(`no u!~`)
  }
  },

"hit": {
  description: "Smack someone around!",
  usage: "`$hit {@user}`",
  category: "actions",
  process: async function(msg, parameters) {

  let mentionedUser = msg.mentions.users.first()

  if (msg.author === mentionedUser) {
  msg.channel.send(`**${msg.author.username}** punches... themselves? ~~Kind weird, ngl~~`)
  return
  }

  if (mentionedUser)
  msg.channel.send(`**${msg.author.username}** hits **${mentionedUser}** in the face!`)
  else
  msg.channel.send(`no u!~`)
  }
  },

"slap": {
  description: "Show someone who's boss!",
  usage: "`$slap {@user}`",
  category: "actions",
  process: async function(msg, parameters) {

  let mentionedUser = msg.mentions.users.first()

  if (msg.author.id === mentionedUser.id) {
  msg.channel.send(`<@${msg.author.id}> slaps themselves. Ouchie!`)
  return
  }

  if (mentionedUser)
  msg.channel.send(`**${msg.author.username}** slaps **${mentionedUser}**!`)
  else
  msg.channel.send(`no u!~`)

  }
  },

"glomp": {
  description: "Glomp someone!",
  usage: "`$glomp {@user}`",
  category: "actions",
  process: async function(msg, parameters) {
  let images = await GetE621Images("+score:>10+hug+hugging+rating:s+duo+-mlp+-my_little_pony", 1, "random", msg.channel.nsfw)

  let users = msg.mentions.users.map((user) => user.username).join(', ')

  if (users === msg.author) {
  msg.channel.send(`**${msg.author.username}** glomps themselves! :3`)
  return
  }

  if (!parameters) {
  msg.channel.send(`**${msg.author.username}** glomps themselves! :3`)
  return
  }

  if (users) {
  var embed1 = new Discord.MessageEmbed().setColor("#06FBFE") 
  .setDescription(`**${msg.author.username}** glomps **${users}**`)
  .setImage(images[0].file.url)
  .setFooter("Issue loading an image? Try the command again! It was most likely on e621's behalf!")
  msg.channel.send(embed1)
  }
  else {
  msg.channel.send(`**${msg.author.username}** cuddles themselves! :3`)
  }
  }
  },

"pog": {
  description: "Poggers!",
  usage: "`$pog`",
  category: "emotions",
  process: async function(msg, parameters) {
  msg.channel.send("Poggers!")
  msg.channel.send('https://img.pngio.com/pogchamp-pogchamp-meme-on-meme-pogchamp-emote-discord-500_564.png')
  }
  },

"vibe": {
  description: "The vibes! They're too strong!",
  usage: "$vibe",
  category: "emotions",
  process: async function(msg, parameters) {
  msg.channel.send("Good vibes only!")
  msg.channel.send('https://tenor.com/bnDI5.gif')
  }
  },

"wut": {
  description: "What's going here?!",
  usage: "$wut",
  category: "emotions",
  process: async function(msg, parameters) {
  msg.channel.send("Huh?")
  msg.channel.send('https://media0.giphy.com/media/1X7lCRp8iE0yrdZvwd/200.gif')
  }
  },

"anger": {
  description: "Angy!",
  usage: "$anger",
  category: "emotions",
  process: async function(msg, parameters) {
  msg.channel.send("No talk me. I angy.")
  msg.channel.send('https://i.pinimg.com/originals/ac/1c/b3/ac1cb3d2baa33b1bbba1e409fbfb70b1.gif')
  }
  },

"love": {
  description: "Show someone how much they mean to you!",
  usage: "`$love {user}`",
  category: "emotions",
  process: async function(msg, parameters) {
  let mentionedUser = msg.mentions.users.first()

  if (!mentionedUser) {
  msg.channel.send(`How are you not gonna actually ping a user? -_-`)
  return
  }

  if (mentionedUser === msg.author) {
  msg.channel.send(`**${msg.author.username}** loves themself! Very good attitude to have!`)
  return
  }

  if (parameters) {
  msg.channel.send(`Aww! Looks like **${msg.author.username}** loves **${mentionedUser}**!`)
  return
  }
  else {
  msg.channel.send(`**${msg.author.username}** doesn't know how these commands work~`)
  return
  }
  }
  },

"createchannel": {
  description: "Creates a private channel",
  usage: "`$createchannel`",
  category: "server",
  process: async function(msg, parameters) {

  if (!msg.guild.me.hasPermission("MANAGE_CHANNELS")) {
  msg.channel.send("I don't have the `manage channels` permission needed to create channels!")
  return
  }

  var channelPerms = [
  {
  id: msg.guild.id,
  deny: ['VIEW_CHANNEL']
  },
  {
  id: msg.author.id,
  allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'MANAGE_ROLES']
  }
  ]

  var channelName = ""
  if (parameters)
  channelName = parameters
  else
  channelName = "Your Text Channel"

  var createdChannel = await msg.guild.channels.create(channelName, { type: "text", parent: msg.channel.parentID, permissionOverwrites: channelPerms })

  var replyMsg = await msg.reply(` your custom channel <#${createdChannel.id}> has been created! :3`)
  replyMsg.delete({timeout: 5000}).catch(console.error)
  msg.delete({timeout: 5000}).catch(console.error)

  }
  },

"createvoice": {
  description: "Creates a private voice channel",
  usage: "`$createchannel`",
  category: "server",
  process: async function(msg, parameters) {

  if (!msg.guild.me.hasPermission("MANAGE_CHANNELS")) {
  msg.channel.send("I don't have the `manage channels` permission needed to create channels!")
  return
  }

  var channelPerms = [
  {
  id: msg.guild.id,
  deny: ['VIEW_CHANNEL']
  },
  {
  id: msg.author.id,
  allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'MANAGE_ROLES']
  }
  ]

  var channelName = ""
  if (parameters)
  channelName = parameters
  else
  channelName = "Your Voice Channel"

  var createdChannel = await msg.guild.channels.create(channelName, { type: "voice", parent: msg.channel.parentID, permissionOverwrites: channelPerms })
  msg.channel.send("**" + msg.author.username + "**, `your custom voice channel` <#" + createdChannel.id + "> `has been created!`").then(msg => msg.delete(20000))
  msg.delete().catch(console.error)

  }
  },

"credits": {
  description: "Gives a breif description of the bot and who created it!",
  usage: "`$credits`",
  category: "server",
  process: async function(msg, parameters) {

  var embed1 = new Discord.MessageEmbed().setColor("#FFFFFF")
  .setTitle("KitsuneBot")
  .setDescription("A multipurpose Furry Discord bot!")
  .setTimestamp()
  .setFooter("Created by: Dusk#4396")

  msg.channel.send(embed1)

  }
  },

"ping": {
  description: "Test the bot's reaction time.",
  usage: "`$ping`",
  category: "server",
  process: async function(msg, parameters) {
  let timeNow = + new Date()
  msg.channel.send(`API (post msg): ${timeNow - msg.createdTimestamp}ms`)
  .then(m => m.edit(`${m.content}\nAPI (edit msg): ${m.createdTimestamp - msg.createdTimestamp}ms`)
  )
  }
  },

"server": {
  description: "Displays server information!",
  usage: "`$server`",
  category: "server",
  process: async function(msg, parameters) {
  let serverIcon = msg.guild.iconURL({ dynamic: true });
  var embed1 = new Discord.MessageEmbed()
  .setColor("#06FBFE")
  .addFields(
  { name: 'Server Name:', value: `**${msg.guild.name}**`, inline: true },
  { name: 'Total Members:', value: `**${msg.guild.memberCount}**`, inline: true },
  { name: "Curent Icon:", value:"\u200B"},
  )
  .setFooter(`Command run by: ${msg.author.username}`)
  .setImage(`${serverIcon}`)

  msg.channel.send(embed1)
  }
  },

"kitsunebot": {
  description: "Displays all relevent information about KitsuneBot!",
  usage: "`$totals`",
  category: "server",
  process: async function(msg, parameters) {
  var embed1 = new Discord.MessageEmbed()
  .setColor("#06FBFE")
  .addFields(
  { name: 'My name:', value: `KitsuneBot#0834`, inline: true },
  { name: 'My ID:', value: `738229595626668102`, inline: true },
  { name: 'Total servers:', value: `${bot.guilds.cache.size}`, inline: true },
  { name: 'Total members:', value: `${bot.users.cache.size}`, inline: true },
  { name: 'My creator:', value: `Dusk#4396`, inline: true },
  { name: "My current avatar:", value:"\u200B"},
  )
  .setFooter(`Command run by: ${msg.author.username}`)
  .setImage("https://i.imgur.com/hOC1itk.jpg")

  msg.channel.send(embed1)
  }
  },

"kick": {
  description: "(Moderators only) Kicks a desired member.",
  usage: "`$kick {@user}`",
  category: "moderation",
  process: async function(msg, parameters) {

  if (!msg.member.hasPermission("KICK_MEMBERS")) {
  msg.reply("You don't have permission to kick in this server")
  return
  }

  if (!msg.guild.me.hasPermission("KICK_MEMBERS")) {
  msg.reply("I don't have permission to kick in this server")
  return
  }

  let taggedUser = msg.mentions.users.first()
  if (!taggedUser) {
  msg.reply("Please tag a user for me to kick")
  return
  }

  let asGuildMember = msg.guild.member(taggedUser)
  if (!asGuildMember) {
  msg.reply("This user isn't in the server!")
  return
  }

  let reason = parameters.replace(`<@${taggedUser.tag}>`, "")

  asGuildMember.kick(`Kicked by ${msg.author.tag} for ${reason}`)
  .then(() => msg.reply(`Successfully kicked <@${taggedUser.tag}>`))
  .catch(console.error)

  }
  },

"ban": {
  description: "(Moderators only!) Bans the desired member",
  usage: "`$ban {@user} {reason}`",
  category: "moderation",
  process: async function(msg, parameters) {

  if (!msg.member.hasPermission("BAN_MEMBERS")) {
  msg.reply("You don't have permission to ban in this server")
  return
  }

  if (!msg.guild.me.hasPermission("BAN_MEMBERS")) {
  msg.reply("I don't have permission to ban in this server")
  return
  }

  let taggedUser = msg.mentions.users.first()
  if (!taggedUser) {
  msg.reply("Please tag a user for me to ban")
  return
  }

  let asGuildMember = msg.guild.member(taggedUser)
  if (!asGuildMember) {
  msg.reply("This user isn't in the server!")
  return
  }

  let reason = parameters
  .replace(`<@${taggedUser.id}>`, "")
  .replace(`<@!${taggedUser.id}>`, "")

  if (!reason)
  reason = "No reason specified."

  asGuildMember.ban({ reason: `Banned by ${msg.author.tag} for ${reason}`, days: 7 })
  .then(() => msg.reply(`Successfully banned <@${taggedUser.id}>`))
  .catch(console.error)
  }
  },

"purge": {
  description: "Deletes the specified amount of messages!",
  usage: "$purge {# of messages}",
  category: "moderation",
  process: async function(msg, parameters) {

  if (!msg.member.hasPermission("MANAGE_MESSAGES")) 
  {
  msg.reply("You don't have permission to delete messages in this server")
  return
  }

  if (!msg.guild.me.hasPermission("MANAGE_MESSAGES")) {
  msg.reply("I don't have permission to delete messages in this server")
  return
  }

  const args = msg.content.split(' ').slice(1);
  const amount = args.join(' ');

  if (!amount) return msg.reply('You haven\'t given the amount of messages that should be deleted!');

  if (isNaN(amount)) return msg.reply('That isn`t a number, dingus!');

  if (amount > 100) return msg.reply('You can`t delete more than 100 messages at once! Are ya trying to kill me?!');

  if (amount < 1) return msg.reply('You have to delete at least 1 message!');

  await msg.channel.messages.fetch({ limit: amount }).then(messages => {
  msg.channel.bulkDelete(messages
  )
  });

  }
  },

"owoify": {
  description: "OwO",
  usage: "`$owoify`",
  category: "misc",
  process: async function(msg, parameters) {
  if (parameters)
  msg.channel.send(parameters.replace(/o/g, "owo"))
  }
  },

"ovoify": {
  description: "OvO",
  usage: "`$ovoify`",
  category: "misc",
  process: async function(msg, parameters) {
  if (parameters)
  msg.channel.send(parameters.replace(/o/g, "ovo"))
  }
  },

"uwuify": {
  description: "UwU",
  usage: "`$uwuify`",
  category: "misc",
  process: async function(msg, parameters) {
  if (parameters)
  msg.channel.send(parameters.replace(/u/g, "uwu"))
  }
  },

"uvuify": {
  description: "UvU",
  usage: "`$uvuify`",
  category: "misc",
  process: async function(msg, parameters) {
  if (parameters)
  msg.channel.send(parameters.replace(/u/g, "uvu"))
  }
  },

"support": {
  description: "Displays the support server's invite link!",
  usage: "`$support`",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("Use this invite to join the support server for KitsuneBot! \nhttps://discord.gg/eJRfauK")
  }
  },

"blockchannel": {
  description: "Blocks a certain channel from getting command responses",
  usage: "`$blockchannel`",
  category: "moderation",
  process: async function(msg, parameters) {
  if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
  msg.channel.send("You aren't allowed to use this!")
  return
  }

  if (parameters) {
  msg.channel.send("Please only use this command as a standalone.")
  return
  }

  if (!ignoredStuff[msg.guild.id]) {
  ignoredStuff[msg.guild.id] = {
  channels: [],
  users: [],
  commands: []
  };
  }

  if (ignoredStuff[msg.guild.id].channels.includes(msg.channel.id)) {
  msg.channel.send("This channel is already being ignored!")
  return
  }

  ignoredStuff[msg.guild.id].channels.push(msg.channel.id)

  fileSystem.writeFile("ignoredStuff.json", JSON.stringify(ignoredStuff, null, 4), (err) => {
  if (err) { console.error(err); return; };
  console.log("File has been created");
  })

  msg.channel.send(`This channel has been blocked from getting command responses!`)

  }
  },

"mlady": {
  description: "*tips fedora*",
  usage: "`$mlady`",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("M'lady")
  msg.channel.send("https://cdn.discordapp.com/attachments/739581699532521472/745309870969978941/download.jpg")

  }
  },

"deletelast": {
  description: "Deletes the last sent message",
  usage: "`$deletelast`",
  category: "moderation",
  process: async function(msg, parameters) {

  if (!msg.guild.me.hasPermission("MANAGE_MESSAGES")) {
  msg.reply("I don't have permission to delete messages in this server")
  return
  }

  if (!parameters) {
  let getLast = await msg.channel.messages.fetch()
  let filterBot = getLast.filter(m => m.author.id === bot.user.id)
  filterBot.first().delete()
  .then(m => {
    msg.react("✅")
  })
  .catch(m => {
    msg.react("🚫")
  })

  }

  if (parameters) {
  msg.channel.send("Please run this command without parameters!")
  }
  }
  },

"ded": {
  description: "Death",
  usage: "`$ded`",
  category: "images",
  process: async function(msg, parameters) {
  msg.channel.send(`**${msg.author.username}** has perished.\nhttps://media1.tenor.com/images/5c695fdb0c853ac734fd0d186a4aef55/tenor.gif`)

  }
  },

"rename": {
  description: "Changes the bot's nickname!",
  usage: "`$rename {name}`",
  category: "moderation",
  process: async function(msg, parameters) {

  if (!msg.member.hasPermission("MANAGE_NICKNAMES")) {
  msg.reply("You don't have permission to edit members in this server")
  return
  }

  if (!msg.guild.me.hasPermission("MANAGE_NICKNAMES")) {
  msg.reply("I don't have permission to edit members in this server")
  return
  }

  if (parameters) {
  msg.guild.me.setNickname(parameters);
  msg.channel.send(`My name has been changed to ${parameters}!`)
  }
  if (!parameters) {
  return
  }
  }
  },

"blur": {
  description: "Blur an image",
  usage: "`$blur {bluriness 0-10}`",
  category: "images",
  process: async function(msg, parameters) {

  let getImage = await GetImageFromChannel(bot, msg, parameters);

  if (!getImage) {
  msg.channel.send("`No images found`")
  return
  }

  let readImage = await Jimp.read(getImage)
  readImage.blur(10)
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
  attachment: imageBuffer,
  name: "image." + readImage.getExtension()
  }]
  })

  }
  },

"flip": {
  description: "Flip an image",
  usage: "`$flip {h/v}`",
  category: "images",
  process: async function(msg, parameters) {
  let parameters1 = [] 
  parameters1[0] = parameters.includes(' h') ? true : false;
  parameters1[1] = parameters.includes(' v') ? true : false;

  let getImage = await GetImageFromChannel(bot, msg, parameters1);

  if (!getImage) {
  msg.channel.send("`No images found`")
  return
  }

  if (parameters1[0] || parameters1[1]) {
  let readImage = await Jimp.read(getImage);
  console.log(parameters1);
  readImage.mirror( parameters1[0], parameters1[1] )
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
    attachment: imageBuffer,
    name: "image." + readImage.getExtension()
  }]
  })
  }
  else {
  msg.channel.send("`No flip axis selected`")
  }
  }
  },

"rotate": {
  description: "Rotate an image",
  usage: "`$rotate {0-360}`",
  category: "images",
  process: async function(msg, parameters) {
  let parameters1 = parameters.trim(" ")
  let getImage = await GetImageFromChannel(bot, msg, parameters1);

  if (!getImage) {
  msg.channel.send("`No images found`")
  return
  }

  if (!parameters) {
  let readImage = await Jimp.read(getImage);
  readImage.rotate( 90 )
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
  attachment: imageBuffer,
  name: "image." + readImage.getExtension()
  }]
  })
  }
  if (parameters) {
  let readImage = await Jimp.read(getImage);
  readImage.rotate( parseInt(parameters1) )
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
  attachment: imageBuffer,
  name: "image." + readImage.getExtension()
  }]
  })
  }
  }
  },

"invert": {
  description: "Invert an image",
  usage: "`$invert`",
  category: "images",
  process: async function(msg, parameters) {
  let getImage = await GetImageFromChannel(bot, msg, parameters);

  if (!getImage) {
  msg.channel.send("`No images found`")
  return
  }

  if (parameters) {
  msg.channel.send("This command doesn't require any user input! :3")
  return
  }
  
  if (!parameters) {
  let readImage = await Jimp.read(getImage);
  readImage.invert()
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
    attachment: imageBuffer,
    name: "image." + readImage.getExtension()
  }]
  })
  }
  }
  },

"sepia": {
  description: "Apply a sepia colour wash on an image",
  usage: "`$sepia`",
  category: "images",
  process: async function(msg, parameters) {
  let getImage = await GetImageFromChannel(bot, msg, parameters);

  if (!getImage) {
  msg.channel.send("`No images found`")
  return
  }

  if (parameters) {
  msg.channel.send("This command doesn't require any user input! :3")
  return
  }

  if (!parameters) {
  let readImage = await Jimp.read(getImage);
  readImage.sepia()
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
    attachment: imageBuffer,
    name: "image." + readImage.getExtension()
  }]
  })
  }
  }
  },

"normalize": {
  description: "Normalize the colours in an image",
  usage: "`$normalize`",
  category: "images",
  process: async function(msg, parameters) {
  let getImage = await GetImageFromChannel(bot, msg, parameters);

  if (!getImage) {
  msg.channel.send("`No images found`")
  return
  }

  if (parameters) {
  msg.channel.send("This command doesn't require any user input! :3")
  return
  }

  if (!parameters) {
  let readImage = await Jimp.read(getImage);
  readImage.normalize()
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
    attachment: imageBuffer,
    name: "image." + readImage.getExtension()
  }]
  })
  }
  }
  },

"addtransparent": {
  description: "Make an image partially transparent",
  usage: "`$addtransparent {0.0-1.0}`",
  category: "images",
  process: async function(msg, parameters) {
  let getImage = await GetImageFromChannel(bot, msg, parameters);

  if (!getImage) {
  msg.channel.send("`No images found`")
  return
  }

  if (!parameters) {
  msg.channel.send("This command requires user input! :3")
  return
  }

  if (parameters) {
  let readImage = await Jimp.read(getImage);
  readImage.fade( parseInt(parameters) )
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
    attachment: imageBuffer,
    name: "image." + readImage.getExtension()
  }]
  })
  }
  }
  },

"resize": {
  description: "Resize an image",
  usage: "`$resize`",
  category: "images",
  process: async function(msg, parameters) {
  let parameters1 = parameters.split(" ")
  let resolutionRegex = /(\d+)((?:\s+|x+)(\d+))?/gm;
  let resolution;
  try {
  resolution = resolutionRegex.exec(parameters)[0].split(" ");
  } catch (err) {
  msg.channel.send("Uh, you gotta give me some sizes here")
  return
  }
  let getImage = await GetImageFromChannel(bot, msg, resolution);

  if (resolution[0] > 2000) {
  msg.channel.send("I can't go over 2000px, soz!")
  return
  }

  if (resolution[1] > 2000) {
  msg.channel.send("I can't go over 2000px, soz!")
  return
  }

  if (!getImage) {
  msg.channel.send("`No images found`")
  return
  }

  if (!resolution[1]) {
  let readImage = await Jimp.read(getImage);
  readImage.resize( parseInt(resolution[0]), Jimp.AUTO);
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
    attachment: imageBuffer,
    name: "image." + readImage.getExtension()
  }]
  })
  }

  else if (resolution) {
  let readImage = await Jimp.read(getImage)
  readImage.resize( parseInt( resolution[0]), parseInt(resolution[1]) );
  let imageBuffer = await readImage.getBufferAsync(readImage.getMIME())

  msg.channel.send({
  files: [{
  attachment: imageBuffer,
  name: "image." + readImage.getExtension()
  }]
  })

  }
  }
  },

"invite": {
  description: "Displays the bot invite link",
  usage: "$invite",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("Use this link to invite KitsuneBot to your server!")
  msg.channel.send('https://discord.com/oauth2/authorize?client_id=738229595626668102&scope=bot&permissions=130134')
  }
  },

"vote": {
  description: "Shows all the places you can vote for KitsuneBot!",
  usage: "$vote",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("You can vote for KitsuneBot in these places!\nhttps://discord.boats/bot/738229595626668102/vote\nhttps://bots.discordlabs.org/login?return=/bot/738229595626668102/vote\nhttps://top.gg/bot/738229595626668102/vote")
  }
  },

"yanderedev": {
  description: "Will it ever be?",
  usage: "$notdone",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("YandereSim will never be finished!")
  msg.channel.send('https://cdn.discordapp.com/attachments/739581699532521472/742918926840758332/EvaX.jpg')

  }
  },

"pepega": {
  description: "Yes",
  usage: "$pepega",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("Pepega, broski")
  msg.channel.send('https://ih0.redbubble.net/image.888702224.8420/flat,550x550,075,f.u2.jpg')

  }
  },

"pleb": {
  description: "You absolute mongoloid!",
  usage: "$pleb",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("Heccing plebs")
  msg.channel.send('https://cdn.discordapp.com/attachments/739581699532521472/742865023109431328/you-pleb-pepe-png-clipart.jpg')
  }
  },

"yoink": {
  description: "Yoink an emoji",
  usage: "`$yoink`",
  category: "images",
  process: async function(msg, parameters) {
  const hasEmoteRegex = /<a?:.+:\d+>/gm
  const emoteRegex = /<:.+:(\d+)>/gm
  const animatedEmoteRegex = /<a:.+:(\d+)>/gm

  const messages = await msg.channel.messages.fetch()
  const message = messages.find(m => m.content.match(hasEmoteRegex))

  if (emoji = emoteRegex.exec(message)) {
  const url = "https://cdn.discordapp.com/emojis/" + emoji[1] + ".png?v=1"
  msg.channel.send(url)
  }
  else if (emoji = animatedEmoteRegex.exec(message)) {
  const url = "https://cdn.discordapp.com/emojis/" + emoji[1] + ".gif?v=1"
  msg.channel.send(url)
  }
  else {
  msg.channel.send("Couldn't find an emoji to yoink!")
  }

  }
  },

"nya": {
  description: "Catbois deserve nice things. :3",
  usage: "`$nya`",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send('*cute catboi noises*')
  }
  },

"foxpic": {
  description: "I showed you my fox. Pls answer",
  usage: "`$foxpic`",
  category: "images",
  process: async function(msg, parameters) {
  superagent
  .get('https://some-random-api.ml/img/fox')
  .then(res => {
  msg.channel.send(res.body.link)
  });

  }
  },

"horny": {
  description: "KitsuneBot is always horny",
  usage: "`$horny`",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("Go to horny jail! <:whammer:790470057083666453>")
  }
  },

"areyouwinning": {
  description: "Are ya winning, son?",
  usage: "`$areyouwinning`",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("https://i.kym-cdn.com/photos/images/newsfeed/001/883/999/c39.gif")

  }
  },

"meow": {
  description: "Displays a random picture of a cat!",
  usage: "`$meow`",
  category: "images",
  process: async function(msg, parameters) {
  msg.channel.send("Meow!")
  let { body } = await superagent.get(`https://api.thecatapi.com/v1/images/search`).set('User-Agent', 'DiscordTestBot')

  if (body[0])
  msg.channel.send(body[0].url)
  else
  msg.channel.send('UwU')

  }
  },

"hentai": {
  description: "The good kush",
  usage: "`$hentai`",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("You know the rules and so do I!")
  msg.channel.send("https://media1.tenor.com/images/467d353f7e2d43563ce13fddbb213709/tenor.gif")
  }
  },

"fireworks": {
  description: "Kablam!",
  usage: "`$fireworks`",
  category: "misc",
  process: async function(msg, parameters) {
  msg.channel.send("Kablam!")
  msg.channel.send(`https://i.pinimg.com/originals/1b/4f/7c/1b4f7c5d3052bf044bff40fe1a3739e6.gif`)
  }
  },

"bruh": {
  description: "Bruh moment",
  usage: "`$bruh`",
  category: "emotions",
  process: async function(msg, parameters) {
  msg.channel.send("__***bruh moment***__")
  msg.channel.send(`https://e.snmc.io/i/600/w/f335ded184364fefd19e0e5e7889aa90/7742328`)
  }
  },

"lol": {
  description: "lol",
  usage: "`$lol`",
  category: "emotions",
  process: async function(msg, parameters) {
  msg.channel.send("***LOL***")
  msg.channel.send(`https://images.squarespace-cdn.com/content/v1/585c1d8abebafb75e3380189/1547521414865-VOXTJUE5L3HTWDEVW53V/ke17ZwdGBToddI8pDm48kGDpvalPb1SqHoCn1hwN0Y57gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QHyNOqBUUEtDDsRWrJLTmjTeiQ8v2Gi6jnuD7IilWB1aFTl2rN_NJyVfSxiuM_6AwcSnARVzH7DJZbr4wQ8RL/lol.gif`)
  }
  },

"say": {
  description: "Make KitsuneBot say something!",
  usage: "`$say {words to say}`",
  category: "actions",
  process: async function(msg, parameters) {

  if (!parameters)
  msg.channel.send("You didn't give me anything to say. ;-;")

  if (parameters.includes("$say")) {
  msg.channel.send("Soz, I can't let you do that.")
  return
  }

  if (parameters.includes("$kick")) {
  msg.channel.send("Soz, I can't let you do that.")
  return
  }

  if (parameters.includes("$ban")) {
  msg.channel.send("Soz, I can't let you do that.")
  return
  }

  if (parameters.includes("$purge")) {
  msg.channel.send("Soz, I can't let you do that.")
  return
  }

  if (parameters.includes("$rename")) {
  msg.channel.send("Soz, I can't let you do that.")
  return
  }

  if (parameters.includes("$blockchannel")) {
  msg.channel.send("Soz, I can't let you do that.")
  return
  }

  if (parameters) {
  msg.channel.send(`${parameters}`).then(msg => msg.delete(1000))
  msg.delete().catch(console.error)
  }
  }
  }
  }

  bot.on('message', async msg => {

  if (!msg.content.startsWith('$'))
  return

  let command = msg.content.toLowerCase().substring(1)

  command = command.split(' ')[0].trim().toLowerCase()

  statcord.postCommand(command, msg.author.id);

  let parameters = msg.content.replace(`$${command}`, '').trim()

  var isIgnored = IsIgnored(msg, command)
  if (isIgnored[0]) {
  msg.channel.send(isIgnored[1])
  return
  }

  console.log(`Processing Command:\nUser: ${msg.author.tag} - ${msg.author.id}\nCommand: ${command}\nParams: ${parameters}\nChannel: ${msg.channel.id}\n`)

  if (!commandList[command]) {
  await msg.channel.messages.fetch()
  .then(m => {
  msg.react("🚫")
  })
  .catch(m => {
  msg.react("🚫")
  })
  return
  }

  commandList[command].process(msg, parameters)
  })

  bot.on('ready', () => {
  bot.user.setActivity(`wholesmome content! :3`, { type: 'WATCHING' });
  console.log("ready!")
  })

  bot.on('channelUpdate', (channelBeforeChange, channelAfterChange) => {
  var getGuild = channelAfterChange.guild
  if (getGuild.id === '644035617239334962') // dont run in Echo's guild.
  return
  if (!(getGuild.me.hasPermission('MANAGE_CHANNELS') && getGuild.me.hasPermission('MANAGE_ROLES')))
  return

  var oldPerms = channelBeforeChange.permissionOverwrites
  var newPerms = channelAfterChange.permissionOverwrites
  if (oldPerms == newPerms)
  return
  newPerms.forEach(userPerm => {
  var getPerms = channelAfterChange.permissionsFor(userPerm.id)
  if (!getPerms)
  return
  if (getPerms.has('MANAGE_WEBHOOKS') || getPerms.has('MENTION_EVERYONE')) {
  channelAfterChange.updateOverwrite(userPerm.id, { 'MANAGE_WEBHOOKS': false, 'MENTION_EVERYONE': false })
  }
  })
  })


  async function GetImageFromChannel(bot, msg, params, msglimit = 100, beforeCurrentMsg = false) {
  var imageUrl;
  var fetchOptions = {};
  if (beforeCurrentMsg)
  fetchOptions.before = msg.id;
  fetchOptions.limit = msglimit;

  var messages = await msg.channel.messages.fetch(fetchOptions);
  messages = messages.array();
  for (let num=0; num < messages.length; num++) 
  {
  let curMsg = messages[num];
  let getImg = await GetImageFromMsg(curMsg);
  if (getImg)
  {
    imageUrl = getImg;
    break;
  }
  }
  return imageUrl;
  }

  async function GetImageFromMsg(msg) {
  var imageUrl = null;
  const urlsnifferpattern = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|bmp|gif|tiff|webp)(?:$|[^\s]+))/i;

  if (msg.attachments && (getImg = msg.attachments.find(val => val.height && val.url)) && getImg.url.match(urlsnifferpattern)) // user uploads directly to chat.
  imageUrl = getImg.url;
  if (msg.content && (getImg = msg.content.match(urlsnifferpattern))) // Here first to avoid caching issues on the next two checks.
  imageUrl = getImg[0].replace(">", "");
  if (msg.embeds && (getImg = msg.embeds.find(val => val.thumbnail && val.thumbnail.url))) // small image ONLY on  bot-made embeds - (small??>)big image on LINK-made embeds - random image URLS with no embeds.
  imageUrl = getImg.thumbnail.url;
  if (msg.embeds && (getImg = msg.embeds.find(val => val.image && val.image.url))) // big image on bot-made embeds.
  imageUrl = getImg.image.url;

  if (!imageUrl)
  return null;

  return imageUrl;
  }
