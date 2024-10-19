# import bcrypt
from fastapi import HTTPException, status
from models import *
from pathlib import Path
import pickle
from email_service import send_otp
from deadline_scheduler import deadlineHandler
import threading
from passlib.context import CryptContext

student_credentials_lock = threading.Lock()
admin_credentials_lock = threading.Lock()
email_mapping_lock = threading.Lock()
otp_lock = threading.Lock()
students_lock = threading.Lock()

students_credentials_file = Path("students_credentials.pkl")
admin_credentials_file = Path("admin_credentials.pkl")
email_to_name_mapping_file = Path("email_to_name_mapping_file.pkl")
otp_file = Path("otp.pkl")
student_file = Path("student.pkl")

students_credentials: dict[str, Student_db] = {}
admin_credentials: dict[str, str] = {}
email_to_name_mapping: dict[str, str] = {}
student_otps: dict[str, str] = {}
student_availability: dict[str, dict[str, set]] = {}
students_data: dict[str, dict[str, str]] = {}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

if students_credentials_file.is_file():
    with student_credentials_lock:
        with open(students_credentials_file, 'rb') as f:
            students_credentials = pickle.load(f)

if admin_credentials_file.is_file():
    # print("file exists: ", admin_credentials_file)
    with admin_credentials_lock:
        with open(admin_credentials_file, 'rb') as f:
            admin_credentials = pickle.load(f)
            # print("admin_credentials: ", admin_credentials)

if otp_file.is_file():
    with otp_lock:
        with open(otp_file, 'rb') as f:
            student_otps = pickle.load(f)

if student_file.is_file():
    with students_lock:
        with open(student_file, 'rb') as f:
            student_availability = pickle.load(f)


if email_to_name_mapping_file.is_file():
    with email_mapping_lock:
        with open(email_to_name_mapping_file, 'rb') as f:
            email_to_name_mapping = pickle.load(f)


async def update_student_credentials_database(updated_students_login):
    with student_credentials_lock:
        with open(students_credentials_file, 'wb') as f:
            pickle.dump(updated_students_login, f)


async def update_admin_credentials_database(updated_admins_login):
    with admin_credentials_lock:
        with open(admin_credentials_file, 'wb') as f:
            pickle.dump(updated_admins_login, f)


async def update_otp_database(updated_otps):
    with otp_lock:
        with open(otp_file, 'wb') as f:
            pickle.dump(updated_otps, f)


async def update_student_availability_database(updated_availability):
    with students_lock:
        with open(student_file, 'wb') as f:
            pickle.dump(updated_availability, f)


async def update_email_to_name_mapping_database(email_to_name_mappings):
    with email_mapping_lock:
        with open(email_to_name_mapping_file, 'wb') as f:
            pickle.dump(email_to_name_mappings, f)


def isAlreadyPresent(email: EmailStr):
    if students_credentials.get(email):
        return True


def register_student(student: UserAuth):

    global students_credentials
    global email_to_name_mapping
    global student_otps

    with student_credentials_lock:
        with email_mapping_lock:
            with otp_lock:
                if isAlreadyPresent(student.email) and students_credentials.get(student.email).verified:
                    raise HTTPException(status.HTTP_409_CONFLICT,
                                        detail="EMAIL ALREADY EXISTS !!")

                # password = bytes(student.password, 'utf-8')
                # hashedpassword = bcrypt.hashpw(password, bcrypt.gensalt())

                hashedpassword = pwd_context.hash(student.password)

                otp = send_otp(str(student.email))

                students_credentials[student.email] = Student_db(fullname=student.fullname,
                                                                 email=student.email, password=hashedpassword)

                email_to_name_mapping[student.email] = student.fullname
                student_otps[student.email] = otp

                # update_student_credentials_database(students_credentials)
                # update_email_to_name_mapping_database(email_to_name_mapping)
                # update_otp_database(student_otps)

                return {
                    "email": student.email
                }


def verify_otp(verify: VerifyOtp):

    global students_credentials
    global student_otps

    with student_credentials_lock:
        with otp_lock:
            if students_credentials[verify.email].verified:
                raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED,
                                    detail="Email Already Verified !!")

            if student_otps.get(verify.email) == verify.otp:
                students_credentials[verify.email].verified = True
                update_student_credentials_database(students_credentials)
                return {
                    "result": "success",
                    "name": students_credentials[verify.email].fullname
                }
            else:
                raise HTTPException(status.HTTP_417_EXPECTATION_FAILED,
                                    detail="Incorrect Otp !!")


def login_user(user: User):

    global admin_credentials
    global students_credentials

    # print(admin_credentials)

    with student_credentials_lock:
        with admin_credentials_lock:
            if admin_credentials.get(user.email):
                # if  bcrypt.checkpw(bytes(user.password, 'utf-8'), admin_credentials.get(user.email)):
                if pwd_context.verify(user.password, admin_credentials.get(user.email)):
                    return {
                        "result": "Success",
                        "user": "admin",
                        "deadline": deadlineHandler.getDeadline()
                    }
                else:
                    raise HTTPException(status.HTTP_404_NOT_FOUND,
                                        detail="Incorrect Password!!")

            if (not students_credentials.get(user.email)) or not students_credentials.get(user.email).verified:
                raise HTTPException(status.HTTP_404_NOT_FOUND,
                                    detail="No user found !!")

            elif pwd_context.verify(user.password,
                                    students_credentials.get(user.email).password):
                return {
                    "result": "Success",
                    "user": "student",
                    "name": students_credentials.get(user.email).fullname,
                    "email": students_credentials.get(user.email).email,
                    "deadline": deadlineHandler.getDeadline()
                }

            else:
                raise HTTPException(status.HTTP_404_NOT_FOUND,
                                    detail="Incorrect Password!!")


