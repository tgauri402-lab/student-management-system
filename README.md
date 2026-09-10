# Student Management System

## Overview
A Student Management System built using FastAPI, Supabase, HTML, CSS, and JavaScript.

## Features
- Add Student
- View Students
- Update Student
- Delete Student
- REST API Integration
- Cloud Database using Supabase

## Tech Stack
- FastAPI
- Supabase
- HTML
- CSS
- JavaScript

## Installation

1. Clone repository

git clone https://github.com/tgauri402-lab/student-management-system.git

2. Install dependencies

pip install -r requirements.txt

3. Create .env file

SUPABASE_URL=your_url
SUPABASE_KEY=your_key

4. Run

uvicorn main:app --reload

## API Endpoints

GET /students
POST /students
PUT /students/{id}
DELETE /students/{id}

## Author

Gauri Tayade