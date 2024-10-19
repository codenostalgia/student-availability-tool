import axios from "axios";

axios.defaults.baseURL = "backend_route";

function userSignUp(data) {
  return axios({
    method: "post",
    url: "./signup",
    data: data,
  });
}

function verify(data) {
  return axios({
    method: "post",
    url: "./verify",
    data: data,
  });
}

function userLogin(data) {
  return axios({
    method: "post",
    url: "./login",
    data: data,
  });
}

function updateSlot(data) {
  return axios({
    method: "post",
    url: "./update",
    data: data,
  });
}

function getStudents() {
  return axios({
    method: "get",
    url: "./students",
  });
}

function addNewAdmin(data) {
  return axios({
    method: "post",
    url: "./newadmin",
    data: data,
  });
}

function updateDeadline(deadline) {
  const queryParams = {
    deadline: deadline,
  };

  return axios({
    method: "put",
    url: "./deadline-update",
    params: queryParams,
  });
}

function getDeadline() {
  return axios({
    method: "get",
    url: "./deadline",
  });
}

function deleteRecord(data) {
  return axios({
    method: "delete",
    url: "./delete-record",
    data: data,
  });
}

function editRecord(oldRecord, newRecord) {
  return axios({
    method: "patch",
    url: "./edit-record",
    data: {
      oldRecord: oldRecord,
      newRecord: newRecord,
    },
  });
}

function addstudent(data) {
  return axios({
    method: "post",
    url: "./add-student",
    data: data,
  });
}

function getRecords(email) {
  const queryParams = {
    email: email,
  };
  return axios({
    method: "get",
    url: "./get-records",
    params: queryParams,
  });
}

function getStudentsList() {
  return axios({
    method: "get",
    url: "./get-students-list",
  });
}

function deleteSTudent(email) {
  const queryParams = {
    email: email,
  };
  return axios({
    method: "delete",
    url: "./delete-student",
    params: queryParams,
  });
}

function updateStudent(data) {
  return axios({
    method: "put",
    url: "./update-student",
    data: data,
  });
}

function fetchReport(data) {
  return axios({
    method: "post",
    url: "./on-deamnd-report",
    data: data,
    responseType: "blob",
  });
}

export {
  addNewAdmin,
  addstudent,
  deleteRecord,
  deleteSTudent,
  editRecord,
  fetchReport,
  getDeadline,
  getRecords,
  getStudents,
  getStudentsList,
  updateDeadline,
  updateSlot,
  updateStudent,
  userLogin,
  userSignUp,
  verify,
};
