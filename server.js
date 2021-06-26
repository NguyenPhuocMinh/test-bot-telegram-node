const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const lodash = require('lodash');
const { forOwn } = lodash;
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const URL = process.env.URL; // ngrok http 3000
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

bot.on('message', async (msg) => {

  const chatId = msg.chat.id;
  const text = msg.text;

  const dateMoment = moment(new Date(msg.date * 1000)).subtract(1, 'days');

  const html = await getFetch(text, dateMoment.format('DD-MM-YYYY'));
  const $ = cheerio.load(html);

  const daysOfWeek = $('body > main > div > div.content-left > section > header > div > a:nth-child(2)').text().slice(5);

  const scrapedData = [];
  const tableHeaders = [];
  const tableNameHeader = [];

  $(".table-result > tbody > tr").each((index, element) => {
    $('.table-result > thead > tr').each((i, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
          tableNameHeader.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');
    tableRow[tableNameHeader[0]] = $(element).find('th').text();

    $(tds).each((iTd, eTd) => {
      tableRow[tableHeaders.reverse()[iTd]] = $(eTd).text();
    })

    scrapedData.push(tableRow);
  });

  const testHtml = generateTable(scrapedData);

  switch (true) {
    case text === '/start':
      bot.sendMessage(chatId,
        `Chào mừng bạn đến với [xoso.com.vn](https://xoso.com.vn)` +
        ` dịch vụ cá cược trực tuyến hàng đầu với hàng trăm sản phẩm cược hấp dẫn\nHãy để BOT xoso.com.vn` +
        ` phục vụ quý khách hàng những lệnh sau:\n\n` +
        `  /xs (kiểm tra kết quả sổ số ba miền)\n` +
        `  /xsmn ${dateMoment.format('DD-MM-YYYY')} (kiểm tra kết quả sổ số miền nam ngày bất kì)\n` +
        `  /xsmb ${dateMoment.format('DD-MM-YYYY')} (kiểm tra kết quả sổ số miền bắc ngày bất kì)\n` +
        `  /xsmt ${dateMoment.format('DD-MM-YYYY')} (kiểm tra kết quả sổ số miền trung ngày bất kì)`,
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
      bot.sendMessage(chatId, `Xổ số Miền Bắc ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${testHtml}`,
        { parse_mode: 'Markdown' }
      )
      break;
    case text === '/xsmn':
      bot.sendMessage(chatId, `Xổ số Miền Nam ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${testHtml}`,
        { parse_mode: 'Markdown' }
      );
      break;
    case text === '/xsmt':
      bot.sendMessage(chatId, `Xổ số Miền Trung ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${testHtml}`,
        { parse_mode: 'Markdown' }
      );
      break;
    case text === 'huy':
      bot.sendMessage(chatId, 'Tôi có thể giúp bạn điều gì khác?');
      break;
  }
});

bot.on('callback_query', async (query) => {

  const dateMoment = moment(new Date(msg.date * 1000)).subtract(1, 'days');

  const html = await getFetch(text, dateMoment.format('DD-MM-YYYY'));
  const $ = cheerio.load(html);

  const daysOfWeek = $('.header-time').text().slice(8, 18).trim();

  const scrapedData = [];
  const tableHeaders = [];
  const tableNameHeader = [];

  $(".table-result > tbody > tr").each((index, element) => {
    $('.table-result > thead > tr').each((i, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
          tableNameHeader.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');
    tableRow[tableNameHeader[0]] = $(element).find('th').text();

    $(tds).each((iTd, eTd) => {
      tableRow[tableHeaders.reverse()[iTd]] = $(eTd).text();
    })

    scrapedData.push(tableRow);
  });

  const chatId = query.message.chat.id

  switch (true) {
    case query.data === '/xsmb':
      bot.sendMessage(chatId, `Xổ số Miền Bắc ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${testHtml}`,
        { parse_mode: 'Markdown' }
      )
      break;
    case query.data === '/xsmn':
      bot.sendMessage(chatId, `Xổ số Miền Nam ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${testHtml}`,
        { parse_mode: 'Markdown' }
      );
      break;
    case query.data === '/xsmt':
      bot.sendMessage(chatId, `Xổ số Miền Trung ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${testHtml}`,
        { parse_mode: 'Markdown' }
      );
      break;
    case query.data === 'huy':
      return bot.sendMessage(chatId, 'Tôi có thể giúp bạn điều gì khác?')
  }
});

bot.onText(/\/xsmb (.+)/, async (msg, match) => {

  const dateValid = checkValidDateInput(match[1]);

  const chatId = msg.chat.id;

  const dateMatched = dateValid ? match[1] : '';
  const dateMoment = moment(new Date(match[1]));

  const html = await getFetch('/xsmb', dateMatched);
  const $ = cheerio.load(html);

  const daysOfWeek = $('.header-time').text().slice(8, 18).trim();

  const scrapedData = [];
  const tableHeaders = [];
  const tableNameHeader = [];

  $(".table-result > tbody > tr").each((index, element) => {
    $('.table-result > thead > tr').each((i, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
          tableNameHeader.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');
    tableRow[tableNameHeader[0]] = $(element).find('th').text();

    $(tds).each((iTd, eTd) => {
      tableRow[tableHeaders.reverse()[iTd]] = $(eTd).text();
    })

    scrapedData.push(tableRow);
  });

  // const testHtml = generateTable(scrapedData);

  bot.sendMessage(chatId, `Xổ số Miền Bắc ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
    "--------------------\n\n" +
    `${JSON.stringify(scrapedData)}`,
    { parse_mode: 'Markdown' }
  )
})

bot.onText(/\/xsmn (.+)/, async (msg, match) => {

  const dateValid = checkValidDateInput(match[1]);

  const chatId = msg.chat.id;

  const dateMoment = dateValid ? match[1] : '';

  const html = await getFetch('/xsmb', dateMoment);
  const $ = cheerio.load(html);

  const daysOfWeek = $('.header-time').text().slice(8, 18).trim();

  const scrapedData = [];
  const tableHeaders = [];
  const tableNameHeader = [];

  $(".table-result > tbody > tr").each((index, element) => {
    $('.table-result > thead > tr').each((i, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
          tableNameHeader.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');
    tableRow[tableNameHeader[0]] = $(element).find('th').text();

    $(tds).each((iTd, eTd) => {
      tableRow[tableHeaders.reverse()[iTd]] = $(eTd).text();
    })

    scrapedData.push(tableRow);
  });

  const testHtml = generateTable(scrapedData);

  bot.sendMessage(chatId, `Xổ số Miền Bắc ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
    "--------------------\n\n" +
    `${testHtml}`,
    { parse_mode: 'Markdown' }
  )
});

bot.onText(/\/xsmt (.+)/, async (msg, match) => {

  const dateValid = checkValidDateInput(match[1]);

  const chatId = msg.chat.id;

  const dateMoment = dateValid ? match[1] : '';

  const html = await getFetch('/xsmb', dateMoment);
  const $ = cheerio.load(html);

  const daysOfWeek = $('.header-time').text().slice(8, 18).trim();

  const scrapedData = [];
  const tableHeaders = [];
  const tableNameHeader = [];

  $(".table-result > tbody > tr").each((index, element) => {
    $('.table-result > thead > tr').each((i, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
          tableNameHeader.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');
    tableRow[tableNameHeader[0]] = $(element).find('th').text();

    $(tds).each((iTd, eTd) => {
      tableRow[tableHeaders.reverse()[iTd]] = $(eTd).text();
    })

    scrapedData.push(tableRow);
  });

  const testHtml = generateTable(scrapedData);

  bot.sendMessage(chatId, `Xổ số Miền Bắc ngày ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
    "--------------------\n\n" +
    `${testHtml}`,
    { parse_mode: 'Markdown' }
  )
});

async function getFetch(text, dateMoment) {
  return fetch(`https://xoso.com.vn${text}-${dateMoment}.html`).then(res => res.text())
};

function checkValidDateInput(dateMatch) {
  const regex = new RegExp(/^([0-2][0-9]|(3)[0-1])(\-)(((0)[0-9])|((1)[0-2]))(\-)\d{4}$/i);
  return regex.test(dateMatch);
}

function generateTable(data) {
  var html = '';

  if (typeof (data[0]) === 'undefined') {
    return null;
  }

  if (data[0].constructor === String) {
    html += '<tr>\r\n';
    for (var item in data) {
      html += '<td>' + data[item] + '</td>\r\n';
    }
    html += '</tr>\r\n';
  }

  if (data[0].constructor === Array) {
    for (var row in data) {
      html += '<tr>\r\n';
      for (var item in data[row]) {
        html += '<td>' + data[row][item] + '</td>\r\n';
      }
      html += '</tr>\r\n';
    }
  }

  if (data[0].constructor === Object) {
    for (var row in data) {
      html += '<tr>\r\n';
      for (var item in data[row]) {
        html += '<td>' + item + ':' + data[row][item] + '</td>\r\n';
      }
      html += '</tr>\r\n';
    }
  }

  return html;
}
