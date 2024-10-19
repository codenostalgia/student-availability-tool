import * as React from "react";
import { useEffect, useState } from "react";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDeadline, updateSlot } from "../axios_http/AxiosRequests";
import "./style/StudentForm.css";

const StudentForm = (props) => {
  const [deadlineReached, setDeadlineReached] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [oldDeadline, setOldDeadline] = useState("");

  useEffect(() => {
    let slots = [];

    for (let i = 0; i < 48; i++) {
      const hour = Math.floor(i / 2);
      const minutes = (i % 2) * 30; // 0 or 30
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12; // Adjust for 12-hour format
      const valueHour = hour; // Value remains in 24-hour format
      const displaySlot =
        displayHour + ":" + (minutes === 0 ? "00 " : "30 ") + period;

      slots.push(
        <option key={i} value={displaySlot}>
          {displaySlot}
        </option>
      );
    }

    setTimeSlots((p) => slots);
  }, []);

  const slotBookedNotify = () =>
    toast.success("Slot Booked!", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });
  const deadlineReachedNotify = () =>
    toast.error("Deadline Exceeded!", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });

  useEffect(() => {
    updateEditability();
    setDates();
  }, []);

  useEffect(() => {
    const handleSubmit = (event) => {
      event.preventDefault();
      // console.log("button clicked");
      // console.log("deadlineReached: ", deadlineReached);

      const selectedDay = document.getElementById("day").value.trim();
      const selectedStartTime = document
        .getElementById("time-from")
        .value.trim();
      const selectedEndTime = document.getElementById("time-till").value.trim();

      const bookedSlot = {
        email: localStorage.getItem("id"),
        date: selectedDay,
        slot: selectedStartTime + "-" + selectedEndTime,
      };

      console.log(bookedSlot);

      slotBooking(bookedSlot);
    };

    let form = document.getElementById("bookingForm");
    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [deadlineReached]);

  function convertToIST(date) {
    const utcTime = date.getTime();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcTime + istOffset);
    return istDate;
  }

  function getNextWeekWeekdays() {
    let today = new Date();
    today = convertToIST(today);
    const nextWeekWeekdays = [];

    let daysUntilNextMonday = (8 - today.getDay()) % 7;
    daysUntilNextMonday = daysUntilNextMonday === 0 ? 7 : daysUntilNextMonday;

    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(nextMonday);
      nextDate.setDate(nextMonday.getDate() + i);
      nextWeekWeekdays.push(nextDate);
    }

    return nextWeekWeekdays;
  }

  const setDates = () => {
    const nextWeekdays = getNextWeekWeekdays();
    const daySelect = document.getElementById("day");
    const options = Array.from(daySelect.options);

    let i = 1;
    for (let weekday of nextWeekdays) {
      let currentDate = weekday.toLocaleDateString("en-IN"); // Formats the date for India
      const dayOfWeek = weekday.toLocaleString("en-IN", { weekday: "long" }); // Full name of the day

      const [day, month, year] = currentDate.split("/").map(Number);
      currentDate =
        year +
        "-" +
        (month < 10 ? "0" + month : month) +
        "-" +
        (day < 10 ? "0" + day : day);
      options[i].text = dayOfWeek + ` [${currentDate}]`;
      options[i].value = currentDate;
      i++;

      // console.log();
    }
  };

  const updateEditability = async () => {
    await getDeadline()
      .then((res) => {
        setOldDeadline((p) => res.data);
        let deadlineDate = new Date(res.data).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });
        let currntDate = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });

        const date1 = new Date(deadlineDate);
        const date2 = new Date(currntDate);

        // console.log("Time baki hai? : ", date2 < date1);
        setDeadlineReached((prev) => {
          return date1 <= date2;
        });
      })
      .catch((err) => {
        console.log("err: ", err);
      });
  };

  const slotBooking = async (bookedSlot) => {
    // console.log("clicked slot booking: ", bookedSlot);

    await updateEditability()
      .then(() => {})
      .catch(() => {});
    if (!deadlineReached) {
      // console.log("Updated Editability Latest: ", deadlineReached);
      await updateSlot(bookedSlot)
        .then(async (res) => {
          slotBookedNotify();
        })
        .catch((err) => {
          console.log("error: ", err);
        });
    } else {
      deadlineReachedNotify();
    }
  };

  return (
    <div className="container mt-5">
      <form className="signup-form border p-4 rounded shadow" id="bookingForm">
        <h4 className="text-center mb-4">Weekly Slot Booking</h4>
        {oldDeadline !== "" ? (
          <div className="form-group" style={{ color: "red" }}>
            Deadline:
            {oldDeadline.split("T").reduce((a, b) => {
              return " " + a + " " + b;
            })}
          </div>
        ) : null}
        <div className="row">
          <div className="col-12 mb-3">
            <div className="form-group">
              <label htmlFor="day" className="form-label">
                Select Day:
              </label>
              <select id="day" required className="form-control">
                <option value="">Choose a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          <div className="col-12 mb-3">
            <div className="form-group">
              <label htmlFor="time-from" className="form-label">
                Slot-From:
              </label>
              <select id="time-from" required className="form-control">
                <option value="">Start Time</option>
                {timeSlots}
              </select>
            </div>
          </div>

          <div className="col-12 mb-3">
            <div className="form-group">
              <label htmlFor="time-till" className="form-label">
                Slot-Till:
              </label>
              <select id="time-till" required className="form-control">
                <option value="">End Time</option>
                {timeSlots}
              </select>
            </div>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary btn-block">
              Book Slot
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
