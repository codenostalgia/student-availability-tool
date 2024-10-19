import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { editRecord } from "../axios_http/AxiosRequests";

const EditRecord = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const availabilityModifiedNotify = () =>
    toast.success("Availability Modified !", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });

  const [oldRecord, setOldRecord] = useState({
    email: "",
    date: "",
    slot: "",
  });

  const [timeSlots, setTimeSlots] = useState([]);

  // Initialize time slots
  useEffect(() => {
    let slots = [];
    for (let i = 0; i < 48; i++) {
      const hour = Math.floor(i / 2);
      const minutes = (i % 2) * 30;
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displaySlot = `${displayHour}:${
        minutes === 0 ? "00" : "30"
      } ${period}`;
      slots.push(
        <option key={i} value={displaySlot}>
          {displaySlot}
        </option>
      );
    }
    setTimeSlots(slots);
  }, []);

  // Handle location changes and set oldRecord
  useEffect(() => {
    const myrec = location.state;
    // console.log("location: ", location);

    if (myrec) {
      setOldRecord((p) => myrec);
    } else {
      navigate("/admin");
    }
  }, [location]);

  // Handle oldRecord updates
  useEffect(() => {
    if (oldRecord.email && oldRecord.date && oldRecord.slot) {
      console.log("record got: ", oldRecord);
    }
  }, [oldRecord]);

  const updateSlot = async (newRecord) => {
    if (oldRecord.email !== "") {
      // console.log(
      //   `updating ${JSON.stringify(oldRecord)} to ${JSON.stringify(newRecord)}`
      // );

      await editRecord(oldRecord, newRecord)
        .then((res) => {
          availabilityModifiedNotify();
          navigate("/admin/records");
        })
        .catch((err) => {
          console.log("error: ", err);
        });
    }
  };

  useEffect(() => {
    const handleSubmit = (event) => {
      event.preventDefault();

      const selectedEmail = document.getElementById("email").value.trim();
      const selectedDate = document.getElementById("day").value.trim();
      const selectedStartTime = document.getElementById("time-from").value.trim();
      const selectedEndTime = document.getElementById("time-till").value.trim();

      const newRecord = {
        email: selectedEmail,
        date: selectedDate,
        slot: selectedStartTime + "-" + selectedEndTime,
      };
      console.log("oldRecord: ", oldRecord);
      console.log("newRecord: ", newRecord);
      updateSlot(newRecord);
    };

    const form = document.getElementById("editForm");
    form.removeEventListener("submit", handleSubmit);
    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [oldRecord]);

  return (
    <>
      <br></br>
      <br></br>
      <div className="container mt-5">
        <h4 className="text-center mb-4">Edit Availability</h4>
        <form className="border p-4 rounded shadow" id="editForm">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <select id="email" className="form-control" disabled>
              <option value={oldRecord.email}>{oldRecord.email}</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="day" className="form-label">
              Select Date:
            </label>
            <input
              type="date"
              id="day"
              className="form-control"
              defaultValue={oldRecord.date}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="time-from" className="form-label">
              Slot-From:
            </label>
            <select
              id="time-from"
              className="form-control"
              required
              defaultValue={oldRecord.slot}
            >
              <option value="">Start Time</option>
              {timeSlots}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="time-till" className="form-label">
              Slot-Till:
            </label>
            <select
              id="time-till"
              className="form-control"
              required
              defaultValue={oldRecord.slot}
            >
              <option value="">End Time</option>
              {timeSlots}
            </select>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Edit Slot
            </button>
          </div>

          <div className="text-center mt-3">
            <a
              href="/admin/addstudent"
              className="btn btn-secondary btn-block mt-3"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditRecord;
