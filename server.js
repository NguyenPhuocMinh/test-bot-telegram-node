const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '1725590600:AAGK-Z9y9FEyRHdYgZflmjU3bnA3vvh2vjI';
const URL = 'https://f7e796bbeaa1.ngrok.io'; // ngrok http 3000
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(TOKEN);

bot.openWebHook();
bot.setWebHook(`${URL}/bot${TOKEN}`);

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: 'Hello bot' })
})

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

bot.on('message', (ctx) => {
  const chatId = ctx.chat.id;

  const text = ctx.text;
  switch (true) {
    case text === '/start':
      bot.sendMessage(chatId,
        "Chào mừng bạn đến với [xoso.com.vn](https://xoso.com.vn)" +
        " dịch vụ cá cược trực tuyến hàng đầu với hàng trăm sản phẩm cược hấp dẫn\nHãy để BOT xoso.com.vn" +
        " phục vụ quý khách hàng những lệnh sau:\n\n" +
        "  /xs (kiểm tra kết quả sổ số ba miền)\n" +
        "  /xsmn ngày-tháng-năm (kiểm tra kết quả sổ số miền nam ngày bất kì)\n" +
        "  /xsmb ngày-tháng-năm (kiểm tra kết quả sổ số miền bắc ngày bất kì)\n" +
        "  /xsmt ngày-tháng-năm (kiểm tra kết quả sổ số miền trung ngày bất kì)",
        {
          parse_mode: 'Markdown',
        }
      );
      break;
    case text === '/xs':
      bot.sendMessage(chatId, "Vui lòng chọn vùng bạn muốn xem kết quả",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Miền bắc',
                  callback_data: '/xsmb',
                }
              ],
              [
                {
                  text: 'Miền nam',
                  callback_data: '/xsmn',
                }
              ],
              [
                {
                  text: 'Miền trung',
                  callback_data: '/xsmt',
                }
              ],
              [
                {
                  text: 'Huỷ',
                  callback_data: 'huy',
                }
              ]
            ]
          }
        }
      );
      break;
    case text === '/xsmb':
      bot.sendMessage(chatId, "Xổ số Miền Bắc ngày 24/06 (Thứ Năm)\n" +
        "--------------------\n" +

        "Đài: Hà Nội\n" +
        "ĐB: 17879\n" +
        "G1: 77328\n" +
        "G2: 12410 69282\n" +
        "G3: 95919 47894 54722 13959 12972 80067\n" +
        "G4: 4175 4355 0992 8562\n" +
        "G5: 6486 1704 8635 2385 9439 9824\n" +
        "G6: 844 819 537\n" +
        "G7: 22 96 35 52"
      );
      break;
    case text === '/xsmn':
      bot.sendMessage(chatId, "Xổ số Miền Nam ngày 24/06 (Thứ Năm)\n" +
        "--------------------\n\n" +
        "Đài: Tây Ninh\n" +
        "G.8: 75\n" +
        "G.7: 594\n" +
        "G.6: 3227 4065 6401\n" +
        "G.5: 3443\n" +
        "G.4: 30045 45287 99553 47630 07193 54646 38634\n" +
        "G.3: 18129 18318\n" +
        "G.2: 16369\n" +
        "G.1: 17044\n" +
        "ĐB: 337777\n" +
        "--------------------\n\n" +
        "Đài: An Giang\n" +
        "G.8: 68\n" +
        "G.7: 202\n" +
        "G.6: 6879 8278 5102\n" +
        "G.5: 9248\n" +
        "G.4: 60505 55934 68959 96715 56087 07028 09100\n" +
        "G.3: 40408 78073\n" +
        "G.2: 33084\n" +
        "G.1: 62503\n" +
        "ĐB: 724638\n" +
        "--------------------\n\n" +
        "Đài: Bình Thuận\n" +
        "G.8: 94\n" +
        "G.7: 724\n" +
        "G.6: 3627 6863 6276\n" +
        "G.5: 5443\n" +
        "G.4: 19514 37345 78147 11910 87182 27466 79281\n" +
        "G.3: 35292 50589\n" +
        "G.2: 93542\n" +
        "G.1: 69019\n" +
        "ĐB: 282497\n"
      );
      break;
    case text === '/xsmt':
      bot.sendMessage(chatId, "Xổ số Miền Trung ngày 24/06 (Thứ Năm)\n" +
        "--------------------\n\n" +
        "Đài: Bình Định\n" +
        "G.8: 08\n" +
        "G.7: 070\n" +
        "G.6: 6457 6043 9635\n" +
        "G.5: 2989\n" +
        "G.4: 11783 40072 92544 26443 86295 33460 27961\n" +
        "G.3: 06744 23591\n" +
        "G.2: 01483\n" +
        "G.1: 90184\n" +
        "ĐB: 607212\n" +
        "--------------------\n\n" +
        "Đài: Quảng Trị\n" +
        "G.8: 18\n" +
        "G.7: 122\n" +
        "G.6: 8034 3833 5136\n" +
        "G.5: 6023\n" +
        "G.4: 68743 26853 90306 16698 59228 88897 76535\n" +
        "G.3: 09618 84409\n" +
        "G.2: 69045\n" +
        "G.1: 38921\n" +
        "ĐB: 353112\n" +
        "--------------------\n\n" +
        "Đài: Quảng Bình\n" +
        "G.8: 77\n" +
        "G.7: 896\n" +
        "G.6: 2169 3701 8637\n" +
        "G.5: 9246\n" +
        "G.4: 40267 75580 21900 80399 50231 52247 11907\n" +
        "G.3: 57156 17586\n" +
        "G.2: 36393\n" +
        "G.1: 98395\n" +
        "ĐB: 756673"
      );
      break;
    case text === 'huy':
      bot.sendMessage(chatId, 'Tôi có thể giúp bạn điều gì khác?');
      break;
    default:
      return bot.sendMessage(chatId, "Tôi là bot");
  }
});

