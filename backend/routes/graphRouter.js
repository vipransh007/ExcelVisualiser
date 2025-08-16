import { Router } from 'express';
import { getCommunityFeed, createChartFromCSV } from '../controller/graph.controller.js';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

router.route("/community-feed").get(getCommunityFeed);
router.route("/create-from-csv").post(upload.single('csvFile'), createChartFromCSV);

export default router;
