import { useState,useEffect } from 'react';
import CirrusBot from './assets/CirrusBot.jpg';
import You1 from './assets/You1.png';
import SpeechRecognitionAlternative from'./SpeechRecognitionComponent'
import microphone from './assets/microphone.png';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  let recognition;

  function startSpeechRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.onresult = handleSpeechResult;
    recognition.onend = askNext;
    recognition.start();
  }
  function askNext() {
    document.querySelector('.generate-btn').click();
  }
  function handleSpeechResult(event) {
    const transcript = event.results[0][0].transcript;
    setUserInput(transcript);
  }
  async function askOpenAI() {
 
    if (userInput.trim() !== ''){
     
    fetch(`http://localhost:3000/askChatGPT?input=${userInput}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text(); // Assuming you're expecting text/plain response

    })
    .then(data => {
      console.log('Response from server:', data);
      setChatHistory(prevChatHistory => [
        ...prevChatHistory,
        { role: 'user', content: userInput },
        { role: 'bot', content: data }
      ]);
      // Handle the response data here
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });}
  }

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };
  const handleSubmit = async () => {
    await askOpenAI();
    setUserInput('');
  };

  useEffect(() => {
   
  }, [chatHistory]);

  return (
    <>
         <div className="chat-bot-container">
        <div className="chat-bot-header">
          <img src={CirrusBot} alt="Bot Logo" className="bot-logo" />
          <h1>NexA</h1>
          <p className="slogan"> ~ Signifying NEXT Platform Assistant</p>
        </div>
        <div className="chat-history" id="chatHistory">
          {chatHistory.map((entry, index) => (
            <div key={index} className={`message ${entry.role}`}>
              <img src={entry.role === 'user' ? You1 : CirrusBot} alt={entry.role === 'user' ? 'User Logo' : 'Bot Logo'} className="logo" />
              <p>{entry.content}</p>
            </div>
          ))}
        </div>
        <div className="user-input">
          <div className="input-container">
            <img src={You1} alt="User Logo" className="logo" />
            <input
              type="text"
              id="userInput"
              value={userInput}
              onChange={(e) => handleInputChange(e)}
            />
          <button className="speech-btn" onClick={startSpeechRecognition}>
          <img src={microphone} alt="Microphone Icon" />
        </button>
            {/* <SpeechRecognitionAlternative/> */}
          </div>
        </div>
        <button className="generate-btn" onClick={handleSubmit}>
          Ask Next
        </button>
      </div>
    </>
  );
}

export default App;
