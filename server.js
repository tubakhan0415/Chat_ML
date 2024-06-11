const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { loadModel, getResponse } = require('./chat');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Chatbot is running');
});

app.post('/predict', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send({ answer: 'No message provided' });
  }
  const response = await getResponse(message);
  res.send({ answer: response });
});

const PORT = process.env.PORT || 5000;

loadModel().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
