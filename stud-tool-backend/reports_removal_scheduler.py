import asyncio
import os
from apscheduler.schedulers.background import BackgroundScheduler
import pytz

REPORTS_DIRECTORY = "./reports"


scheduler = BackgroundScheduler()
timezone = pytz.timezone('Asia/Kolkata')


def scheduled_job():
    try:
        print("ON DEMAND REPORTS CLEANING STARTED....")
        run_scheduled_job()
        print("CLEANING COMPLETED......")
    except Exception as e:
        print("Exception: ", e)


def run_scheduled_job():
    if os.path.exists(REPORTS_DIRECTORY):
        for root, dirs, files in os.walk(REPORTS_DIRECTORY):
            for file in files:
                file_path = os.path.normpath(os.path.join(root, file))
                os.remove(file_path)
                print(f"Deleted: {file_path}")
    else:
        print(f"Directory {REPORTS_DIRECTORY} does not exist.")


scheduler.add_job(scheduled_job, 'interval', hours=3)
