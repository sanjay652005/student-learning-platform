import Note from "../models/noteModel.js";

/* ============================
   🔓 PUBLIC — SEARCH & PREVIEW
   ============================ */

// GET all study materials (search + filters)
export const getNotes = async (req, res) => {
  try {
    const { search, semester, subjectCode } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subjectCode: { $regex: search, $options: "i" } },
      ];
    }

    if (semester) query.semester = Number(semester);
    if (subjectCode) query.subjectCode = subjectCode.toUpperCase();

    const materials = await Note.find(query)
      .select("title semester subjectCode createdAt user views downloads")
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    console.error("getNotes error:", error);
    res.status(500).json({ message: "Failed to load study materials" });
  }
};

// GET single study material (increment views)
export const getNoteById = async (req, res) => {
  try {
    const material = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .select(
        "title semester subjectCode createdAt user views downloads fileName fileType"
      )
      .populate("user", "name");

    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    res.status(200).json(material);
  } catch (error) {
    console.error("getNoteById error:", error);
    res.status(500).json({ message: "Failed to load study material" });
  }
};

/* ============================
   🔒 PROTECTED — USER ACTIONS
   ============================ */

// GET logged-in user's study materials
export const getMyNotes = async (req, res) => {
  try {
    const materials = await Note.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    console.error("getMyNotes error:", error);
    res.status(500).json({ message: "Failed to load your materials" });
  }
};

// CREATE study material
export const createNote = async (req, res) => {
  try {
    const { title, semester, subjectCode, fileName, filePath, fileType } =
      req.body;

    if (!title || !semester || !subjectCode || !fileName || !filePath) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const material = await Note.create({
      user: req.user._id,
      title,
      semester,
      subjectCode: subjectCode.toUpperCase(),
      fileName,
      filePath,
      fileType,
    });

    res.status(201).json(material);
  } catch (error) {
    console.error("createNote error:", error);
    res.status(500).json({ message: "Failed to create study material" });
  }
};

// DOWNLOAD study material
export const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Study material not found" });
    }

    if (!note.filePath) {
      return res.status(400).json({ message: "File not available for download" });
    }

    // increment downloads count
    note.downloads += 1;
    await note.save();

    // send file
    res.download(note.filePath, note.fileName);
  } catch (error) {
    console.error("downloadNote error:", error);
    res.status(500).json({ message: "Failed to download study material" });
  }
};

// DELETE study material
export const deleteNote = async (req, res) => {
  try {
    const material = await Note.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    if (material.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await material.deleteOne();
    res.status(200).json({ message: "Study material deleted successfully" });
  } catch (error) {
    console.error("deleteNote error:", error);
    res.status(500).json({ message: "Failed to delete study material" });
  }
};
