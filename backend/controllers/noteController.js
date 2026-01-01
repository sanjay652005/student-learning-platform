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
    res.status(500).json({ message: error.message });
  }
};

// GET single study material (PUBLIC PREVIEW + VIEW COUNT)
export const getNoteById = async (req, res) => {
  try {
    const material = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .select(
        "title semester subjectCode createdAt user filePath fileType views downloads"
      )
      .populate("user", "name");

    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   🔒 PROTECTED — USER ACTIONS
   ============================ */

// ✅ FIXED: GET logged-in user's study materials
export const getMyNotes = async (req, res) => {
  try {
    const materials = await Note.find({
      user: req.user._id, // 🔥 FIX HERE
    }).sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE study material (upload)
export const createNote = async (req, res) => {
  try {
    const { title, semester, subjectCode } = req.body;

    if (!title || !semester || !subjectCode || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const material = await Note.create({
      user: req.user._id, // 🔥 FIX HERE
      title,
      semester,
      subjectCode: subjectCode.toUpperCase(),
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DOWNLOAD study material (PROTECTED + DOWNLOAD COUNT)
export const downloadNote = async (req, res) => {
  try {
    const material = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    res.download(`.${material.filePath}`, material.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE study material
export const deleteNote = async (req, res) => {
  try {
    const material = await Note.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    // 🔥 FIX HERE
    if (material.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await material.deleteOne();
    res.status(200).json({ message: "Study material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






