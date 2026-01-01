import mongoose from "mongoose";

const questionPaperSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    subjectCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    // 📂 Uploaded file info (FIX)
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },

    // 📊 Analytics
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QuestionPaper", questionPaperSchema);
