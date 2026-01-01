import QuestionPaper from "../models/questionPaperModel.js";
import path from "path";
import fs from "fs";

/* =========================
   PUBLIC
   ========================= */

export const getQuestionPapers = async (req, res) => {
  try {
    const { search, year, subjectCode } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subjectCode: { $regex: search, $options: "i" } },
      ];
    }

    if (year) query.year = Number(year);
    if (subjectCode) query.subjectCode = subjectCode.toUpperCase();

    const papers = await QuestionPaper.find(query)
      .select("title year subjectCode createdAt user views downloads")
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestionPaperById = async (req, res) => {
  try {
    const paper = await QuestionPaper.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .select(
        "title year subjectCode createdAt user filePath fileType views downloads"
      )
      .populate("user", "name");

    if (!paper) {
      return res.status(404).json({ message: "Question paper not found" });
    }

    res.status(200).json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   PRIVATE
   ========================= */

export const getMyQuestionPapers = async (req, res) => {
  try {
    const papers = await QuestionPaper.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuestionPaper = async (req, res) => {
  try {
    const { title, year, subjectCode } = req.body;

    if (!title || !year || !subjectCode || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const paper = await QuestionPaper.create({
      user: req.user.id,
      title,
      year,
      subjectCode: subjectCode.toUpperCase(),
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
    });

    res.status(201).json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadQuestionPaper = async (req, res) => {
  try {
    const paper = await QuestionPaper.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!paper) {
      return res.status(404).json({ message: "Question paper not found" });
    }

    const absolutePath = path.join(
      process.cwd(),
      paper.filePath.replace(/^\/+/, "")
    );

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(absolutePath, paper.fileName);
  } catch (error) {
    res.status(500).json({ message: "Download failed" });
  }
};

export const deleteQuestionPaper = async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ message: "Question paper not found" });
    }

    if (paper.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await paper.deleteOne();
    res.status(200).json({ message: "Question paper deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



