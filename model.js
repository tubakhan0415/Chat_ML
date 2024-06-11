const { NlpManager } = require('node-nlp');
const fs = require('fs');

// Load intents file
const intents = JSON.parse(fs.readFileSync('intents.json', 'utf8'));

const manager = new NlpManager({ languages: ['en'] });

// Add intents to the model
intents.intents.forEach(intent => {
  intent.patterns.forEach(pattern => {
    manager.addDocument('en', pattern, intent.tag);
  });
  intent.responses.forEach(response => {
    manager.addAnswer('en', intent.tag, response);
  });
});

async function trainChatbot() {
  await manager.train();
  manager.save('model.nlp');
}

trainChatbot();
