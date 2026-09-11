# JobsZim

A Zimbabwe-focused job board. Flask backend (SQLAlchemy + SQLite) with a
vanilla HTML/CSS/JS frontend served from `client/public`. Employers post
jobs (subject to admin approval), job seekers search, save, and apply.

## Features

- Email/password auth with optional 2FA (`pyotp` + QR setup)
- Employer accounts with company profiles, logos, reviews
- Job posting, approval workflow, search/filter, pagination
- Saved jobs, job alerts, applications, resumes
- Admin panel (user management, job moderation, analytics)
- SEO: sitemap.xml, robots.txt

## Requirements

- Python 3.11+
- pip

## Setup

```bash
git clone https://github.com/warxone378/jobszim.git
cd jobszim
pip install -r requirements.txt
cp .env.example .env   # then fill in real values
```

## Environment variables

See `.env.example`. At minimum, set `SECRET_KEY` to a random value before
running anywhere but your own machine — the code falls back to an
insecure default if it's unset.

## Running locally

```bash
python run.py
```

The app serves on `http://localhost:3000`. The SQLite database is created
automatically at `instance/users.db` on first run.

## Creating an admin account

1. Register a normal account through the site.
2. Edit `make_admin.py` so `username='...'` matches that account.
3. Run:
   ```bash
   python make_admin.py
   ```

## Deployment

Configured for Vercel (`vercel.json` → `wsgi.py`). Set the environment
variables above in your Vercel project settings before deploying.

## Project structure

```
app/
  controllers/   # request-handling helpers
  models/        # SQLAlchemy models + JSON-file-backed job data
  routes/        # Flask blueprints, one per feature area
  utils/         # email, reCAPTCHA, file helpers
client/public/   # static frontend (HTML/CSS/JS)
instance/        # SQLite database (not committed)
```
