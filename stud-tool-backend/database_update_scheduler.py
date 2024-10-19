
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
from service import update_student_credentials_database, update_admin_credentials_database, update_otp_database, update_email_to_name_mapping_database, update_student_availability_database
from service import students_credentials, admin_credentials, student_otps, email_to_name_mapping, student_availability
scheduler = BackgroundScheduler()
timezone = pytz.timezone('Asia/Kolkata')


def scheduled_job():
    try:
        print("SCHEDULED DATABASE UPDATE STARTED....")
        asyncio.create_task(run_scheduled_job())
    except Exception as e:
        print("Exception: ", e)


async def run_scheduled_job():
    print("UPDATING STUDENTS CREDENTIALS....")
    await update_student_credentials_database(students_credentials)
    print("UPDATING ADMIN CREDENTIALS....")
    await update_admin_credentials_database(admin_credentials)
    print("UPDATING OTPs....")
    await update_otp_database(student_otps)
    print("UPDATING EMAIL TO NAME MAPPINGS....")
    await update_email_to_name_mapping_database(email_to_name_mapping)
    print("UPDATING STUDENTS AVAILABILITY....")
    await update_student_availability_database(student_availability)
    print("SCHEDULED DATABASE UPDATE COMPLETED....")


scheduler.add_job(scheduled_job, 'interval', hours=12)
