import multer from "multer";
import path from "path";

// Storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/\s+/g, "")}`
    );
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, DOC, DOCX, PPT, PPTX files are allowed")
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
});

export default upload;

