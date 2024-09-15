const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 4000;
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());

const generateID = () => Math.random().toString(36).substring(2, 10);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const database = [];

const ChatGPTFunction = async (text) => {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: text,
      },
    ],
    model: "llama3-8b-8192",
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    stream: true,
    stop: null,
  });
  let generatedContent = "";

    for await (const chunk of chatCompletion) {
      generatedContent += chunk.choices[0]?.delta?.content || "";
    }
  return generatedContent;
};

app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
  const {
    fullName,
    currentPosition,
    currentLength,
    currentTechnologies,
    workHistory,
  } = req.body;

  const workArray = JSON.parse(workHistory);
  const newEntry = {
    id: generateID(),
    fullName,
    image_url: `http://localhost:4000/uploads/${req.file.filename}`,
    currentPosition,
    currentLength,
    currentTechnologies,
    workHistory: workArray,
  };

  const prompt1 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I write in the technolegies: ${currentTechnologies}. Can you write a 100 words description for the top of the resume(first person writing)?`;

  const prompt2 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I write in the technolegies: ${currentTechnologies}. Can you write 10 points for a resume on what I am good at?`;

  const remainderText = () => {
    let stringText = "";
    for (let i = 0; i < workArray.length; i++) {
      stringText += ` ${workArray[i].name} as a ${workArray[i].position}.`;
    }
    return stringText;
  };

  const prompt3 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n During my years I worked at ${
    workArray.length
  } companies. ${remainderText()} \n Can you write me 50 words for each company seperated in numbers of my succession in the company (in first person)?`;

  const objective = await ChatGPTFunction(prompt1);
  const keypoints = await ChatGPTFunction(prompt2);
  const jobResponsibilities = await ChatGPTFunction(prompt3);

  const chatgptData = { objective, keypoints, jobResponsibilities };
  const data = { ...newEntry, ...chatgptData };
  database.push(data);

  res.json({
    message: "Request successful!",
    data,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
