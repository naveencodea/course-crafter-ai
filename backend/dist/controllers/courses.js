"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.getCourse = exports.getCourses = exports.generateCourse = void 0;
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const promptEngine_1 = require("../utils/promptEngine");
const exporter_1 = require("../utils/exporter");
// Type guard for CourseData
function isCourseData(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'title' in data &&
        'description' in data &&
        'modules' in data &&
        Array.isArray(data.modules));
}
const EXPORTS_DIR = path_1.default.join(process.cwd(), 'exports');
// @desc    Generate a new course
// @route   POST /api/v1/courses
// @access  Private
const generateCourse = async (req, res, next) => {
    try {
        const { coursePrompt, format = 'txt' } = req.body;
        if (!coursePrompt?.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Course prompt is required'
            });
        }
        if (format !== 'txt' && format !== 'pdf') {
            return res.status(400).json({
                success: false,
                error: 'Invalid format. Must be either "txt" or "pdf"'
            });
        }
        // Generate course content using AI
        const courseContent = await (0, promptEngine_1.generateCourseContent)(coursePrompt);
        // Ensure the course content matches our expected format
        if (!isCourseData(courseContent)) {
            throw new Error('Invalid course data format received from AI');
        }
        const fileId = (0, uuid_1.v4)();
        let fileName;
        try {
            // Export based on format
            if (format === 'txt') {
                fileName = await (0, exporter_1.exportAsText)(courseContent, fileId);
            }
            else {
                fileName = await (0, exporter_1.exportAsPDF)(courseContent, fileId);
            }
        }
        catch (exportError) {
            console.error('Export error:', exportError);
            throw new Error('Failed to generate course file');
        }
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/exports/${fileName}`;
        // In a real app, you would save the course to the database here
        // const course = await Course.create({
        //   user: req.user?._id,
        //   title: courseData.title,
        //   description: courseData.description,
        //   fileUrl,
        //   fileId,
        //   format
        // });
        res.status(201).json({
            success: true,
            message: 'Course generated successfully',
            data: {
                fileUrl,
                fileId,
                title: courseContent.title,
                description: courseContent.description,
                modules: courseContent.modules.length
                // course
            }
        });
    }
    catch (error) {
        console.error('Generate course error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({
            success: false,
            error: 'Failed to generate course',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};
exports.generateCourse = generateCourse;
// @desc    Get all courses for logged in user
// @route   GET /api/v1/courses
// @access  Private
const getCourses = async (req, res, next) => {
    try {
        // In a real app, you would fetch courses from the database
        // const courses = await Course.find({ user: req.user.id });
        res.status(200).json({
            success: true,
            count: 0, // courses.length
            data: [] // courses
        });
    }
    catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.getCourses = getCourses;
// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Private
const getCourse = async (req, res, next) => {
    try {
        // const course = await Course.findById(req.params.id);
        // if (!course) {
        //   return res.status(404).json({ success: false, error: 'Course not found' });
        // }
        // // Make sure user owns the course
        // if (course.user.toString() !== req.user.id) {
        //   return res.status(401).json({ success: false, error: 'Not authorized to access this course' });
        // }
        res.status(200).json({
            success: true,
            data: {} // course
        });
    }
    catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.getCourse = getCourse;
// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
const updateCourse = async (req, res, next) => {
    try {
        // const course = await Course.findById(req.params.id);
        // if (!course) {
        //   return res.status(404).json({ success: false, error: 'Course not found' });
        // }
        // // Make sure user owns the course
        // if (course.user.toString() !== req.user.id) {
        //   return res.status(401).json({ success: false, error: 'Not authorized to update this course' });
        // }
        // const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
        //   new: true,
        //   runValidators: true
        // });
        res.status(200).json({
            success: true,
            data: {} // updatedCourse
        });
    }
    catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.updateCourse = updateCourse;
// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
const deleteCourse = async (req, res, next) => {
    try {
        // const course = await Course.findById(req.params.id);
        // if (!course) {
        //   return res.status(404).json({ success: false, error: 'Course not found' });
        // }
        // // Make sure user owns the course
        // if (course.user.toString() !== req.user.id) {
        //   return res.status(401).json({ success: false, error: 'Not authorized to delete this course' });
        // }
        // // Delete file from server
        // const filePath = path.join(EXPORTS_DIR, `${course.fileId}.${course.format}`);
        // if (fs.existsSync(filePath)) {
        //   fs.unlinkSync(filePath);
        // }
        // await course.remove();
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.deleteCourse = deleteCourse;
//# sourceMappingURL=courses.js.map