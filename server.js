const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Promise = require('bluebird');

require('dotenv').config();
Promise.config({
  cancellation: true
});

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

  const dateMoment = moment(new Date(msg.date * 1000)).utc().subtract(7, 'hours');

  const html = await getFetch(text, dateMoment);
  const $ = cheerio.load(html);

  let daysOfWeek = '';
  let radioName = '';
  if (text === '/xsmb') {
    daysOfWeek = $('header > h2 > a:nth-child(2)').text().slice(5);
    radioName = $('header > h2 > a:nth-child(4)').text()
  } else {
    daysOfWeek = $('body > main > div > div.content-left > section > header > div > a:nth-child(2)').text().slice(5);
  }

  const scrapedData = [];
  const tableHeaders = [];

  $(".table-result > tbody > tr").each((index, element) => {
    if (text === '/xsmb') {
      const th_mb = $(element).find('th');
      $(th_mb).each((i, itemTh) => {
        tableHeaders.push($(itemTh).text());
      });
    }

    $('.table-result > thead > tr').each((indexThead, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');

    if (text !== '/xsmb') {
      tableRow['G'] = $(element).find('th').text();
    }

    $(tds).each((iTd, eTd) => {
      if (text === '/xsmb') {
        tableRow[tableHeaders.reverse()[iTd]] = $(eTd).text();
      }
      tableRow[tableHeaders.filter(e => e !== 'G')[iTd]] = $(eTd).text();
    })
    scrapedData.push(tableRow);
  });

  const groupData = tableHeaders.filter(e => e !== 'G').map((item, index) => {
    let result = {};

    result.radio = item;
    result.item = [
      { key: scrapedData[0]['G'], value: scrapedData[0][item] },
      { key: scrapedData[1]['G'], value: scrapedData[1][item] },
      { key: scrapedData[2]['G'], value: scrapedData[2][item] },
      { key: scrapedData[3]['G'], value: scrapedData[3][item] },
      { key: scrapedData[4]['G'], value: scrapedData[4][item] },
      { key: scrapedData[5]['G'], value: scrapedData[5][item] },
      { key: scrapedData[6]['G'], value: scrapedData[6][item] },
      { key: scrapedData[7]['G'], value: scrapedData[7][item] },
      { key: scrapedData[8]['G'], value: scrapedData[8][item] },
    ]
    return result;
  });

  switch (true) {
    case text === '/start':
      bot.sendMessage(chatId,
        `Ch??o m???ng b???n ?????n v???i [xoso.com.vn](https://xoso.com.vn)` +
        ` d???ch v??? c?? c?????c tr???c tuy???n h??ng ?????u v???i h??ng tr??m s???n ph???m c?????c h???p d???n\nH??y ????? BOT xoso.com.vn` +
        ` ph???c v??? qu?? kh??ch h??ng nh???ng l???nh sau:\n\n` +
        `  /xs (ki???m tra k???t qu??? s??? s??? ba mi???n)\n` +
        `  /xsmn ${dateMoment.format('DD-MM-YYYY')} (ki???m tra k???t qu??? s??? s??? mi???n nam ng??y b???t k??)\n` +
        `  /xsmb ${dateMoment.format('DD-MM-YYYY')} (ki???m tra k???t qu??? s??? s??? mi???n b???c ng??y b???t k??)\n` +
        `  /xsmt ${dateMoment.format('DD-MM-YYYY')} (ki???m tra k???t qu??? s??? s??? mi???n trung ng??y b???t k??)`,
        {
          parse_mode: 'Markdown',
        }
      );
      break;
    case text === '/xs':
      bot.sendMessage(chatId, "Vui l??ng ch???n v??ng b???n mu???n xem k???t qu???",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Mi???n b???c',
                  callback_data: '/xsmb',
                }
              ],
              [
                {
                  text: 'Mi???n nam',
                  callback_data: '/xsmn',
                }
              ],
              [
                {
                  text: 'Mi???n trung',
                  callback_data: '/xsmt',
                }
              ],
              [
                {
                  text: 'Hu???',
                  callback_data: 'huy',
                }
              ]
            ]
          }
        }
      );
      break;
    case text === '/xsmb':
      bot.sendMessage(chatId, `X??? s??? Mi???n B???c ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `????i: ${radioName}\n` +
        `??B: ${scrapedData[1]['??B']}\n` +
        `G1: ${scrapedData[2]['1']}\n` +
        `G2: ${scrapedData[3]['2']}\n` +
        `G3: ${scrapedData[4]['3']}\n` +
        `G4: ${scrapedData[5]['4']}\n` +
        `G5: ${scrapedData[6]['5']}\n` +
        `G6: ${scrapedData[7]['6']}\n` +
        `G7: ${scrapedData[8]['7']}\n`
      )
      break;
    case text === '/xsmn':
      bot.sendMessage(chatId, `X??? s??? Mi???n Nam ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${groupData.map((element, index) => {
          return `????i: ${element.radio}\n` +
            `${element.item.map((e, index) => {
              return `${index === 8 ? '' : 'G.'}${e.key} : ${e.value}`
            }).join("\n")}\n` + "--------------------\n\n"
        }).join("\n")}`,
      );
      break;
    case text === '/xsmt':
      bot.sendMessage(chatId, `X??? s??? Mi???n Trung ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${groupData.map((element, index) => {
          return `????i: ${element.radio}\n` +
            `${element.item.map((e, index) => {
              return `${index === 8 ? '' : 'G.'}${e.key} : ${e.value}`
            }).join("\n")}\n` + "--------------------\n\n"
        }).join("\n")}`,
      );
      break;
    case text === 'huy':
      bot.sendMessage(chatId, 'T??i c?? th??? gi??p b???n ??i???u g?? kh??c?');
      break;
  }
});

bot.on('callback_query', async (query) => {

  const chatId = query.message.chat.id
  const text = query.data;

  const dateMoment = moment(new Date(query.message.date * 1000)).subtract(7, 'hours');

  let html = '';
  if (text !== 'huy') {
    html = await getFetch(text, dateMoment);
  }
  const $ = cheerio.load(html);

  let daysOfWeek = '';
  let radioName = '';
  if (text === '/xsmb') {
    daysOfWeek = $('header > h2 > a:nth-child(2)').text().slice(5);
    radioName = $('header > h2 > a:nth-child(4)').text()
  } else {
    daysOfWeek = $('body > main > div > div.content-left > section > header > div > a:nth-child(2)').text().slice(5);
  }

  const scrapedData = [];
  const tableHeaders = [];

  $(".table-result > tbody > tr").each((index, element) => {
    if (text === '/xsmb') {
      const th_mb = $(element).find('th');
      $(th_mb).each((i, itemTh) => {
        tableHeaders.push($(itemTh).text());
      });
    }

    $('.table-result > thead > tr').each((indexThead, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');

    if (text !== '/xsmb') {
      tableRow['G'] = $(element).find('th').text();
    }

    $(tds).each((iTd, eTd) => {
      if (text === '/xsmb') {
        tableRow[tableHeaders.reverse()[iTd]] = $(eTd).text();
      }
      tableRow[tableHeaders.filter(e => e !== 'G')[iTd]] = $(eTd).text();
    })
    scrapedData.push(tableRow);
  });

  const groupData = tableHeaders.filter(e => e !== 'G').map((item, index) => {
    let result = {};

    result.radio = item;
    result.item = [
      { key: scrapedData[0]['G'], value: scrapedData[0][item] },
      { key: scrapedData[1]['G'], value: scrapedData[1][item] },
      { key: scrapedData[2]['G'], value: scrapedData[2][item] },
      { key: scrapedData[3]['G'], value: scrapedData[3][item] },
      { key: scrapedData[4]['G'], value: scrapedData[4][item] },
      { key: scrapedData[5]['G'], value: scrapedData[5][item] },
      { key: scrapedData[6]['G'], value: scrapedData[6][item] },
      { key: scrapedData[7]['G'], value: scrapedData[7][item] },
      { key: scrapedData[8]['G'], value: scrapedData[8][item] },
    ]
    return result;
  });

  switch (true) {
    case query.data === '/xsmb':
      bot.sendMessage(chatId, `X??? s??? Mi???n B???c ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `????i: ${radioName}\n` +
        `??B: ${scrapedData[1]['??B']}\n` +
        `G1: ${scrapedData[2]['1']}\n` +
        `G2: ${scrapedData[3]['2']}\n` +
        `G3: ${scrapedData[4]['3']}\n` +
        `G4: ${scrapedData[5]['4']}\n` +
        `G5: ${scrapedData[6]['5']}\n` +
        `G6: ${scrapedData[7]['6']}\n` +
        `G7: ${scrapedData[8]['7']}\n`
      )
      break;
    case query.data === '/xsmn':
      bot.sendMessage(chatId, `X??? s??? Mi???n Nam ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${groupData.map((element, index) => {
          return `????i: ${element.radio}\n` +
            `${element.item.map((e, index) => {
              return `${index === 8 ? '' : 'G.'}${e.key} : ${e.value}`
            }).join("\n")}\n` + "--------------------\n\n"
        }).join("\n")}`,
      );
      break;
    case query.data === '/xsmt':
      bot.sendMessage(chatId, `X??? s??? Mi???n Trung ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
        "--------------------\n\n" +
        `${groupData.map((element, index) => {
          return `????i: ${element.radio}\n` +
            `${element.item.map((e, index) => {
              return `${index === 8 ? '' : 'G.'}${e.key} : ${e.value}`
            }).join("\n")}\n` + "--------------------\n\n"
        }).join("\n")}`,
      );
      break;
    case query.data === 'huy':
      return bot.sendMessage(chatId, 'T??i c?? th??? gi??p b???n ??i???u g?? kh??c?')
  }
});

bot.onText(/\/xsmb (.+)/, async (msg, match) => {

  const dateValid = checkValidDateInput(match[1]);

  const dateFormat = getDateMatched(match[1]);

  const chatId = msg.chat.id;

  const dateMoment = dateValid ? moment(new Date(dateFormat)) : null;

  const html = await getFetch('/xsmb', dateMoment);
  const $ = cheerio.load(html);

  const daysOfWeek = $('header > h2 > a:nth-child(2)').text().slice(5);
  const radioName = $('header > h2 > a:nth-child(4)').text()

  const scrapedData = [];
  const tableHeaders = [];

  $(".table-result > tbody > tr").each((index, element) => {
    const th_mb = $(element).find('th');
    $(th_mb).each((i, item) => {
      tableHeaders.push($(item).text());
    });

    const tableRow = {};
    const tds = $(element).find('td');

    $(tds).each((iTd, eTd) => {
      tableRow[tableHeaders.reverse()[iTd]] = $(eTd).text();
    })
    scrapedData.push(tableRow);
  });

  bot.sendMessage(chatId, `X??? s??? Mi???n B???c ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
    "--------------------\n\n" +
    `????i: ${radioName}\n` +
    `??B: ${scrapedData[1]['??B']}\n` +
    `G1: ${scrapedData[2]['1']}\n` +
    `G2: ${scrapedData[3]['2']}\n` +
    `G3: ${scrapedData[4]['3']}\n` +
    `G4: ${scrapedData[5]['4']}\n` +
    `G5: ${scrapedData[6]['5']}\n` +
    `G6: ${scrapedData[7]['6']}\n` +
    `G7: ${scrapedData[8]['7']}\n`
  )
})

