import os
import xlwt
from xlwt import Workbook
from pathlib import Path
import pickle
import pandas as pd
from service import student_availability, email_to_name_mapping
from service import students_lock, email_mapping_lock
from datetime import datetime
from datetime import timedelta
from fastapi.responses import FileResponse
import shutil

student_file = Path("./student.pkl")
email_to_name_mapping_file = Path(
    "./email_to_name_mapping_file.pkl")

# email_to_name_mapping: dict[str, str] = {}
# student_availability: dict[str, dict[str, set]] = {}

WEEKLY_REPORTS_DIR = './weekly_reports'
EXCEL_STORAGE_PATH = "./reports/excel"
CSV_STORAGE_PATH = "./reports/csv"

columns_to_select = ['name', 'email', 'date', 'weekday', 'slot']


def load_data():
    global student_availability
    global email_to_name_mapping

    with students_lock:
        # print(student_file.is_file())
        if student_file.is_file():
            with open(student_file, 'rb') as f:
                student_availability = pickle.load(f)
                # print("student_availability: ", student_availability)

    with email_mapping_lock:
        if email_to_name_mapping_file.is_file():
            with open(email_to_name_mapping_file, 'rb') as f:
                email_to_name_mapping = pickle.load(f)
                # print("email_to_name_mapping: ", email_to_name_mapping)


def between(date1, date2, records):

    datetime1 = datetime.strptime(date1, "%Y-%m-%d")
    datetime2 = datetime.strptime(date2, "%Y-%m-%d")

    result = []
    print(records[0])
    print(records[0][2])

    for record in records:
        d = datetime.strptime(record[2], '%Y-%m-%d')
        x = datetime1-d
        y = datetime2-d

        if (x <= timedelta(0) and y >= timedelta(0)):
            result.append(record)

    return result


def safe_to_datetime(date_str):
    try:
        return pd.to_datetime(date_str)
    except Exception as e:
        print(f"Error parsing date: {date_str} - {e}")
        return pd.NaT


async def generate_excel_and_csv():

    global student_availability
    global email_to_name_mapping

    index = 1
    records = []

    try:
        # load_data()

        with students_lock:
            with email_mapping_lock:
                for email, data in student_availability.items():
                    for date, slots in data.items():
                        for slot in slots:
                            record = dict()
                            record["email"] = email
                            record["name"] = email_to_name_mapping.get(email)
                            record["date"] = date
                            record["slot"] = slot
                            records.append(record)

        if (len(records) == 0):
            print("GENERATED EMPTY LIST IN WEEKLY REPORT, STOPPING FURTHER EXECUTION...")
            return

        df = pd.DataFrame(records)
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])
        df['weekday'] = df['date'].dt.day_name()
        df = df.sort_values(by='date')
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
        df.columns = df.columns.str.lower()

        df = df[columns_to_select]

        df['date'] = df['date'].apply(safe_to_datetime)
        df = df.dropna(subset=['date'])
        df['week'] = df['date'].dt.to_period('W').apply(lambda r: r.start_time)
        grouped = df.groupby('week')

        os.makedirs(WEEKLY_REPORTS_DIR, exist_ok=True)
        last_index = None
        for index, value in enumerate(grouped):
            last_index = index

        excel_report_path = ''
        excel_report_name = ''
        csv_report_path = ''
        csv_report_name = ''
        report_week_name = ''
        for i, (week, group) in enumerate(grouped):

            if i == last_index:
                week_name = pd.Timestamp(week).strftime(
                    '%Y-%m-%d')  # Format the date as needed
                group = group.drop(columns=['week'])
                group['date'] = group['date'].dt.strftime('%Y-%m-%d')

                excel_report_path = os.path.normpath(os.path.join(
                    WEEKLY_REPORTS_DIR, f'week_{week_name}.xlsx'))
                excel_report_name = f'week_{week_name}.xlsx'

                csv_report_path = os.path.normpath(os.path.join(
                    WEEKLY_REPORTS_DIR, f'week_{week_name}.csv'))
                csv_report_name = f'week_{week_name}.csv'

                report_week_name = week_name
                group.to_excel(excel_report_path, index=False)
                group.to_csv(csv_report_path, index=False)
                print(f'Saved: {excel_report_path}')

        print("WEEKLY REPORT GENERATED")

        return excel_report_path, excel_report_name, csv_report_path, csv_report_name, report_week_name

    except Exception as e:
        print("Exception in Weekly Report Generation: ", e)
        return ''


