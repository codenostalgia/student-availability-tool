import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userSignUp } from "../axios_http/AxiosRequests";
import "./style/SignUp.css";

const SignUp = (props) => {
  const navigate = useNavigate();

  const emailRegisteredNotify = (mail) => {
    try {
      toast.error(`Email ${mail} is already registred!!`, {
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

  const singup = async (creds) => {
    await userSignUp(creds)
      .then((res) => {
        localStorage.setItem("id", creds.email);
        localStorage.setItem("coupon", "SLOWCAR");

        navigate("/verify");
      })
      .catch((err) => {
        console.log("error: ", err);

        if (err.response.status === 409) {
          emailRegisteredNotify(creds.email);
        }
      });
  };

  useEffect(() => {
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("coupon");

    const handleSubmit = (event) => {
      event.preventDefault();

      // Get form values
      const fullname = document.getElementById("fullname").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const data = {
        fullname,
        email: email,
        password: password,
      };

      // Simple validation
      if (fullname !== "" && email !== "" && password !== "") {
        singup(data);
        // console.log(data);
      }
    };

    let form = document.getElementById("signupForm");
    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return (
    <div className="signup-div-container">
      <div className="signup-container">
        <form className="signup-form" id="signupForm">
          <div className="login-title">CREATE ACCOUNT</div>
          <div className="signup-form-group">
            <label for="fullname">Full Name</label>
            <input type="text" id="fullname" name="fullname" required></input>
          </div>
          <div className="signup-form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required></input>
          </div>
          <div className="signup-form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
            ></input>
          </div>
          <button type="submit" className="signup-submit">
            Sign Up
          </button>
          <div className="back">
            <a href="/login" className="signup-login">
              LogIn
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
