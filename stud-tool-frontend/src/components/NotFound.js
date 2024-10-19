import React from "react";

const NotFound = () => {
  let path = "/";

  if (localStorage.getItem("coupon") === "SLOWCAR") {
    path = "/student";
  }
  if (localStorage.getItem("coupon") === "RACEWINNER") {
    path = "/admin";
  }
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href={path}>Go to Home</a>
    </div>
  );
};

export default NotFound;
