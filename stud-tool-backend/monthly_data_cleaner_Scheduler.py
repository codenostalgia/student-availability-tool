import asyncio
from pathlib import Path
import pickle
import nest_asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
from service import update_student_availability_database, student_availability, students_lock
from datetime import datetime

# Apply nest_asyncio
nest_asyncio.apply()

# Initialize the scheduler and timezone
scheduler = BackgroundScheduler()
timezone = pytz.timezone('Asia/Kolkata')

student_file = Path("student.pkl")


async def run_scheduled_job():
    global student_availability
    try:
        with students_lock:
            print("CLEANING OLD DATA...")
            today = datetime.today().date()
            for email in list(student_availability.keys()):
                student_dict = student_availability[email]
                for date in list(student_dict.keys()):
                    date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                    difference = today - date_obj
                    if difference.days >= 10:
                        print(f"Deleting: {email} {date_obj}")
                        del student_dict[date]

            with open(student_file, 'wb') as f:
                print("Writing Updated Data...")
                pickle.dump(student_availability, f)
            print("MONTHLY DATA CLEANING COMPLETED...")

    except Exception as e:
        print("Exception CLEANING OLD DATA...: ", e)


def scheduled_job():
    print("MONTHLY DATA CLEANING JOB TRIGGERED....")
    loop = asyncio.get_event_loop()
    # Create the task only if the loop is running
    if loop.is_running():
        asyncio.create_task(run_scheduled_job())
    else:
        print("No running event loop. Unable to schedule job.")
        asyncio.run(run_scheduled_job())


# Schedule the job to run according to the specified cron trigger
scheduler.add_job(
    scheduled_job,
    trigger='interval',
    days=30
)


try:
    # Start the scheduler
    scheduler.start()
    print("DATA CLEANER SCHEDULER STARTED")
except:
    print("ERROR IN DATA CLEANER SCHEDULER")
