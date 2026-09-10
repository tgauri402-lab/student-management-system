# from fastapi import FastAPI

# app = FastAPI()

# @app.get("/students/{student_id}")
# def get_student(student_id: int):
#     return {"student_id": student_id}



# from fastapi import FastAPI

# app = FastAPI()

# from fastapi import FastAPI

# app = FastAPI()

# @app.get("/students")
# def get_students(name: str):
#     return {"name": name}






# from fastapi import FastAPI

# # Create the FastAPI application
# app = FastAPI()

# # CREATE student
# # This endpoint accepts student information
# @app.post("/students")
# def create_student(name: str, course: str, marks: int):

#     # Create a student dictionary
#     student = {
#         "name": name,
#         "course": course,
#         "marks": marks
#     }

#     # Return the data received from the client
#     return {
#         "message": "Student created successfully",
#         "student": student
#     }





# from fastapi import FastAPI

# # Create FastAPI application
# app = FastAPI()

# # GET END points
# @app.get("/students")
# def get_students():

#  # Return all students
#  return students


# # Temporary student data
# students = [
# {
# "id": 1,
# "name": "Ram",
# "course": "Python",
# "marks": 85
# },
# {
# "id": 2,
# "name": "diya",
# "course": "AI",
# "marks": 90
# }
# ]



# from fastapi import FastAPI

# # Create FastAPI application
# app = FastAPI()

# # Temporary student data
# students = [
#     {
#         "id": 1,
#         "name": "Ram",
#         "course": "Python",
#         "marks": 85
#     },
#     {
#         "id": 2,
#         "name": "Diya",
#         "course": "AI",
#         "marks": 90
#     }
# ]
 
# # PUT endpoint
# @app.put("/students/{id}")
# def update_student(id: int, name: str):

#     for student in students:
#         if student["id"] == id:
#             student["name"] = name
#             return {
#                 "message": "Student updated successfully",
#                 "student": student
#             }

#     return {"message": "Student not found"}





# from fastapi import FastAPI

# app = FastAPI()

# students = [
#     {
#         "id": 1,
#         "name": "Ram",
#         "course": "Python",
#         "marks": 85
#     },
#     {
#         "id": 2,
#         "name": "Diya",
#         "course": "AI",
#         "marks": 90
#     }
# ]

# @app.delete("/students/{id}")
# def delete_student(id: int):

#     for student in students:
#         if student["id"] == id:
#             students.remove(student)
#             return {
#                 "message": "Student deleted successfully",
#                 "student": student
#             }

#     return {"message": "Student not found"}

# from fastapi import FastAPI
# from supabase import create_client
# from dotenv import load_dotenv
# import os

# # Load variables from .env
# load_dotenv()

# # Create FastAPI application
# app = FastAPI()

# # Get Supabase credentials
# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# print("URL =", SUPABASE_URL)
# print("KEY =", SUPABASE_KEY)

# # Connect Python to Supabase
# supabase = create_client(
#     SUPABASE_URL,
#     SUPABASE_KEY
# )

# @app.get("/")
# def home():
#     return {"message": "Supabase Connected"}

# @app.post("/students")
# def create_student(name: str, course: str, marks: int):

#     # Data to be inserted into Supabase
#     student = {
#         "name": name,
#         "course": course,
#         "marks": marks
#     }

#     # Insert into Supabase table
#     response = (
#         supabase
#         .table("students")
#         .insert(student)
#         .execute()
#     )

#     return {
#         "message": "Student created successfully",
#         "data": response.data
#     }

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from supabase import create_client
from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

# Create FastAPI application
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Connect Python to Supabase
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# Home Endpoint
@app.get("/")
def home():
    return {"message": "Supabase Connected"}

# CREATE Student
@app.post("/students")
def create_student(name: str, course: str, marks: int):

    student = {
        "name": name,
        "course": course,
        "marks": marks
    }

    response = (
        supabase
        .table("students")
        .insert(student)
        .execute()
    )

    return {
        "message": "Student created successfully",
        "data": response.data
    }

# READ All Students
@app.get("/students")
def get_students():

    response = (
        supabase
        .table("students")
        .select("*")
        .execute()
    )

    return {
        "message": "Students fetched successfully",
        "data": response.data
    }

# READ One Student
@app.get("/students/{id}")
def get_student(id: int):

    response = (
        supabase
        .table("students")
        .select("*")
        .eq("id", id)
        .execute()
    )

    return {
        "message": "Student fetched successfully",
        "data": response.data
    }

# UPDATE Student
# @app.put("/students/{id}")
# def update_student(id: int, marks: int):

#     response = (
#         supabase
#         .table("students")
#         .update({"marks": marks})
#         .eq("id", id)
#         .execute()
#     )

#     return {
#         "message": "Student updated successfully",
#         "data": response.data
#     }


@app.put("/students/{id}")
def update_student(id: int, name: str, course: str, marks: int):

    response = (
        supabase
        .table("students")
        .update({"name": name, "course": course, "marks": marks})
        .eq("id", id)
        .execute()
    )

    return {
        "message": "Student updated successfully",
        "data": response.data
    }

# DELETE Student
@app.delete("/students/{id}")
def delete_student(id: int):

    response = (
        supabase
        .table("students")
        .delete()
        .eq("id", id)
        .execute()
    )

    return {
        "message": "Student deleted successfully",
        "data": response.data
    }