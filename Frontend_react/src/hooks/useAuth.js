import { useContext } from "react";
import { AuthContext } from '../context/AuthContext'; // Import the AuthContext

const useAuth = () => {
  return useContext(AuthContext); // Use the AuthContext
};

export default useAuth;
