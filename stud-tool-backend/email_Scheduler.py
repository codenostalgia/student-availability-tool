import asyncio
from email_service import mail_excel_file
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import time
import pytz
from report_worker import generate_excel_and_csv
from database_update_scheduler import run_scheduled_job as database_update

scheduler = BackgroundScheduler()
timezone = pytz.timezone('Asia/Kolkata')


def scheduled_job():
    try:
        print("WEEKLY REPORTING JOB TRIGGERED....")
        asyncio.run(run_scheduled_job())
    except Exception as e:
        print("Exception: ", e)


async def run_scheduled_job():
    try:
        print("Updating Database...")
        await database_update()
        print("GENERETING EXCEL AND CSV....")
        excel_report_path, excel_report_name, csv_report_path, csv_report_name, report_week_name = await generate_excel_and_csv()
        print("EMAIL SERVICE STARTED....")
        await mail_excel_file(excel_report_path, excel_report_name, csv_report_path, csv_report_name, report_week_name)
    except Exception as e:
        print("Exception in Reporting...: ", e)


# Schedule the job
scheduler.add_job(
    scheduled_job,
    trigger=CronTrigger(day_of_week='wed', hour=23,
                        minute=30, timezone=timezone)
)
