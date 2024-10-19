import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addNewAdmin } from "../axios_http/AxiosRequests";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style/AddAdmin.css";

const AddAdmin = (props) => {
  const navigate = useNavigate();

  const newAdminAddedNotify = (em) => {
    (() => {
      toast.success(`New Admin Added: ${em}`, {
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

  const checkLoginStatus = () => {
    const id = localStorage.getItem("id");
    if (!id) {
      navigate("/login");
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const addAnotherAdmin = async (newAdmin) => {
    await addNewAdmin(newAdmin)
      .then((res) => {
        newAdminAddedNotify(newAdmin.email);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  useEffect(() => {
    const handleSubmit = (event) => {
      event.preventDefault();

      // Get form values
      const newAdminEmail = document.getElementById("email").value.trim();
      const newAdminPassword = document.getElementById("password").value.trim();

      // console.log("newAdminEmail: ", newAdminEmail);
      // console.log("newAdminPassword: ", newAdminPassword);

      checkLoginStatus();

      const newAdmin = {
        email: newAdminEmail,
        password: newAdminPassword,
      };

      // console.log("newAdmin: ", newAdmin);

      addAnotherAdmin(newAdmin);
    };

    let form = document.getElementById("adminForm");
    form.removeEventListener("submit", handleSubmit);
    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return (
    <>
      <div className="container mt-5">
        <form className="admin-form" id="adminForm">
          <h4 className="text-center mb-4">Add New Admin Credentials</h4>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
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
              required
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block mt-3">
            Add Admin
          </button>
          <div className="mt-3">
            <a href="/admin/records" className="btn btn-secondary btn-block">
              Back
            </a>
          </div>
        </form>
        <div id="message" className="mt-3"></div>
      </div>

    </>
  );
};

export default AddAdmin;
