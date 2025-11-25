# Week 2 — Guest Browsing + Student Learning MVP

Goal: complete the main learning entry flow (browse → search → enroll → view lessons).

## Guest + Public Features
- Homepage (public): show latest courses, categories, trending tags.
- Course List: filter by category/tag; show course cards (title, instructor, difficulty); decide pagination vs infinite scroll.
- Course Detail: overview, tags, instructor info, student count; lock lessons/quizzes for guests with subscribe prompt.
- Search: full-text search across title, summary, tags.
- Public Navigation: navbar (Home, Courses, Login/Signup).

## Student Features
- Enroll / Unenroll: enforce budget; unenroll from “My Courses”.
- Lesson Viewer (text + video): lesson list after enrollment; render text/PDF slides + embedded video.
- Student Dashboard:
  - List enrolled courses.
  - Course status (in-progress / completed).
  - Completion % = completed lessons / total lessons.
  - Suggested courses (based on history/interests, if feasible).
  - Budget with bonus credits: award credits for high-performance courses (e.g., ≥90/100 or strong participation); credits usable for future course payments.

## Notes
- Keep auth/role model consistent with Week 1 (AT/RT flow, roles).
- Add minimal backend endpoints to power listings, search, enrollment, lessons, and dashboard metrics.
- Prefer reusable UI components and follow existing layout/theme.***
