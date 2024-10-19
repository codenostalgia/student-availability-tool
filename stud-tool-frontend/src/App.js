import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import AddAdmin from "./components/AddAdmin";
import AddStudent from "./components/AddStudent";
import AdminHeader from "./components/AdminHeader";
import Availability from "./components/Availability";
import EditRecord from "./components/EditRecord";
import EditStudent from "./components/EditStudent";
import Login from "./components/Login";
import NewDeadline from "./components/NewDeadline";
import NotFound from "./components/NotFound";
import Records from "./components/Records";
import ReportGenerator from "./components/ReportGenerator";
import SignUp from "./components/SignUp";
import StudentForm from "./components/StudentForm";
import StudentHeader from "./components/StudentHeader";
import VerifyOTP from "./components/VerifyOTP";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="verify" element={<VerifyOTP />} />
        <Route path="student" element={<StudentHeader />}>
          <Route index element={<StudentForm />}></Route>
          <Route path="availability" element={<Availability />}></Route>
        </Route>
        <Route path="admin" element={<AdminHeader />}>
          <Route index element={<Records />}></Route>
          <Route path="records" element={<Records />}></Route>
          <Route path="records/edit" element={<EditRecord />}></Route>
          <Route path="addstudent" element={<AddStudent />}></Route>
          <Route path="report" element={<ReportGenerator />}></Route>
          <Route path="edit" element={<EditStudent />}></Route>
          <Route path="addadmin" element={<AddAdmin />}></Route>
          <Route path="deadline" element={<NewDeadline />}></Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
