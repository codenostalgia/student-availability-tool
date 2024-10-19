from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import time
import pytz
from datetime import datetime, timedelta

scheduler = BackgroundScheduler()
timezone = pytz.timezone('Asia/Kolkata')


# Next Immediate Friday 6 PM
class DeadlineHandler:

    DEADLINE = None

    def __init__(self) -> None:
        print("RUNNNG INITIAL DEADLINE FUNCTION...")
        now = datetime.now()
        days_ahead = (2 - now.weekday() + 7) % 7
        if days_ahead == 0 and now.hour >= 23:
            days_ahead += 7
        next_wednesday = now + timedelta(days=days_ahead)
        DeadlineHandler.DEADLINE = next_wednesday.replace(
            hour=23, minute=0, second=0, microsecond=0)
        print("DEADLINE RESET: ", DeadlineHandler.DEADLINE)

    def setDeadline(self, deadline: str):
        DeadlineHandler.DEADLINE = deadline
        print("new DEADLINE", DeadlineHandler.DEADLINE)
        return "SUCCESS"

    def getDeadline(self):
        return DeadlineHandler.DEADLINE

    def update_deadline(self):
        print("DEADLINE SCHEDULER IN PROGRESS...")
        now = datetime.now()
        delta = timedelta(days=2, hours=23, minutes=0)
        DeadlineHandler.DEADLINE = now + delta
        print("New Updated Dealine: ", DeadlineHandler.DEADLINE)


deadlineHandler = DeadlineHandler()


scheduler.add_job(
    deadlineHandler.update_deadline,
    trigger=CronTrigger(day_of_week='mon', hour=0,
                        minute=0, timezone=timezone)
)
