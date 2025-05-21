import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { exportCourse, generateCourse } from '../controllers/courseController';
import { validate } from '../middleware/validation';

const router = Router();

// Generate a new course
router.post(
  '/generate',
  [
    body('topic').trim().notEmpty().withMessage('Topic is required'),
    body('format').isIn(['txt', 'pdf']).withMessage('Invalid format'),
  ],
  validate,
  generateCourse
);

// Export a course
router.get(
  '/export/:id',
  [
    param('id').isMongoId().withMessage('Invalid course ID'),
    query('format').isIn(['txt', 'pdf']).withMessage('Invalid format'),
  ],
  validate,
  exportCourse
);

export default router;
