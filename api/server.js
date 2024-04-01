const express = require('express');
const { main, askOpenAI } = require('./index.js');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
// Serve static files from the current directory
app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());

app.get('/askChatGPT', async (req, res) => {
  try {
    const userInput = req.query.input;
    // console.log('User input:', userInput);
    // debugger;
    const exampleQuestions = [{
      role: 'user',
      content: userInput ,
    }];
 
    res.setHeader('Content-Type', 'text/plain');
    const chatAnswer = await askOpenAI('genaipoc-index', exampleQuestions);
   
    // console.log('Chat answer:', chatAnswer);
    
    res.send(chatAnswer); // Send the response data back to the client
  } catch (error) {
    console.error('Error in /askChatGPT:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/get-speech-token', async (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  const speechKey = process.env.AZURE_SPEECH_KEY || ' ';
  const speechRegion = process.env.AZURE_SPEECH_REGION || " ";
  // console.log(speechKey,speechRegion)
  if (!speechKey || !speechRegion) {
      res.status(400).send('You forgot to add your speech key or region to the .env file.');
      return
  } else {
      const headers = { 
          headers: {
              'Ocp-Apim-Subscription-Key': speechKey,
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      };

      try {
          const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
          res.send({ token: tokenResponse.data, region: speechRegion });
      } catch (err) {
          res.status(401).json('There was an error authorizing your speech key.');
      }
  }
});



app.listen(port, async () => {
  try {
    await main();
    console.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    console.error('Error starting the server:', error);
  }
});
