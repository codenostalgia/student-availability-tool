import * as React from "react";
import { useEffect } from "react";
import { fetchReport } from "../axios_http/AxiosRequests";
import "./style/ReportGenerator.css"

const ReportGenerator = (props) => {
  useEffect(() => {
    const handleSubmit = (event) => {
      event.preventDefault();
      const startDate = document.getElementById("from").value.trim();
      const endDate = document.getElementById("till").value.trim();
      const format = document.getElementById("format").value.trim();

      const data = {
        start: startDate,
        end: endDate,
        format: format,
      };

      // Simple validation
      if (startDate !== "" && endDate !== "" && format !== "") {
        // console.log("data: ", data);
        fetchDesiredReport(data);
      }
    };

    const form = document.getElementById("reportForm");
    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  const fetchDesiredReport = async (data) => {
    await fetchReport(data)
      .then((res) => {
        // console.log("fetched: ", res);

        const filename =
          res.headers["x-filename"] ||
          res.headers["X-FILENAME"] ||
          res.headers["X-Filename"] ||
          res.headers["X-Filename"];

        if (filename) {
          // console.log("filename: ", filename);
          // console.log("headers: ", res.headers);
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } else {
          // console.log("Error in Fetching desired report");
        }
      })
      .catch((err) => {
        console.log("Error in Fetching desired report: ", err);
      });
  };

  return (
    <div className="signup container mt-5">
      <form className="signup-form border p-4 rounded shadow" id="reportForm">
        <h2 className="text-center mb-4">Export Report</h2>
        <div className="row">
          <div className="col-12 col-md-6 mb-3">
            <div className="form-group">
              <label htmlFor="from">From [Included]</label>
              <input
                type="date"
                id="from"
                name="from"
                className="form-control"
                required
              />
            </div>
          </div>
          <div className="col-12 col-md-6 mb-3">
            <div className="form-group">
              <label htmlFor="till">Till [Included]</label>
              <input
                type="date"
                id="till"
                name="till"
                className="form-control"
                required
              />
            </div>
          </div>
          <div className="col-12 mb-3">
            <div className="form-group">
              <label htmlFor="format">Format</label>
              <select
                id="format"
                name="format"
                className="form-control"
                required
              >
                <option value="0">Excel</option>
                <option value="1">CSV</option>
              </select>
            </div>
          </div>
          <div className="col-12">
            <button type="submit" className="btn my-btn btn-primary btn-block">
              Generate
            </button>
          </div>
          <div className="col-12 mt-3">
            <a href="/admin/records" className="btn my-btn btn-secondary btn-block">
              Back
            </a>
          </div>
        </div>
        <div id="message" className="mt-3"></div>
      </form>
    </div>
  );
};

export default ReportGenerator;