bot.onText(/\/xsmn (.+)/, async (msg, match) => {

  const dateValid = checkValidDateInput(match[1]);

  const dateFormat = getDateMatched(match[1]);

  const chatId = msg.chat.id;

  const dateMoment = dateValid ? moment(new Date(dateFormat)) : null;

  const html = await getFetch('/xsmn', dateMoment);
  const $ = cheerio.load(html);

  const daysOfWeek = $('body > main > div > div.content-left > section > header > div > a:nth-child(2)').text().slice(5);

  const scrapedData = [];
  const tableHeaders = [];

  $(".table-result > tbody > tr").each((index, element) => {
    $('.table-result > thead > tr').each((indexThead, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');

    tableRow['G'] = $(element).find('th').text();

    $(tds).each((iTd, eTd) => {
      tableRow[tableHeaders.filter(e => e !== 'G')[iTd]] = $(eTd).text();
    })
    scrapedData.push(tableRow);
  });

  const groupData = tableHeaders.filter(e => e !== 'G').map((item, index) => {
    let result = {};

    result.radio = item;
    result.item = [
      { key: scrapedData[0]['G'], value: scrapedData[0][item] },
      { key: scrapedData[1]['G'], value: scrapedData[1][item] },
      { key: scrapedData[2]['G'], value: scrapedData[2][item] },
      { key: scrapedData[3]['G'], value: scrapedData[3][item] },
      { key: scrapedData[4]['G'], value: scrapedData[4][item] },
      { key: scrapedData[5]['G'], value: scrapedData[5][item] },
      { key: scrapedData[6]['G'], value: scrapedData[6][item] },
      { key: scrapedData[7]['G'], value: scrapedData[7][item] },
      { key: scrapedData[8]['G'], value: scrapedData[8][item] },
    ]
    return result;
  });

  bot.sendMessage(chatId, `X??? s??? Mi???n Nam ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
    "--------------------\n\n" +
    `${groupData.map((element, index) => {
      return `????i: ${element.radio}\n` +
        `${element.item.map((e, index) => {
          return `${index === 8 ? '' : 'G.'}${e.key} : ${e.value}`
        }).join("\n")}\n` + "--------------------\n\n"
    }).join("\n")}`,
  )
});

bot.onText(/\/xsmt (.+)/, async (msg, match) => {

  const dateValid = checkValidDateInput(match[1]);

  const dateMatch = getDateMatched(match[1]);

  const chatId = msg.chat.id;

  const dateMoment = dateValid ? moment(new Date(dateMatch)) : null;

  const html = await getFetch('/xsmt', dateMoment);
  const $ = cheerio.load(html);

  const daysOfWeek = $('body > main > div > div.content-left > section > header > div > a:nth-child(2)').text().slice(5);

  const scrapedData = [];
  const tableHeaders = [];

  $(".table-result > tbody > tr").each((index, element) => {


    $('.table-result > thead > tr').each((indexThead, eThead) => {
      if (index === 0) {
        const ths = $(eThead).find('th');
        $(ths).each((i, eTh) => {
          tableHeaders.push($(eTh).text());
        })
      }
    })

    const tableRow = {};
    const tds = $(element).find('td');
    tableRow['G'] = $(element).find('th').text();

    $(tds).each((iTd, eTd) => {
      tableRow[tableHeaders.filter(e => e !== 'G')[iTd]] = $(eTd).text();
    })
    scrapedData.push(tableRow);
  });

  const groupData = tableHeaders.filter(e => e !== 'G').map((item, index) => {
    let result = {};

    result.radio = item;
    result.item = [
      { key: scrapedData[0]['G'], value: scrapedData[0][item] },
      { key: scrapedData[1]['G'], value: scrapedData[1][item] },
      { key: scrapedData[2]['G'], value: scrapedData[2][item] },
      { key: scrapedData[3]['G'], value: scrapedData[3][item] },
      { key: scrapedData[4]['G'], value: scrapedData[4][item] },
      { key: scrapedData[5]['G'], value: scrapedData[5][item] },
      { key: scrapedData[6]['G'], value: scrapedData[6][item] },
      { key: scrapedData[7]['G'], value: scrapedData[7][item] },
      { key: scrapedData[8]['G'], value: scrapedData[8][item] },
    ]
    return result;
  });

  bot.sendMessage(chatId, `X??? s??? Mi???n Trung ng??y ${dateMoment.format('DD/MM')} (${daysOfWeek})\n` +
    "--------------------\n\n" +
    `${groupData.map((element, index) => {
      return `????i: ${element.radio}\n` +
        `${element.item.map((e, index) => {
          return `${index === 8 ? '' : 'G.'}${e.key} : ${e.value}`
        }).join("\n")}\n` + "--------------------\n\n"
    }).join("\n")}`,
  )
});

async function getFetch(text, dateMoment) {
  return fetch(`https://xoso.com.vn${text}-${dateMoment.format('DD-MM-YYYY')}.html`).then(res => res.text())
};

function getDateMatched(match) {
  return match.split("-").reverse().join("-");
};

function checkValidDateInput(dateMatch) {
  const regex = new RegExp(/^([0-2][0-9]|(3)[0-1])(\-)(((0)[0-9])|((1)[0-2]))(\-)\d{4}$/i);
  return regex.test(dateMatch);
};