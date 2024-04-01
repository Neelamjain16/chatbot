


import React, { useState } from 'react';
import { Container } from 'reactstrap';
import { getTokenOrRefresh } from './token_util';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
  import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

// const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

export default function SpeechRecognitionComponent() { 
    const [displayText, setDisplayText] = useState('INITIALIZED: ready to test speech...');
    const [player, updatePlayer] = useState({p: undefined, muted: false});

    async function sttFromMic() {
        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = 'en-US';
        
        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        setDisplayText('speak into your microphone...');

        recognizer.recognizeOnceAsync(result => {
            if (result.reason === ResultReason.RecognizedSpeech) {
                setDisplayText(`RECOGNIZED: Text=${result.text}`);
            } else {
                setDisplayText('ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.');
            }
        });
    }

 


    return (
      <Container className="app-container">
          <div className="row main-container">
              <div className="col-6">
                
                  <button onClick={() => sttFromMic()}> talk</button>
                
              </div>
              <div className="col-6 output-display rounded">
                  <code>{displayText}</code>
              </div>
          </div>
      </Container>
  );

  }

