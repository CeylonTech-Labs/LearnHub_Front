import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { ApiError, created, ok } from "../utils/apiResponse.js";

export async function createQuiz(req: Request, res: Response) {
  const quiz = await prisma.quiz.create({
    data: {
      courseId: req.body.courseId,
      title: req.body.title,
      description: req.body.description,
      timeLimit: req.body.timeLimit ?? 30,
      passPercentage: req.body.passPercentage ?? 70,
      maxAttempts: req.body.maxAttempts ?? 3,
      questions: {
        create:
          req.body.questions?.map((q: any) => ({
            questionText: q.questionText,
            questionType: q.questionType ?? "MCQ",
            marks: q.marks ?? 1,
            options: { create: q.options ?? [] }
          })) ?? []
      }
    },
    include: { questions: { include: { options: true } } }
  });
  return created(res, quiz, "Quiz created");
}

export async function quizzesByCourse(req: Request, res: Response) {
  return ok(res, await prisma.quiz.findMany({ where: { courseId: req.params.courseId }, include: { questions: { include: { options: true } } } }));
}

export async function startAttempt(req: Request, res: Response) {
  const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: req.params.quizId } });
  const attempts = await prisma.quizAttempt.count({ where: { quizId: quiz.id, userId: req.user!.id } });
  if (attempts >= quiz.maxAttempts) throw new ApiError(400, "Maximum attempts reached");
  return created(res, await prisma.quizAttempt.create({ data: { quizId: quiz.id, userId: req.user!.id } }), "Attempt started");
}

export async function submitAttempt(req: Request, res: Response) {
  const quiz = await prisma.quiz.findUniqueOrThrow({
    where: { id: req.params.quizId },
    include: { questions: { include: { options: true } } }
  });
  const answers = req.body.answers ?? {};
  let score = 0;
  let maxScore = 0;
  quiz.questions.forEach((question) => {
    maxScore += question.marks;
    const selected = Array.isArray(answers[question.id]) ? answers[question.id] : [answers[question.id]];
    const correct = question.options.filter((option) => option.isCorrect).map((option) => option.id).sort();
    if (JSON.stringify(selected.filter(Boolean).sort()) === JSON.stringify(correct)) score += question.marks;
  });
  const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const status = percent >= quiz.passPercentage ? "PASSED" : "FAILED";
  const attempt = await prisma.quizAttempt.update({
    where: { id: req.body.attemptId },
    data: { score: percent, status, answers, submittedAt: new Date() }
  });
  await prisma.notification.create({
    data: {
      userId: req.user!.id,
      title: "Quiz result",
      message: `You scored ${percent}% on ${quiz.title}`,
      type: "QUIZ_RESULT"
    }
  });
  return ok(res, attempt, "Quiz submitted");
}
