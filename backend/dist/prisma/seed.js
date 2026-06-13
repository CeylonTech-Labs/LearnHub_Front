import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { toSlug } from "../src/utils/slug.js";
const prisma = new PrismaClient();
async function main() {
    await prisma.$transaction([
        prisma.discussionReply.deleteMany(),
        prisma.discussion.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.review.deleteMany(),
        prisma.certificate.deleteMany(),
        prisma.assignmentSubmission.deleteMany(),
        prisma.assignment.deleteMany(),
        prisma.quizAttempt.deleteMany(),
        prisma.option.deleteMany(),
        prisma.question.deleteMany(),
        prisma.quiz.deleteMany(),
        prisma.lessonNote.deleteMany(),
        prisma.progress.deleteMany(),
        prisma.payment.deleteMany(),
        prisma.enrollment.deleteMany(),
        prisma.lesson.deleteMany(),
        prisma.section.deleteMany(),
        prisma.course.deleteMany(),
        prisma.category.deleteMany(),
        prisma.refreshToken.deleteMany(),
        prisma.setting.deleteMany(),
        prisma.user.deleteMany()
    ]);
    const [adminPassword, instructorPassword, studentPassword] = await Promise.all([
        bcrypt.hash("Admin@123", 12),
        bcrypt.hash("Instructor@123", 12),
        bcrypt.hash("Student@123", 12)
    ]);
    const superAdmin = await prisma.user.create({
        data: {
            firstName: "Super",
            lastName: "Admin",
            email: "admin@lms.com",
            password: adminPassword,
            role: "SUPER_ADMIN",
            status: "ACTIVE",
            emailVerified: true
        }
    });
    const instructors = await Promise.all([
        ["Asha", "Perera", "instructor@lms.com"],
        ["Marcus", "Silva", "marcus@lms.com"]
    ].map(([firstName, lastName, email]) => prisma.user.create({
        data: { firstName, lastName, email, password: instructorPassword, role: "INSTRUCTOR", status: "ACTIVE", emailVerified: true }
    })));
    const students = await Promise.all([
        ["Student", "Demo", "student@lms.com"],
        ["Nadia", "Fernando", "nadia@example.com"],
        ["Kamal", "Jay", "kamal@example.com"],
        ["Maya", "Stone", "maya@example.com"],
        ["Leo", "Brown", "leo@example.com"]
    ].map(([firstName, lastName, email]) => prisma.user.create({
        data: { firstName, lastName, email, password: studentPassword, role: "STUDENT", status: "ACTIVE", emailVerified: true }
    })));
    const categories = await Promise.all([
        ["Web Development", "Build modern web apps", "code"],
        ["Data Science", "Analyze data and build ML workflows", "chart"],
        ["Design", "UX, UI, and product design", "palette"],
        ["Business", "Operations, marketing, and finance", "briefcase"],
        ["Cloud Computing", "Deploy scalable cloud systems", "cloud"]
    ].map(([name, description, icon]) => prisma.category.create({ data: { name, slug: toSlug(name), description, icon } })));
    const titles = [
        "Next.js Full Stack Mastery",
        "TypeScript for Production Teams",
        "Practical UI Design Systems",
        "Node.js REST API Bootcamp",
        "Data Analytics with SQL",
        "Cloud Deployment Essentials",
        "React Query in Real Apps",
        "Product Management Foundations",
        "MySQL and Prisma Deep Dive",
        "Secure Authentication with JWT"
    ];
    for (let index = 0; index < titles.length; index += 1) {
        const title = titles[index];
        const instructor = instructors[index % instructors.length];
        const category = categories[index % categories.length];
        const course = await prisma.course.create({
            data: {
                title,
                slug: `${toSlug(title)}-${index + 1}`,
                description: `${title} is a complete hands-on course with projects, quizzes, assignments, and certificate-ready progress tracking.`,
                shortDescription: `A practical course for ${title.toLowerCase()}.`,
                thumbnail: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80`,
                price: index % 3 === 0 ? 0 : 49 + index * 10,
                discountPrice: index % 3 === 0 ? null : 39 + index * 8,
                level: ["BEGINNER", "INTERMEDIATE", "ADVANCED"][index % 3],
                duration: 420 + index * 35,
                status: "PUBLISHED",
                language: "English",
                learningOutcomes: ["Build portfolio-ready projects", "Understand production workflows", "Apply best practices"],
                prerequisites: ["Basic computer literacy", "Curiosity and consistency"],
                tags: ["lms", "career", "hands-on"],
                instructorId: instructor.id,
                categoryId: category.id
            }
        });
        for (let sectionIndex = 1; sectionIndex <= 3; sectionIndex += 1) {
            const section = await prisma.section.create({
                data: { courseId: course.id, title: `Module ${sectionIndex}: Core Concepts`, orderNumber: sectionIndex }
            });
            for (let lessonIndex = 1; lessonIndex <= 3; lessonIndex += 1) {
                await prisma.lesson.create({
                    data: {
                        courseId: course.id,
                        sectionId: section.id,
                        title: `Lesson ${sectionIndex}.${lessonIndex}: Guided Practice`,
                        content: "This lesson includes video notes, downloadable resources, and a short practice task.",
                        videoUrl: "https://storage.example.com/videos/sample.mp4",
                        pdfUrl: "https://storage.example.com/pdfs/sample.pdf",
                        lessonType: lessonIndex === 2 ? "PDF" : "VIDEO",
                        duration: 25,
                        isPreview: sectionIndex === 1 && lessonIndex === 1,
                        orderNumber: lessonIndex
                    }
                });
            }
        }
        const quiz = await prisma.quiz.create({
            data: {
                courseId: course.id,
                title: `${title} Knowledge Check`,
                description: "A short checkpoint quiz.",
                timeLimit: 20,
                passPercentage: 70,
                maxAttempts: 3,
                questions: {
                    create: [
                        {
                            questionText: "Which habit best supports course completion?",
                            questionType: "MCQ",
                            marks: 5,
                            options: {
                                create: [
                                    { optionText: "Consistent practice", isCorrect: true },
                                    { optionText: "Skipping exercises", isCorrect: false },
                                    { optionText: "Avoiding feedback", isCorrect: false }
                                ]
                            }
                        },
                        {
                            questionText: "Progress tracking helps students continue from the last lesson.",
                            questionType: "TRUE_FALSE",
                            marks: 5,
                            options: {
                                create: [
                                    { optionText: "True", isCorrect: true },
                                    { optionText: "False", isCorrect: false }
                                ]
                            }
                        }
                    ]
                }
            }
        });
        await prisma.assignment.create({
            data: {
                courseId: course.id,
                title: `${title} Capstone Task`,
                description: "Submit a project file or written reflection that demonstrates the course outcomes.",
                dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                totalMarks: 100
            }
        });
        const student = students[index % students.length];
        await prisma.enrollment.create({ data: { userId: student.id, courseId: course.id, progressPercentage: index % 2 ? 65 : 100, status: index % 2 ? "ACTIVE" : "COMPLETED", completedAt: index % 2 ? null : new Date() } });
        await prisma.review.create({ data: { userId: student.id, courseId: course.id, rating: 4 + (index % 2), comment: "Clear lessons, useful projects, and a polished learning flow." } });
        await prisma.payment.create({ data: { userId: student.id, courseId: course.id, amount: index % 3 === 0 ? 0 : 49 + index * 10, paymentMethod: "seed", paymentStatus: "SUCCESS", paidAt: new Date() } });
        if (index % 2 === 0) {
            await prisma.certificate.create({ data: { userId: student.id, courseId: course.id, certificateCode: `CERT-SEED-${index + 1}` } });
        }
        await prisma.discussion.create({ data: { courseId: course.id, userId: student.id, title: "How should I approach the project?", message: "I would love guidance on structuring the final submission." } });
        await prisma.quizAttempt.create({ data: { quizId: quiz.id, userId: student.id, score: 84, status: "PASSED", submittedAt: new Date(), answers: {} } });
    }
    await prisma.setting.createMany({
        data: [
            { key: "siteName", value: "LearnHub" },
            { key: "currency", value: "USD" },
            { key: "contactEmail", value: "support@learnhub.local" },
            { key: "maintenanceMode", value: false },
            { key: "terms", value: "Use LearnHub responsibly." },
            { key: "privacy", value: "Student data is protected by role-based access." }
        ]
    });
    await prisma.notification.create({
        data: {
            userId: superAdmin.id,
            title: "Seed complete",
            message: "LearnHub sample data is ready.",
            type: "SYSTEM"
        }
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
