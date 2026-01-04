import mongoose from "mongoose";

const noteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // 📌 Title of study material
    title: {
      type: String,
      required: true,
    },

    // 📂 Uploaded file info
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

    // 🎓 Academic structure
    semester: {
      type: Number,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    

    // 📊 ANALYTICS
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

export default mongoose.model("Note", noteSchema);
