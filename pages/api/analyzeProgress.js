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

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// API Handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  ensureDirectoryExists(uploadsDir);

  try {
    // Run Multer middleware to handle file upload
    await runMiddleware(req, res, upload.single('resume'));

    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Create a temporary file path
    const tempFilePath = path.join(uploadsDir, file.originalname);

    try {
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
            Based on the provided resume, generate a detailed career analysis with the following structure:
            {
              "recommendation": {
                "role": "string",
                "description": "string",
                "matchScore": number,
                "keySkills": string[],
                "salary": {
                  "min": number,
                  "max": number,
                  "currency": "USD"
                }
              },
              "actionPlan": [
                {
                  "id": number,
                  "task": "string",
                  "completed": boolean,
                  "priority": "high" | "medium" | "low"
                }
              ],
              "careerProgress": {
                "currentStage": "string",
                "stageProgress": number,
                "nextMilestone": "string",
                "timeToNextLevel": "string"
              },
              "skillGaps": string[],
              "recommendedCourses": [
                {
                  "title": "string",
                  "provider": "string",
                  "duration": "string",
                  "level": "string"
                }
              ]
            }
            
            Ensure all responses strictly follow this JSON structure.
          `,
        },
      ]);

      const generatedText = result.response.text();

      // Clean up: Delete the temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      // Respond with the generated summary
      res.status(200).json({
        message: 'File uploaded and analyzed successfully.',
        summary: generatedText,
      });
    } catch (error) {
      // Clean up on error if the file exists
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error processing the file:', error);
    res.status(500).json({ error: error.message });
  }
}