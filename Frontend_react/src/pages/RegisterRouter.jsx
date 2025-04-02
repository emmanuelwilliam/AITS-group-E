import { useLocation } from "react-router-dom";
import StudentRegister from "./StudentRegister";
import LecturerRegister from "./LecturerRegister";
import AdminRegister from "./AdminRegister";

const RegisterRouter = () => {
  const location = useLocation();
  const role = location.state?.role || "student";

  switch (role) {
    case "student":
      return <StudentRegister />;
    case "lecturer":
      return <LecturerRegister />;
    case "admin":
      return <AdminRegister />;
    default:
      return <StudentRegister />;
  }
};

export default RegisterRouter;