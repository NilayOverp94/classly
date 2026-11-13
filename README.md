# Classly — Learn Together. Grow Anywhere.

A modern, production-quality online tutoring marketplace connecting K-12 students in the United States with rigorously verified, experienced educators from India (and worldwide).

Inspired by Wyzant's proven marketplace model, designed from the ground up with an original, minimal, high-trust SaaS brand identity.

---

## 🎨 Brand Identity & Design System

- **Primary Color:** Deep Navy (`#183153`)
- **Secondary Color:** Soft Blue (`#EAF2FC`)
- **Accent Color:** Fresh Green (`#45A879`)
- **Background:** Off-white (`#FAFAF8`)
- **Text:** Dark Charcoal (`#242B35`)
- **Typography:** Inter sans-serif with natural weight hierarchy
- **Icons:** Lucide icons throughout (zero emojis in UI)

---

## 🚀 Built Pages & Routes

| Page | Route | Description |
|---|---|---|
| **Homepage** | `/` | Hero with live search, 8 popular subjects, featured tutors, 3-step walkthrough, why choose Classly, final CTA, sticky navbar & footer |
| **Find a Tutor** | `/tutors` | Discovery marketplace with real-time search, sidebar filters (subject, grade, price, experience, rating, format), sorting, and tutor listing cards |
| **Tutor Profile** | `/tutors/[id]` | Full educator profile with degree credentials, methodology, availability calendar, video intro preview, reviews, and 1-on-1 vs group booking |
| **How It Works** | `/how-it-works` | Step-by-step walkthrough for families & educators, safety standards, and guarantees |
| **Become a Tutor** | `/become-a-tutor` | Teacher recruitment page, interactive earnings calculator, and 4-step teacher application wizard |
| **Teacher Registration** | `/register/teacher` | Teacher onboarding redirect to the application wizard |
| **Login** | `/login` | Role-based login (Student/Parent, Teacher, Admin) with 1-click demo buttons |
| **Student Registration** | `/register/student` | Parent-supervised student registration with COPPA consent workflows |
| **Student Dashboard** | `/dashboard/student` | Upcoming lessons with 1-click live classroom join, lesson history, materials, and receipts |
| **Teacher Dashboard** | `/dashboard/teacher` | Earnings metrics, upcoming classes, availability scheduler, class creation form, and student roster |
| **Booking & Checkout** | `/booking/[id]` | Format selection, date/slot picker, timezone conversion, double-booking prevention, breakdown, and checkout |
| **Live Classroom** | `/classroom/[sessionId]` | LiveKit WebRTC video classroom, dual video grid, mic/cam controls, screen share, interactive digital whiteboard, and chat |
| **Admin Console** | `/admin` | Metrics, pending tutor application approvals/rejections, teacher and student rosters, revenue split ledger |
| **Contact Us** | `/contact` | Working inquiry form connected to the Resend API, office hours, and support coordinates |
| **About Us** | `/about` | Mission, pedagogical commitment, founding philosophy, and trust pledge |
| **FAQ** | `/faq` | Filterable accordion covering parents, teachers, billing, and live classroom technology |
| **Privacy Policy** | `/privacy` | COPPA-compliant K-12 child privacy pledge, data minimization, and parental rights |
| **Terms of Service** | `/terms` | Marketplace terms, booking & cancellation rules, commission structure, and code of conduct |

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS + custom design tokens
- **Icons:** Lucide React
- **Video Classrooms:** LiveKit Cloud SDK (integrated with your keys)
- **Database & Auth:** Supabase (schema & seed files ready)
- **Transactional Email:** Resend (integrated with your keys)
- **Payments:** Razorpay / Razorpay Route marketplace architecture

---

## ⚡ Quick Start

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Supabase Database Migration
1. Go to your [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/isooxdepfamnufwglosa/sql).
2. Copy and run the contents of `supabase/schema.sql`.
3. (Optional) Run `supabase/seed.sql` to populate sample subject records.

### 3. Production Build
```bash
npm run build
npm start
```

