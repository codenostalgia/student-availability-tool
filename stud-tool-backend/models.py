from pydantic import BaseModel, EmailStr


class UserAuth(BaseModel):
    fullname: str
    email: EmailStr
    password: str

    # class Config:

    #     json_schema_extra = {
    #         "example": {
    #             "fullname": "John Cena",
    #             "email": "jogn@gmail.com",
    #             "password": "john@124"
    #         }
    #     }


class User(BaseModel):
    email: EmailStr
    password: str


class ReportMeta(BaseModel):
    start: str
    end: str
    format: int

    class Config:

        json_schema_extra = {
            "example": {
                "start": "YYYY-MM-DD",
                "end": "YYYY-MM-DD",
                "format": 0
            }
        }


class Student_db(BaseModel):
    fullname: str
    email: EmailStr
    password: str
    verified: bool = False


class VerifyOtp(BaseModel):
    email: EmailStr
    otp: str


class Record(BaseModel):
    email: str
    date: str
    slot: str
