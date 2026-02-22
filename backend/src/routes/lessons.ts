import { Router, Request, Response } from 'express';
import { LESSONS, LESSON_CATEGORIES } from '../data/lessons';

const router = Router();

// GET /api/lessons — all lessons (summary only)
router.get('/', (_req: Request, res: Response) => {
    const summaries = LESSONS.map(({ sections, quiz, ...rest }) => rest);
    res.json({ categories: LESSON_CATEGORIES, lessons: summaries });
});

// GET /api/lessons/categories — lesson categories
router.get('/categories', (_req: Request, res: Response) => {
    res.json(LESSON_CATEGORIES);
});

// GET /api/lessons/:id — full lesson content
router.get('/:id', (req: Request, res: Response) => {
    const lesson = LESSONS.find(l => l.id === req.params.id);
    if (!lesson) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
    }
    res.json(lesson);
});

export default router;
