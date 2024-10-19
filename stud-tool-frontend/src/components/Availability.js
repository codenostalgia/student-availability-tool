import * as React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import {
  getDeadline,
  getRecords,
  deleteRecord,
} from "../axios_http/AxiosRequests";
import "./style/Availability.css";

const Availability = (props) => {
  const [records, setRecords] = useState([]);
  const [deadlineReached, setDeadlineReached] = useState(false);

  const slotDeletedNotify = () =>
    toast.success("Slot Deleted!", {
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
    fetchStudentsRecords();
  }, []);

  const updateEditability = async () => {
    await getDeadline()
      .then((res) => {
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

  const fetchStudentsRecords = async () => {
    const em = localStorage.getItem("id");
    const data = await getRecords(em)
      .then(async (res) => {
        await structureAndUpdateRecords(res.data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  const structureAndUpdateRecords = async (data) => {
    setRecords((p) => data);
  };

  const deleteHandler = async (email, date, slot) => {
    await updateEditability()
      .then((res) => {})
      .catch((err) => {});
    if (!deadlineReached) {
      const record = {
        email: email,
        date: date,
        slot: slot,
      };
      // console.log(record);
      await deleteRecord(record)
        .then(async (res) => {
          slotDeletedNotify();
          await fetchStudentsRecords()
            .then((res) => {})
            .catch((err) => {
              console.log("Error in Fetching Records: ", err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      deadlineReachedNotify();
    }
  };

  return (
    <>
      <div className="container mt-5 mytable">
        {/* Desktop Table */}
        <div className="table-responsive d-none d-md-block">
          <table className="table table-bordered table-hover tab">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {records
                ? records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.date}</td>
                      <td>{record.slot}</td>
                      <td>
                        <button
                          className="btn del-btn btn-danger mr-2 delete"
                          onClick={async (e) => {
                            await deleteHandler(
                              record.email,
                              record.date,
                              record.slot
                            );
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="d-md-none">
          {records.map((record) => (
            <div className="card mb-3" key={record.id}>
              <div className="card-body">
                <h5 className="card-title">Slot #{record.id}</h5>
                <p className="card-text">
                  <strong>Date:</strong> {record.date}
                </p>
                <p className="card-text">
                  <strong>Slot:</strong>{" "}
                  {record.slot <= 11
                    ? record.slot + " AM"
                    : (parseInt(record.slot) % 12 || 12) + " PM"}
                </p>
                <button
                  className="btn btn-danger mr-2"
                  onClick={async () => {
                    await deleteHandler(record.email, record.date, record.slot);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Availability;
