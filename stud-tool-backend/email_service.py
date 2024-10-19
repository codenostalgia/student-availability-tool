from Google import Create_Service
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os

import random

CLIENT_SECRET_FILE = 'client_secret.json'
API_NAME = 'gmail'
API_VERSION = 'v1'
SCOPES = ['https://mail.google.com/']

ADMIN_EMAIL = 'admin_mail_id_here'

service = Create_Service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)


def delete_file(file_path):
    try:
        if os.path.isfile(file_path):
            os.remove(file_path)
            print(f"Deleted: {file_path}")
        else:
            print(f"File does not exist: {file_path}")
    except Exception as e:
        print(f"Error deleting {file_path}: {e}")


def generate_otp():
    otp = random.randint(1000, 9999)
    return otp


async def mail_excel_file(excel_report_path, excel_report_name, csv_report_path, csv_report_name, report_week_name):

    if not os.path.exists(excel_report_path):
        print("Weekly Report Not Found...")
        print("Check Path: ", excel_report_path)
        return

    if not os.path.exists(csv_report_path):
        print("Weekly Report Not Found...")
        print("Check Path: ", csv_report_path)
        return

    to_address = ADMIN_EMAIL
    emailMsg = 'PFA File'
    mimeMessage = MIMEMultipart()
    mimeMessage['to'] = to_address
    mimeMessage['subject'] = f'Weekly Report: {report_week_name}'

    mimeMessage.attach(MIMEText(emailMsg, 'plain'))

    with open(excel_report_path, 'rb') as f:
        part = MIMEApplication(
            f.read(), Name=os.path.basename(excel_report_path))
        part['Content-Disposition'] = f'attachment; filename="{excel_report_name}"'
        mimeMessage.attach(part)

    with open(csv_report_path, 'rb') as f:
        part = MIMEApplication(
            f.read(), Name=os.path.basename(csv_report_path))
        part['Content-Disposition'] = f'attachment; filename="{csv_report_name}"'
        mimeMessage.attach(part)

    raw_string = base64.urlsafe_b64encode(mimeMessage.as_bytes()).decode()

    message = service.users().messages().send(
        userId='me', body={'raw': raw_string}).execute()
    print(message)
    print("REPORTS MAILED....")

    # Delete Reports once mailed
    delete_file(excel_report_path)
    delete_file(csv_report_path)

    return "SUCCESS"


def send_otp(to_address):

    print("to_address: ", to_address)

    otp = str(generate_otp())
    emailMsg = 'Your OTP is: ' + otp
    mimeMessage = MIMEMultipart()
    mimeMessage['to'] = to_address
    mimeMessage['subject'] = 'SingUp OTP'

    mimeMessage.attach(MIMEText(emailMsg, 'plain'))

    raw_string = base64.urlsafe_b64encode(mimeMessage.as_bytes()).decode()

    message = service.users().messages().send(
        userId='me',
        body={'raw': raw_string}).execute()
    print(message)

    return otp
