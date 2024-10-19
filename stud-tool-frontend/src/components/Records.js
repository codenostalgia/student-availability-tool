import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deleteRecord, getStudents } from "../axios_http/AxiosRequests";
import "./style/Records.css";

const Records = (props) => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const recordDeletedNotify = (stamp) => {
    try {
      toast.success(`Slot Removed: ${stamp}`, {
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
    } catch (error) {
      console.error("Toast error: ", error); // Debugging line
    }
  };

  const fetchStudentsRecords = async () => {
    const data = await getStudents()
      .then((res) => {
        setStudents((prevData) => {
          return res.data;
        });
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  useEffect(() => {
    fetchStudentsRecords();
  }, []);

  useEffect(() => {}, [students]);

  const deleteHandler = async (email, date, slot) => {
    const record = {
      email: email,
      date: date,
      slot: slot,
    };
    // console.log(record);

    await deleteRecord(record)
      .then(async (res) => {
        // console.log(res.data);
        recordDeletedNotify(`${record.email} : ${record.date} ${record.slot}`);
        fetchStudentsRecords();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const editHandler = (email, date, slot) => {
    const oldRecord = {
      email: email,
      date: date,
      slot: slot,
    };

    // console.log("Navigating to Edit with record: ", oldRecord);

    navigate("/admin/records/edit", {
      state: oldRecord,
    });
  };

  return (
    <div className="container mt-5 mytable">
      {/* Desktop Table */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered table-hover tab">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Slot</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.fullname}</td>
                <td>{student.email}</td>
                <td>{student.date}</td>
                <td>{student.slot}</td>
                <td>
                  <button
                    className="btn btn-danger mr-2 delete"
                    onClick={async () => {
                      await deleteHandler(
                        student.email,
                        student.date,
                        student.slot
                      );
                    }}
                  >
                    Delete
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-primary edit"
                    onClick={async () => {
                      editHandler(student.email, student.date, student.slot);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="d-md-none">
        {students.map((student) => (
          <div className="card mb-3" key={student.id}>
            <div className="card-body">
              <h5 className="card-title">{student.fullname}</h5>
              <p className="card-text">
                <strong>Email:</strong> {student.email}
              </p>
              <p className="card-text">
                <strong>Date:</strong> {student.date}
              </p>
              <p className="card-text">
                <strong>Slot:</strong>
                {student.slot}
              </p>
              <button
                className="btn btn-danger mr-2"
                onClick={async () => {
                  await deleteHandler(
                    student.email,
                    student.date,
                    student.slot
                  );
                }}
              >
                Delete
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  editHandler(student.email, student.date, student.slot);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Records;
