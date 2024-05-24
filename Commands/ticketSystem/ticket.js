const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const TicketSetup = require('../../Schemas/TicketSetup');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Bilet sistemi kurmak için bir komut.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName('kanal')
        .setDescription('Biletlerin oluşturulacağı kanalı seçin.')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((option) =>
      option
        .setName('kategori')
        .setDescription('Biletlerin oluşturulacağı üst kategoriyi seçin.')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addChannelOption((option) =>
      option
        .setName('transkriptler')
        .setDescription('Transkriptlerin gönderileceği kanalı seçin.')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((option) =>
      option
        .setName('yöneticiler')
        .setDescription('Bilet yöneticisi rolünü seçin.')
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName('herkes')
        .setDescription('Herkes rolünü seçin.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('açıklama')
        .setDescription('Bilet embed açıklamasını seçin.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('buton')
        .setDescription('Bilet embed buton adını seçin.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription('Bir stil seçin ve bir emoji seçin.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const { guild, options } = interaction;
    try {
      const channel = options.getChannel('kanal');
      const category = options.getChannel('kategori');
      const transcripts = options.getChannel('transkriptler');
      const handlers = options.getRole('yöneticiler');
      const everyone = options.getRole('herkes');
      const description = options.getString('açıklama');
      const button = options.getString('buton');
      const emoji = options.getString('emoji');
      await TicketSetup.findOneAndUpdate(
        { GuildID: guild.id },
        {
          Channel: channel.id,
          Category: category.id,
          Transcripts: transcripts.id,
          Handlers: handlers.id,
          Everyone: everyone.id,
          Description: description,
          Button: button,
          Emoji: emoji,
        },
        {
          new: true,
          upsert: true,
        }
      );
      const embed = new EmbedBuilder().setDescription(description);
      const buttonshow = new ButtonBuilder()
        .setCustomId(button)
        .setLabel(button)
        .setEmoji(emoji)
        .setStyle(ButtonStyle.Primary);
      await guild.channels.cache.get(channel.id).send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(buttonshow)],
      }).catch(error => { return });
      return interaction.reply({ embeds: [new EmbedBuilder().setDescription('Bilet paneli başarıyla oluşturuldu.').setColor('Green')], ephemeral: true });
    } catch (err) {
      console.log(err);
      const errEmbed = new EmbedBuilder().setColor('Red').setDescription(config.ticketError);
      return interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(error => { return });
    }
  },
};
