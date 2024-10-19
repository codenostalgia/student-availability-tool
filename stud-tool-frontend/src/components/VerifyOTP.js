import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { verify } from "../axios_http/AxiosRequests";
import "./style/VerifyOTP.css";

const VerifyOTP = (props) => {
  const [eml, setEmail] = React.useState("");

  const navigate = useNavigate();

  const signupSuccessNotify = (mail) => {
    try {
      toast.success(`SignUp Successfull: ${mail}`, {
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

  const incorrectOtpNotify = (mail) => {
    try {
      toast.error(`Incorrect Otp: Please check mail on ${mail}`, {
        position: "top-right",
        autoClose: 4000,
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

    const alreadyVerifiedNotify = () => {
      try {
        toast.warn(`Email is already verified!!`, {
          position: "top-right",
          autoClose: 4000,
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

  useEffect(() => {
    const em = localStorage.getItem("id");

    if (!em) {
      navigate("/signup");
    }

    setEmail((p) => {
      return em;
    });
  }, []);

  const allowDigitOnly = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  const verify_otp = async (otp) => {
    const otpData = {
      email: localStorage.getItem("id"),
      otp: otp,
    };
    // console.log("otp data: ", otpData);

    const messageDiv = document.getElementById("message");
    await verify(otpData)
      .then((res) => {
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("coupon", "SLOWCAR");
        signupSuccessNotify(localStorage.getItem("id"));
        navigate("/student");
      })
      .catch((err) => {
        // console.log("error: ", err.response.data.detail);

        if (err.response.status === 417) {
          if (err.response && err.response.data.detail) {
            incorrectOtpNotify(localStorage.getItem("id"));
          }
        }
         if (err.response.status === 405) {
           if (err.response && err.response.data.detail) {
             alreadyVerifiedNotify();
           }
         }
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Get form values
    const digit1 = document.getElementById("digit-1").value.trim();
    const digit2 = document.getElementById("digit-2").value.trim();
    const digit3 = document.getElementById("digit-3").value.trim();
    const digit4 = document.getElementById("digit-4").value.trim();

    // Simple validation
    if (digit1 !== "" && digit2 !== "" && digit3 !== "" && digit4 !== "") {
      const otp = digit1 + digit2 + digit3 + digit4;

      verify_otp(otp);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="otp-container border rounded p-4 bg-white shadow">
        <h2 className="text-center">Verify Your Email</h2>
        <p className="text-center">
          Please enter the OTP sent to <strong> {eml}</strong>
        </p>
        <form className="otp-form d-flex flex-column" onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between mb-3">
            {[...Array(4)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="otp-input form-control"
                pattern="\d*"
                onInput={allowDigitOnly}
                id={`digit-${index + 1}`}
                required
              />
            ))}
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
        </form>
        <div id="message" className="message mt-3"></div>
      </div>
    </div>
  );
};

export default VerifyOTP;
