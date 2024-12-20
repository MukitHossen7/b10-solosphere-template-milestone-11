import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9000",
  withCredentials: true,
});
const useAxiosInstance = () => {
  const { logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log(error.response.status);
      if (error?.response?.status === 401 || error.response?.status === 403) {
        // logout
        logOut();
        // navigate
        navigate("/login");
      }
    }
  );
  return axiosInstance;
};

export default useAxiosInstance;
