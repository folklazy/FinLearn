import { Router, Request, Response } from 'express';
import { LESSONS, LESSON_CATEGORIES } from '../data/lessons';
import { LESSONS_EN } from '../data/lessonsEn';

const router = Router();

// GET /api/lessons — all lessons (summary only)
router.get('/', (_req: Request, res: Response) => {
    const summaries = LESSONS.map(({ sections, quiz, ...rest }) => {
        const en = LESSONS_EN[rest.id];
        return { ...rest, descriptionEn: en?.descriptionEn || rest.descriptionEn };
    });
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
    const en = LESSONS_EN[lesson.id];
    if (en) {
        const merged = {
            ...lesson,
            descriptionEn: en.descriptionEn,
            keyTakeawaysEn: en.keyTakeawaysEn,
            sections: lesson.sections.map((s, i) => ({
                ...s,
                headingEn: en.sections[i]?.headingEn || s.headingEn,
                contentEn: en.sections[i]?.contentEn || s.contentEn,
            })),
            quiz: lesson.quiz?.map((q, i) => ({
                ...q,
                questionEn: en.quiz?.[i]?.questionEn || q.questionEn,
                optionsEn: en.quiz?.[i]?.optionsEn || q.optionsEn,
            })),
        };
        res.json(merged);
    } else {
        res.json(lesson);
    }
});

export default router;
