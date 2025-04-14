import { useLocation } from "react-router-dom"; // Hook to access navigation state
import StudentRegister from "./StudentRegister"; // Component for student registration
import LecturerRegister from "./LecturerRegister"; // Component for lecturer registration
import AdminRegister from "./AdminRegister"; // Component for admin (AR) registration

// Component that routes to the appropriate registration form based on user role
const RegisterRouter = () => {
  const location = useLocation(); // Get location state from router
  const role = location.state?.role || "student"; // Default role is 'student' if not provided

  // Conditional rendering based on role
  switch (role) {
    case "student":
      return <StudentRegister />;
    case "lecturer":
      return <LecturerRegister />;
    case "admin":
      return <AdminRegister />;
    default:
      return <StudentRegister />; // Fallback to student form for unknown roles
  }
};

export default RegisterRouter; // Export the router component
