const VkBot = require('node-vk-bot-api');
const bot = new VkBot('a3de365266543a4ccc85f8cf88b1e01c84c3c6ca0a1e03e618583636a19170b0ea7f178dcdc436cdd7735');
const fs = require('fs');
let jsonData = require('./data.json');

bot.on((answer) => { 
  let userId = answer.message.from_id;
  let conversationId = answer.message.peer_id;
  let message = answer.message;

  //info
  if (message.text == '/info') {
    return answer.reply('Привет.&#9996; Я могу помочь огранизовать мероприятие. Могу сделать шаблон пригашения и уведомить всех участников мероприятия.\n' + 
                 'Чтобы создать мероприятие используйте команду:\n &#9194;/add event: название мероприятия, дата, время, место, бюджет, список приглашенных&#9193;.');
  }

  //если message.text соответствует регулярке то парсим строку
  if (/\/add event: [А-Яа-яA-Za-z0-9| ]+, [0-9|.| ]+, [0-9|:|.| ]+, [А-Яа-яA-Za-z0-9| ]+, [0-9]+, [А-Яа-яA-Za-z| ]+/.test(message.text)) {
    let stringParseArr = stringParse(message.text); //массив из строки
    writeToJsonFile(createJsonTemplate(stringParseArr, conversationId));
    return answer.reply(buildResultStr(stringParseArr));
  }

  // список мероприятий
  if (message.text == '/events') {
    let resultStr = "";
    for (let i = 0; i < jsonData.conversations_table.length; i++) {
      if (jsonData.conversations_table[i].conversation_id == conversationId) {
        for (let j = 0; j < jsonData.conversations_table[i].events.length; j++) {
          resultStr += jsonData.conversations_table[i].events[j].event_name + "\n";
        }
      }
    }
    return answer.reply(resultStr);
  }


  // if (message.text == commands[1]) {
  //   bot.execute('users.get', {user_ids: userId}).then(res => {
  //     return answer.reply(res[0].first_name + ', сам(а) такой');
  //   });
  // }

  // if (message.text == commands[2]) {
  //   bot.execute('messages.getConversationMembers', {peer_id: conversationId}).then(res => {
  //     let resultNamesStr = "";

  //     for (let i = 0; i < res.profiles.length; i++) {
  //       resultNamesStr += `${res.profiles[i].first_name} ${res.profiles[i].last_name} \n`;
  //     }

  //     return answer.reply(`Участники беседы:\n ${resultNamesStr}`);
  //   });
  // }

  // if (message.text == commands[3]) {
  //   bot.execute('users.get', {user_ids: userId}).then(res => {
  //     bot.sendMessage(conversationId, res[0].first_name + ' говорит, что вы лох');
  //   });
  // }

  // if (message.text == commands[4]) {
  //    return answer.reply('реально');
  // }

  // // if (commands.indexOf(message.text) == -1) {
  // //   return answer.reply(`шо епта?`);
  // // }
});

//парсим входную строку и выкидываем массив
function stringParse(inputString) {
  let arr = inputString.split(',');
  arr[0] = arr[0].slice(arr[0].lastIndexOf(':'));
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].slice(1); 
  }
  return arr;
}

//построитель выходной строки
function buildResultStr(arr) {
  let explanatoryArray = ['Мероприятие: ', 'Дата: ', 'Время: ', 'Место: ', 'Бюджет: ', 'Приглашены: '];
  let resultStr = "";
  for (let i = 0; i < arr.length; i++) {
    resultStr += explanatoryArray[i] + arr[i] + '\n';
  }
  return resultStr;
}

//создание шаблона json
function createJsonTemplate(arr, conversationId) {
  let data = {
    'conversations_table': [
      {    
        'conversation_id': conversationId,
        'events': [
          {
            "event_name": arr[0],
            "description": {
              "date": arr[1], 
              "time": arr[2], 
              "place": arr[3], 
              "budget": arr[4],
              "people": arr[5],
            }
          }
        ]        
      }
    ],
  };
  return data;
}

//запись в json файл
//newData - шаблон json
function writeToJsonFile(newData) {
  const fs = require('fs');
  let currentConversationId = newData.conversations_table[0].conversation_id;
  let currenEventName = newData.conversations_table[0].events[0].event_name;

  if (!Object.keys(jsonData).length > 0) {
    jsonData = newData;
  } else {
    for (let i = 0; i < jsonData.conversations_table.length; i++) {
      if (jsonData.conversations_table[i].conversation_id == currentConversationId) {
        if (jsonData.conversations_table[i].events[0].event_name == currenEventName) {
          console.log('same event');
          //вывести информацию о событии
        } else {
          jsonData.conversations_table[i].events.push(newData.conversations_table[0].events[0]);
        }
      } else {
        jsonData.conversations_table.push(newData.conversations_table[0]);
      }
    }
  }
  fs.writeFileSync('data.json', JSON.stringify(jsonData) + "\n");
}

//старт бота
bot.startPolling(() => {
  console.log('Bot started');
});