def generate_excel(data, column_names, complete_excel_path):

    wb = Workbook()
    sheet = wb.add_sheet('Students')

    style = xlwt.easyxf('font: bold 1')
    sheet.write(0, 0, '#', style)

    for i, column_name in enumerate(column_names):
        sheet.write(0, i+1, column_name, style)

    index = 1
    for record in data:
        sheet.write(index, 0, index)
        sheet.write(index, 1, record[0])
        sheet.write(index, 2, record[1])
        sheet.write(index, 3, record[2])
        sheet.write(index, 4, record[3])
        sheet.write(index, 5, record[4])
        index += 1

    print("GENERATING EXCEL REPORT.....")

    os.makedirs(EXCEL_STORAGE_PATH, exist_ok=True)

    if os.path.exists(complete_excel_path):
        print("WIPING OUT OLD EXCEL FILE: "+complete_excel_path)
        os.remove(complete_excel_path)

    wb.save(complete_excel_path)


def generate_csv(complete_excel_path, complete_csv_path):

    df = pd.read_excel(complete_excel_path, sheet_name='Students')

    os.makedirs(CSV_STORAGE_PATH, exist_ok=True)

    if os.path.exists(complete_csv_path):
        print("WIPING OUT OLD CSV FILE: "+complete_csv_path)
        os.remove(complete_csv_path)

    df.to_csv(complete_csv_path, index=False, header=True)


def generate_report_on_demand(start, end, format):

    global student_availability
    global email_to_name_mapping

    filename = start+"--"+end
    complete_excel_path = os.path.normpath(
        os.path.join(EXCEL_STORAGE_PATH, filename+".xls"))

    complete_csv_path = os.path.normpath(
        os.path.join(CSV_STORAGE_PATH, filename + ".csv"))

    index = 1
    records = []

    sheet_column_names = ["Full Name", "Email", "Date", "Day", "Slot"]

    try:
        # load_data()
        print(student_availability)
        with students_lock:
            with email_mapping_lock:
                for email, data in student_availability.items():
                    for date, slots in data.items():
                        for slot in slots:
                            record = dict()
                            record["email"] = email
                            record["name"] = email_to_name_mapping.get(email)
                            record["date"] = date
                            record["slot"] = slot
                            records.append(record)

        if (len(records) == 0):
            print("GENERATED EMPTY LIST, STOPPING FURTHER EXECUTION...")
            return

        df = pd.DataFrame(records)
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])
        df['weekday'] = df['date'].dt.day_name()
        df = df.sort_values(by='date')
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
        df.columns = df.columns.str.lower()

        records = df[columns_to_select].values.tolist()

    except Exception as e:
        print("Exception occurred in Initial Data Handling: ", e)

    result = None
    try:
        # print("start: ", repr(start))
        result = between(start, end, records)
        # print("length of result: ", len(result))
        # print("result: ", result)
    except Exception as e:
        print("Exception occurred in Filtering: ", e)

    try:
        generate_excel(result, sheet_column_names, complete_excel_path)

        if format:
            print("GENERATING CSV REPORT.....")
            generate_csv(complete_excel_path, complete_csv_path)
    except Exception as e:
        print("Exception occurred genrating excel from filtered data: ", e)

    if format:
        if os.path.exists(complete_csv_path):
            return FileResponse(complete_csv_path,
                                media_type='text/csv',
                                filename=(filename+".csv"),
                                headers={"X-Filename": filename+".csv",
                                         "Access-Control-Expose-Headers": "X-Filename"
                                         })
        else:
            return {
                "result": "There was an error generating file"
            }
    else:
        if os.path.exists(complete_excel_path):
            return FileResponse(complete_excel_path,
                                media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                filename=(filename+".xls"),
                                headers={"X-Filename": filename+".xls",
                                         "Access-Control-Expose-Headers": "X-Filename"
                                         })
        return {
            "result": "There was an error generating file"
        }
