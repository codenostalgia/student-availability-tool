import * as React from "react";
import { useEffect, useState } from "react";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDeadline, updateDeadline } from "../axios_http/AxiosRequests";
import "./style/NewDeadline.css";

const NewDeadline = (props) => {
  const [dateTime, setDateTime] = useState("");
  const [oldDeadline, setOldDeadline] = useState("");

  const newDeadlineNotify = (newDeadline) => {
    (() => {
      toast.success(`Deadline updated to: ${newDeadline}`, {
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

  const getOldDeadline = async () => {
    await getDeadline()
      .then((res) => {
        // console.log("old deadline: ", res.data);
        setOldDeadline((p) => res.data);
      })
      .catch((err) => {
        console.log("err: ", err);
      });
  };

  useEffect(() => {
    getOldDeadline();
  }, []);

  const handleInputChange = (event) => {
    setDateTime((prev) => {
      return event.target.value;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateTime) {
      // console.log(dateTime);
      await updateDeadline(dateTime)
        .then((res) => {
          // console.log("response: ", res.data);
          newDeadlineNotify(dateTime);
          getOldDeadline();
        })
        .catch((err) => {
          console.log("error: ", err);
        });
    } else {
    }
  };

  return (
    <div className="container mt-5">
      <form className="signup-form">
        <h4 className="text-center mb-4">Select New Deadline</h4>

        {oldDeadline !== "" ? (
          <div className="form-group">
            Old Deadline:
            <strong>
              {" "}
              {oldDeadline.split("T").reduce((a, b) => {
                return " " + a + " " + b;
              })}
            </strong>
          </div>
        ) : null}
        <div className="form-group">
          <label htmlFor="dateTime" className="form-label">
            Choose Date and Time
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            value={dateTime}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-block mt-3"
        >
          Submit
        </button>
        <div className="mt-3">
          <a href="/admin/records" className="btn btn-secondary btn-block">
            Back
          </a>
        </div>
      </form>
    </div>
  );
};

export default NewDeadline;
