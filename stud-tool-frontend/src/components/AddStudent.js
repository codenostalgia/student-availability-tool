import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addstudent,
  deleteSTudent,
  getStudentsList,
} from "../axios_http/AxiosRequests";
import "./style/AddStudent.css";

const AddStudent = (props) => {
  const [studentsList, setStudentsList] = React.useState([]);

  const navigate = useNavigate();

  const studentDeletedNotify = (mail) => {
    (() => {
      toast.success(`Student Deleted: ${mail}`, {
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
    })();
  };

  const studentAddedNotify = (mail) => {
    (() => {
      toast.success(`Student Added: ${mail}`, {
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
    })();
  };

  const addNewStudent = async (creds) => {
    const messageDiv = document.getElementById("message");

    await addstudent(creds)
      .then((res) => {
        studentAddedNotify(creds.email);
        fetchStudentsList();
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  const fetchStudentsList = async () => {
    await getStudentsList()
      .then((res) => {
        setStudentsList((p) => {
          return res.data;
        });
      })
      .catch((err) => {
        console.log("Error in Fetching students list: ", err);
      });
  };

  useEffect(() => {
    fetchStudentsList();
  }, []);

  useEffect(() => {}, [studentsList]);

  function handleSubmit(event) {
    event.preventDefault();
    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const data = {
      fullname,
      email: email,
      password: password,
    };
    if (fullname !== "" && email !== "" && password !== "") {
      addNewStudent(data);
    }
  }

  useEffect(() => {
    let form = document.getElementById("addStudentForm");
    form.removeEventListener("submit", handleSubmit);
    form.addEventListener("submit", handleSubmit);
    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  const deleteHandler = async (email) => {
    await deleteSTudent(email)
      .then((res) => {
        studentDeletedNotify(email);
        fetchStudentsList();
      })
      .catch((err) => {
        console.log("Error in deleting student: ", err);
      });
  };

  const editHandler = (em, fullname) => {
    navigate("/admin/edit", { state: { email: em, fullname: fullname } });
  };

  return (
    <>
      <div className="new-student container mt-5">
        <form
          className="signup-form border p-4 rounded shadow"
          id="addStudentForm"
        >
          <h2 className="text-center mb-4">Add Student</h2>
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <div className="form-group">
                <label htmlFor="fullname">Full Name</label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="col-12 col-md-6 mb-3">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="col-12 col-md-12 mb-3">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary btn-block">
                Add Student
              </button>
            </div>
            <div id="message" className="col-12 mt-3"></div>
          </div>
        </form>
      </div>

      <div className="container mt-5">
        {/* Table for Desktop */}
        <div className=" table-responsive d-none d-md-block student-table">
          <div className="table-responsive">
            <table className="table table-bordered table-hover stduent-tab">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Delete</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.map((student) => (
                  <tr key={student.email}>
                    <td>{student.fullname}</td>
                    <td>{student.email}</td>
                    <td>
                      <button
                        className="btn btn-danger delete"
                        onClick={async () => {
                          await deleteHandler(student.email);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary edit"
                        onClick={async () => {
                          editHandler(student.email, student.fullname);
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
        </div>

        {/* Cards for Mobile */}
        <div className="d-block d-md-none">
          <div className="row">
            {studentsList.map((student) => (
              <div className="col-12 mb-4" key={student.email}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{student.fullname}</h5>
                    <p className="card-text">{student.email}</p>
                    <div className="d-flex justify-content-start">
                      {" "}
                      {/* Changed from justify-content-between */}
                      <button
                        className="btn btn-danger me-2" // Added margin-end for spacing
                        onClick={async () => {
                          await deleteHandler(student.email);
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={async () => {
                          editHandler(student.email, student.fullname);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddStudent;
