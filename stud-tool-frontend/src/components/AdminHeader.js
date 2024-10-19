import * as React from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./style/AddHeader.css";

const AdminHeader = (props) => {
  const navigate = useNavigate();

  const logOutNotify = () => {
    (() => {
      toast.success(`Logged Out !!`, {
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

  React.useEffect(() => {
    const coupon = localStorage.getItem("coupon");
    if (!coupon || coupon !== "RACEWINNER") {
      navigate("/login");
    }
  });

  const logoutHandler = (e) => {
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("coupon");
    logOutNotify();
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="light" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand href="">Hello Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/admin/records">Home</Nav.Link>
              <Nav.Link href="/admin/addstudent">Students</Nav.Link>
              <Nav.Link href="/admin/report">Export</Nav.Link>
              <Nav.Link href="/admin/deadline">Deadline</Nav.Link>
              <Nav.Link href="/admin/addadmin">Add Admin</Nav.Link>
              <Button variant="outline-danger log-out" onClick={logoutHandler}>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <br />
      <Outlet />
    </>
  );
};

export default AdminHeader;
