from fastapi import Body, FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import Field
from email_service import *
from models import *
from fastapi.middleware.cors import CORSMiddleware
import service
from email_Scheduler import scheduler as email_Scheduler
from deadline_scheduler import deadlineHandler, scheduler as deadline_scheduler
from datetime import datetime
from email_service import mail_excel_file
from database_update_scheduler import scheduler as database_scheduler, scheduled_job as update_database
from report_worker import generate_report_on_demand
from fastapi.responses import FileResponse
from report_worker import generate_excel_and_csv
from reports_removal_scheduler import scheduler as report_deletion_scheduler
from monthly_data_cleaner_Scheduler import scheduler as data_cleaning_scheduler
from contextlib import asynccontextmanager


def shutdown_event():
    print("APPLICATION IS ABOUT TO TERMINATE..")
    print("UPDATING DATABASE  BEFORE PROGRAM TERMINATION....")
    update_database()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("STarting the Application...")
    yield
    # Clean up the ML models and release the resources
    print("Terminating the Application...")
    shutdown_event()


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

try:
    email_Scheduler.start()
    print("WEEKLY REPORTING JOB STARTED")
except:
    print("ERROR IN EMAIL SCHEDULER")

try:
    deadline_scheduler.start()
    print("WEEKLY DEADLINE UPDATE JOB STARTED")
except:
    print("ERROR IN DEALINE SCHEDULER")

try:
    database_scheduler.start()
    print("12-HOURLY DATABASE UPDATE JOB STARTED")
except:
    print("ERROR IN DATABASE UPDATE SCHEDULER")


try:
    report_deletion_scheduler.start()
    print("3-Hourly Report Deletion Scheduler started...")
except:
    print("ERROR IN Report Deletion Scheduler...")

# try:
#     data_cleaning_scheduler.start()
#     print("Monthly Dat Cleaning Scheduler started...")
# except:
#     print("ERROR IN Monthly Dat Cleaning Scheduler...")


# @app.lifespan
# async def lifespan(app: FastAPI):
#     print("Starting up...")
#     yield  # Marks the point where the startup is complete
#     print("Shutting down...")
#     shutdown_event()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Exception in Application: {exc}")

    return JSONResponse(
        status_code=500,
        content={"error": f"Please check logs to know more about the Exception !"},
    )


@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application!"}


@app.post("/signup")
async def register_student(student: UserAuth):
    return service.register_student(student)


@app.post("/verify")
async def verify_otp(verify: VerifyOtp):
    return service.verify_otp(verify)


@app.post("/login")
async def login_users(user: User):
    return service.login_user(user)


@app.post("/newadmin")
async def add_new_admin(user: User):
    return service.add_new_admin(user)


@app.post("/update")
async def update(slotUpdateModel: Record):
    return service.update_avaibility(slotUpdateModel)


@app.put("/deadline-update")
async def update_deadline(deadline: datetime = deadlineHandler.getDeadline()):
    return deadlineHandler.setDeadline(deadline)


@app.get("/deadline")
async def get_deadline():
    return deadlineHandler.getDeadline()


@app.get("/students")
async def get_students():
    return service.get_students()


@app.delete("/delete-record")
async def delete(record: Record):
    return service.delete_record(record)


@app.patch("/edit-record")
async def edit(oldRecord: Record, newRecord: Record):
    return service.edit_record(oldRecord, newRecord)


@app.post("/add-student")
async def add_student(student: UserAuth):
    return service.add_student(student)


@app.get("/get-records")
async def get_records(email: str):
    return service.get_records(email)


@app.get("/get-students-list")
async def get_students_list():
    return service.get_students_list()


@app.delete("/delete-student")
async def delete_Student(email: str):
    return service.delete_student(email)


@app.put("/update-student")
async def update_student(student: UserAuth):
    return service.update_student(student)


@app.post("/on-deamnd-report")
async def report(reportMeta: ReportMeta):
    return generate_report_on_demand(reportMeta.start, reportMeta.end, reportMeta.format)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
