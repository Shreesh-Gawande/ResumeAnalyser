import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

// Initialize Google Generative AI with API Key
const genAI = new GoogleGenerativeAI(process.env.API__KEY);
const fileManager = new GoogleAIFileManager(process.env.API__KEY);

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF and DOCX files are allowed.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Disable bodyParser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to use Multer
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
};

// Helper function to ensure upload directory exists
const ensureUploadDirectory = () => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Helper function to safely delete file
const safeDeleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    // Continue execution even if delete fails
  }
};

// API Handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ensure upload directory exists
  const uploadDir = ensureUploadDirectory();
  let tempFilePath = null;

  try {
    // Run Multer middleware to handle file upload
    await runMiddleware(req, res, upload.single('resume'));

    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Create a temporary file path
    tempFilePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);

    // Write the file to the filesystem
    fs.writeFileSync(tempFilePath, file.buffer);

    // Upload the file to Google Generative AI using the file path
    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.mimetype,
      displayName: file.originalname,
    });

    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

    // Generate content using the uploaded file
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    // Request analysis and summary
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: `
          Based on the provided resume, generate a detailed career progression path for the candidate.
          Please include:
          - Role titles (e.g., Junior Developer, Senior Developer, Tech Lead).
          - Recommended years of experience for each step (e.g., 0-2 years for Junior Developer).
          Provide the response as json objects so that i could map those to display each one of them  format with the following structure:
          just give this do not give any extra detail
          
            {
              "title": "Junior Developer",
              "experience": "0-2 years"
            },
            {
              "title": "Senior Developer",
              
              "experience": "3-5 years"
            },
            {
              "title": "Tech Lead",
              
              "experience": "5+ years"
            }
          
        `,
      },
    ]);

    // Get the generated text
    const generatedText = result.response.text();

    // Safely delete the temporary file
    safeDeleteFile(tempFilePath);

    // Respond with the generated summary
    res.status(200).json({
      message: 'File uploaded and analyzed successfully.',
      summary: generatedText,
    });
  } catch (error) {
    // Clean up the temporary file if it exists
    if (tempFilePath) {
      safeDeleteFile(tempFilePath);
    }

    console.error('Error processing the file:', error);
    res.status(500).json({ error: error.message });
  }
}