bot.on('callback_query', (query) => {

  const chatId = query.message.chat.id

  switch (true) {
    case query.data === '/xsmb':
      bot.sendMessage(chatId, "Xổ số Miền Bắc ngày 24/06 (Thứ Năm)\n" +
        "--------------------\n" +

        "Đài: Hà Nội\n" +
        "ĐB: 17879\n" +
        "G1: 77328\n" +
        "G2: 12410 69282\n" +
        "G3: 95919 47894 54722 13959 12972 80067\n" +
        "G4: 4175 4355 0992 8562\n" +
        "G5: 6486 1704 8635 2385 9439 9824\n" +
        "G6: 844 819 537\n" +
        "G7: 22 96 35 52"
      );
      break;
    case query.data === '/xsmn':
      bot.sendMessage(chatId, "Xổ số Miền Nam ngày 24/06 (Thứ Năm)\n" +
        "--------------------\n\n" +
        "Đài: Tây Ninh\n" +
        "G.8: 75\n" +
        "G.7: 594\n" +
        "G.6: 3227 4065 6401\n" +
        "G.5: 3443\n" +
        "G.4: 30045 45287 99553 47630 07193 54646 38634\n" +
        "G.3: 18129 18318\n" +
        "G.2: 16369\n" +
        "G.1: 17044\n" +
        "ĐB: 337777\n" +
        "--------------------\n\n" +
        "Đài: An Giang\n" +
        "G.8: 68\n" +
        "G.7: 202\n" +
        "G.6: 6879 8278 5102\n" +
        "G.5: 9248\n" +
        "G.4: 60505 55934 68959 96715 56087 07028 09100\n" +
        "G.3: 40408 78073\n" +
        "G.2: 33084\n" +
        "G.1: 62503\n" +
        "ĐB: 724638\n" +
        "--------------------\n\n" +
        "Đài: Bình Thuận\n" +
        "G.8: 94\n" +
        "G.7: 724\n" +
        "G.6: 3627 6863 6276\n" +
        "G.5: 5443\n" +
        "G.4: 19514 37345 78147 11910 87182 27466 79281\n" +
        "G.3: 35292 50589\n" +
        "G.2: 93542\n" +
        "G.1: 69019\n" +
        "ĐB: 282497\n"
      );
      break;
    case query.data === '/xsmt':
      bot.sendMessage(chatId, "Xổ số Miền Trung ngày 24/06 (Thứ Năm)\n" +
        "--------------------\n\n" +
        "Đài: Bình Định\n" +
        "G.8: 08\n" +
        "G.7: 070\n" +
        "G.6: 6457 6043 9635\n" +
        "G.5: 2989\n" +
        "G.4: 11783 40072 92544 26443 86295 33460 27961\n" +
        "G.3: 06744 23591\n" +
        "G.2: 01483\n" +
        "G.1: 90184\n" +
        "ĐB: 607212\n" +
        "--------------------\n\n" +
        "Đài: Quảng Trị\n" +
        "G.8: 18\n" +
        "G.7: 122\n" +
        "G.6: 8034 3833 5136\n" +
        "G.5: 6023\n" +
        "G.4: 68743 26853 90306 16698 59228 88897 76535\n" +
        "G.3: 09618 84409\n" +
        "G.2: 69045\n" +
        "G.1: 38921\n" +
        "ĐB: 353112\n" +
        "--------------------\n\n" +
        "Đài: Quảng Bình\n" +
        "G.8: 77\n" +
        "G.7: 896\n" +
        "G.6: 2169 3701 8637\n" +
        "G.5: 9246\n" +
        "G.4: 40267 75580 21900 80399 50231 52247 11907\n" +
        "G.3: 57156 17586\n" +
        "G.2: 36393\n" +
        "G.1: 98395\n" +
        "ĐB: 756673"
      );
      break;
    case query.data === 'huy':
      return bot.sendMessage(chatId, 'Tôi có thể giúp bạn điều gì khác?')
  }
})