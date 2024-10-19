import * as React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateStudent } from "../axios_http/AxiosRequests";
import "./style/EditStudent.css";

const EditStudent = (props) => {
  const [oldName, setOldName] = React.useState("");
  const [emailId, setEmailId] = React.useState("");
  const [pass, setPass] = React.useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const studentDetailsUpdatedNotify = () =>
    toast.success("Student Details Modified !", {
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

  const update = async (data) => {
    await updateStudent(data)
      .then((res) => {
        studentDetailsUpdatedNotify();
        navigate("/admin/addstudent");
      })
      .catch((err) => {
        console.log("Error in Editing student: ", err);
        navigate("/admin/addstudent");
      });
  };

  useEffect(() => {
    const handleSubmit = (event) => {
      event.preventDefault();

      // Get form values
      const newname = document.getElementById("fullname").value.trim();
      const newpassword = document.getElementById("password").value.trim();

      const data = {
        fullname: newname,
        email: location.state.email,
        password: newpassword,
      };
      // console.log(data);

      update(data);
    };

    let form = document.getElementById("updateForm");
    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  useEffect(() => {
    // console.log("location: ", location.state);
    if (location.state) {
      setOldName((p) => location.state.fullname);
      setEmailId((p) => location.state.email);
    } else {
      navigate("/admin");
    }
  }, []);

  const nameChangeHandler = (e) => {
    setOldName((p) => e.target.value);
  };
  const passwordChangeHandler = (e) => {
    setPass((p) => e.target.value);
  };

  return (
    <div className="new-admin container mt-5">
      <h4 className="text-center">EDIT STUDENT DETAILS</h4>
      <form className="edit-form" id="updateForm">
        <div className="form-group">
          <label htmlFor="fullname" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={oldName}
            onChange={nameChangeHandler}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="edit-email"
            name="edit-email"
            value={emailId}
            disabled
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={passwordChangeHandler}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block mt-3">
          Submit
        </button>
        <a
          href="/admin/addstudent"
          className="btn btn-secondary btn-block mt-3"
        >
          Cancel
        </a>
      </form>
      <div id="message" className="mt-3"></div>
    </div>
  );
};

export default EditStudent;
