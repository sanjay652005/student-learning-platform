const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, TXT, and MD files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }
});

// Extract text from uploaded file
async function extractText(filePath, mimetype) {
  const content = fs.readFileSync(filePath);
  
  if (mimetype === 'application/pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(content);
      return data.text.trim();
    } catch (err) {
      console.error('PDF parse error:', err);
      return '';
    }
  }
  
  // Text files
  return content.toString('utf-8').trim();
}

module.exports = { upload, extractText };
