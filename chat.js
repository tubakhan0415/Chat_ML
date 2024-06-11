const { NlpManager } = require('node-nlp');
const manager = new NlpManager();

async function loadModel() {
  await manager.load('./model.nlp');
}

async function getResponse(message) {
  const response = await manager.process('en', message);
  return response.answer || 'For more details please visit <a href="https://www.f2fintech.com/index.html">this link</a>.';
}

module.exports = { loadModel, getResponse };