def update_avaibility(slotUpdateModel: Record):

    global student_availability

    with students_lock:
        email = slotUpdateModel.email
        date = slotUpdateModel.date
        slot = slotUpdateModel.slot

        if student_availability.get(email):
            date_avab_dict = student_availability.get(email)

            if date_avab_dict.get(date):
                date_avab_dict[date].add(slot)
            else:
                newslot = set()
                newslot.add(slot)
                date_avab_dict[date] = newslot

        else:
            student_availability[email] = {}
            newslot = set()
            newslot.add(slot)
            student_availability[email][date] = newslot

        # update_student_availability_database(student_availability)

        return student_availability.get(email)


def get_students():

    global student_availability
    global email_to_name_mapping

    records = []

    with students_lock:
        with email_mapping_lock:
            for email in student_availability:
                name = email_to_name_mapping.get(email)
                stud_dict = student_availability.get(email)
                for date, slots in stud_dict.items():
                    for slot in slots:
                        record = [name, email, date, slot]
                        records.append(record)

    sorted_records = sorted(records, key=lambda x: x[2], reverse=True)

    records_of_dict = []

    for ind, record in enumerate(sorted_records):
        records_of_dict.append({
            "id": ind,
            "fullname": record[0],
            "email": record[1],
            "date": record[2],
            "slot": record[3]
        })

    return records_of_dict


def add_new_admin(user: User):

    global admin_credentials

    with admin_credentials_lock:
        # password = bytes(user.password, 'utf-8')
        # hashedpassword = bcrypt.hashpw(password, bcrypt.gensalt())
        hashedpassword = pwd_context.hash(user.password)
        admin_credentials[user.email] = hashedpassword
        # update_admin_credentials_database(admin_credentials)
        return {
            "result": "SUCCESS"
        }


def delete_record(record: Record):

    global student_availability

    with students_lock:
        email = record.email
        date = record.date
        slot = record.slot

        if student_availability.get(email):
            date_avab_dict = student_availability.get(email)

            if date_avab_dict.get(date):
                date_avab_dict[date].discard(slot)

        # update_student_availability_database(student_availability)

        return student_availability[email]


def edit_record(oldRecord: Record, newRecord: Record):
    delete_record(oldRecord)
    return update_avaibility(newRecord)


def add_student(student: UserAuth):

    global students_credentials
    global email_to_name_mapping

    with student_credentials_lock:
        with email_mapping_lock:
            if isAlreadyPresent(student.email) and students_credentials.get(student.email).verified:
                raise HTTPException(status.HTTP_409_CONFLICT,
                                    detail="EMAIL ALREADY EXISTS !!")

            # password = bytes(student.password, 'utf-8')
            # hashedpassword = bcrypt.hashpw(password, bcrypt.gensalt())
            hashedpassword = pwd_context.hash(student.password)
            students_credentials[student.email] = Student_db(fullname=student.fullname,
                                                             email=student.email, password=hashedpassword, verified=True)
            email_to_name_mapping[student.email] = student.fullname
            return {
                "result": "SUCCESS",
                "name": student.fullname
            }


def get_records(email: str):
    global student_availability

    with students_lock:
        if student_availability.get(email):
            stud_dict = student_availability.get(email)
            records = []
            name = email_to_name_mapping.get(email)
            stud_dict = student_availability.get(email)
            for date, slots in stud_dict.items():
                for slot in slots:
                    record = [name, email, date, slot]
                    records.append(record)
            sorted_records = sorted(
                records, key=lambda x: x[2], reverse=True)
            records_of_dict = []

            for ind, record in enumerate(sorted_records):
                records_of_dict.append({
                    "id": ind,
                    "fullname": record[0],
                    "email": record[1],
                    "date": record[2],
                    "slot": record[3]
                })
            return records_of_dict
        else:
            return {}


def get_students_list():
    global email_to_name_mapping

    with email_mapping_lock:
        return sorted([{"fullname": v, "email": k} for k, v in email_to_name_mapping.items()],
                      key=lambda x: x["fullname"].lower())


def delete_student(email: str):
    global student_availability
    global email_to_name_mapping
    global students_credentials
    global student_otps

    with student_credentials_lock:
        with email_mapping_lock:
            with students_lock:
                with otp_lock:
                    if email in students_credentials:
                        del students_credentials[email]
                    if email in student_availability:
                        del student_availability[email]
                    if email in student_otps:
                        del student_otps[email]
                    if email in email_to_name_mapping:
                        del email_to_name_mapping[email]
    return {
        "result": "SUCCESS"
    }


def update_student(student: UserAuth):
    global students_credentials
    global email_to_name_mapping

    with student_credentials_lock:
        with email_mapping_lock:
            student_dict = students_credentials.get(student.email)

            if student_dict:
                student_dict.fullname = student.fullname
                email_to_name_mapping[student.email] = student.fullname

                if student.password != "":
                    # password = bytes(student.password, 'utf-8')
                    # hashedpassword = bcrypt.hashpw(password, bcrypt.gensalt())
                    hashedpassword = pwd_context.hash(student.password)

                    student_dict.password = hashedpassword

    return {
        "result": "SUCCESS"
    }
