import * as React from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentHeader = (props) => {
  const [name, setName] = React.useState(localStorage.getItem("name"));
  const [email, setEmail] = React.useState(localStorage.getItem("id"));
  const [coupon, setCoupon] = React.useState(localStorage.getItem("coupon"));

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
    if (!email || !coupon || coupon !== "SLOWCAR") {
      navigate("/login");
    }

    setName(name);
  }, []);

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
          <Navbar.Brand href="">Hello {name}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/student">Home</Nav.Link>
              <Nav.Link href="/student/availability">
                Edit Availability
              </Nav.Link>
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

export default StudentHeader;
