import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userLogin } from "../axios_http/AxiosRequests";
import "./style/Login.css";

const Login = (props) => {
  const navigate = useNavigate();

  const loggedInNotify = (mail) => {
    try {
      toast.success(`Logged In Successfully: ${mail}`, {
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

  const loggingErrorNotify = (msg) => {
    // console.log("inside toaster");
    try {
      toast.error(`Error in Logging: ${msg}`, {
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

  const login = async (creds) => {
    await userLogin(creds)
      .then((res) => {
        loggedInNotify(creds.email);
        localStorage.setItem("id", creds.email);

        if (res.data["user"] === "admin") {
          localStorage.setItem("coupon", "RACEWINNER");
          navigate("/admin");
        }

        if (res.data["user"] === "student") {
          localStorage.setItem("name", res.data.name);
          localStorage.setItem("coupon", "SLOWCAR");
          navigate("/student");
        }
      })
      .catch((err) => {
        if (err.response.status == 404) {
          if (err.response.data && err.response.data.detail) {
            loggingErrorNotify(err.response.data.detail);
          }
        }

        console.log("Error in Logging user: ", err);
      });
  };

  React.useEffect(() => {
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("coupon");

    const handleSubmit = (e) => {
      e.preventDefault();

      // Get form values
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const data = {
        email: email,
        password: password,
      };

      // Simple validation
      if (email !== "" && password !== "") {
        login(data).catch(() => {});
        // console.log(data);
      }
    };

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return (
    <div className="login-div-container">
      <div className="login-container">
        <form className="login-form" id="loginForm">
          <div className="login-title">LOGIN</div>
          <div className="login-form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required></input>
          </div>
          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
            ></input>
          </div>
         <div className="login-form-group forgot">
            <a href="/signup" className="login-forgot-password">
              Sign Up?
            </a>
          </div> 

          <button type="submit" className="login-submit">
            Login
          </button>
          <div className="login-form-group back">
            <a href="/signup" className="login-signup">
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
