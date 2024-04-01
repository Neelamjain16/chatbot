// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// Importing the @azure/search-documents library
const { SearchIndexClient, AzureKeyCredential } = require("@azure/search-documents");

// Importing the @azure/openai library
const { OpenAIClient } = require("@azure/openai");

// npm install dotenv
// Importing the index definition and sample data
// const hotelData = JSON.parse(fs.readFileSync("./user_activities.json"));
// const indexDefinition = JSON.parse(fs.readFileSync("./user_activies_index.json"));

// Load the .env file if it exists
require("dotenv").config();

// Getting search endpoint, search admin Key, Azure OpenAI endpoint, Azure API Key, and chat deployment id from .env file
const azureSearchEndpoint = process.env.SEARCH_API_ENDPOINT || "";
const azureSearchAdminKey = process.env.SEARCH_API_KEY || "";
const azureApiKey = process.env.AZURE_API_KEY || "";
const openAiEndpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const chatDeploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID || "";

async function main() {
  console.log(`Running Azure Cognitive Search Javascript quickstart...`);
  if (!azureSearchEndpoint || !azureSearchAdminKey || !azureApiKey || !openAiEndpoint || !chatDeploymentId) {
    console.log("Make sure to set valid values for azureSearchEndpoint, azureSearchAdminKey, azureApiKey, openAiEndpoint, and chatDeploymentId with proper authorization.");
    return;
  }

  // Creating an index client to create the search index
  const indexClient = new SearchIndexClient(azureSearchEndpoint, new AzureKeyCredential(azureSearchAdminKey));

  // Getting the name of the index from the index definition
  const indexName = "genaipoc-index";

  console.log("Checking if index exists...");
  const indexExists = await doesIndexExist(indexClient, indexName);

  if (!indexExists) {
    console.log("Creating index...");
    let index = await indexClient.createIndex(indexDefinition);
    console.log(`Index named ${index.name} has been created.`);
  
  // Creating a search client to upload documents and issue queries
  const searchClient = indexClient.getSearchClient(indexName);

  console.log("Uploading documents...");
  let indexDocumentsResult = await searchClient.mergeOrUploadDocuments(hotelData["value"]);
  console.log(`Index operations succeeded: ${JSON.stringify(indexDocumentsResult.results[0].succeeded)} `);

  // send example question to open AI instance
  // const exampleQuestions = [
  //   {
  //     role: "user",
  //     content: "Give me Mary data",
  //   }
  // ];

  // console.log(`Asking ChatGPT: ${exampleQuestions[0].content}`);
  // console.log();
  // const chatAnswer = await askOpenAI(indexName, exampleQuestions);
  // console.log(`ChatGPT answer: ${chatAnswer}`);
} else {
  console.log(`Index named ${indexName} already exists. Skipping index creation.`);
}

}

async function doesIndexExist(indexClient, indexName) {
  try {
    // Attempt to get the index
    await indexClient.getIndex(indexName);
    return true; // Index exists
  } catch {
    return false; // Index does not exist
  }
}

// index.js
// ... (existing code) ...

async function askOpenAI(azureSearchIndexName, messages) {
  const client = new OpenAIClient(openAiEndpoint, new AzureKeyCredential(azureApiKey));
//   console.log(client); // Log the client object to inspect its properties

  const events = client.listChatCompletions(chatDeploymentId, messages, {
    // maxTokens: 500,
    azureExtensionOptions: {
      extensions: [
        {
          type: "AzureCognitiveSearch",
          parameters: {
            endpoint: azureSearchEndpoint,
            key: azureSearchAdminKey,
            indexName: azureSearchIndexName,
          },
        },
      ],
    },
  });

  let chatGptAnswer = "";
  for await (const event of events) {
    for (const choice of event.choices) {
      const newText = choice.delta?.content;
      if (!!newText) {
        // Remove the document reference [docX]
        // const cleanedText = newText.replace(/\[doc\d+\]/g, '');
        const cleanedText = newText.replace(/\[.*?\]/g, '').replace(/[, ]+/g, ' ').replace(/]$/, '');
        chatGptAnswer += cleanedText;
      }
//       if (!!newText) {
//     // Remove the document reference [docX]
//     // Also, clean names of any person
//     const cleanedText = newText
//         .replace(/\[.*?\]/g, '') // Remove document references
//         .replace(/[, ]+/g, '')   // Normalize spaces
//         .replace(/]$/, '');        // Remove trailing brackets
//         // .replace(/\b[A-Z][a-z]+\b/g, '***'); // Replace single-word names of any person with asterisks
//     chatGptAnswer += cleanedText;
// }
 
    }
  }

  // Store the conversation in chat history
  // chatHistory.push({ user: messages[0].content, chatGPT: chatGptAnswer });

  return chatGptAnswer;
}

// ... (existing code) ...


// main().catch((err) => {
//   console.error("The sample encountered an error:", err);
// });

module.exports = { main, askOpenAI };