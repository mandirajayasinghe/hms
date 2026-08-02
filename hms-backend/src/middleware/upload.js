const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("../config/env");

const uploadDir = path.join(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
});