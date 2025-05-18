import { useState } from "react";
import { FaEye, FaEyeSlash, FaWhatsapp } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Banner from "../../assets/HotelVhNPHJ.png";
import Logo from "../../assets/companylogo.b.png";
import { loginUser } from "../../redux/slice/LoginSlice";
import handleLocalStorage from "../../utils/handleLocalStorage";
const Login = () => {
  const [formData, setFormData] = useState({
    // email: 'reservation@minimalisthotes.com',
    email: "",
    // email: '',
    // email: '',
    password: "",
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error] = useState("");
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Dispatch login action
    const response = await dispatch(loginUser(formData));
    // console.log(response);
    let timerInterval;
    if (response.success === false) {
      Swal.fire({
        title: "Logged Failed",
        html: "Navigating you to Login <b></b>",
        timer: 700,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 1000);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      });
    } else if (response.data.Status) {
      const token = response?.data?.Token;
      handleLocalStorage("token", token || "");
      Swal.fire({
        title: "Logged in Successfully",
        html: "We will redirect you to the dashboard <b></b>",
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 1000);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          navigate("/");
        }
      });
    } else {
      Swal.fire({
        title: "Logged Failed",
        html: "Navigating you to Login <b></b>",
        timer: 700,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 1000);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      });
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="max-w-[1600px] mx-auto bg-[#f5f5f5] w-full h-[100vh] grid grid-cols-1 lg:grid-cols-2">
      <div className="h-screen bg-white overflow-hidden">
        <div className="h-[6vh] px-3">
          <img src={Logo} alt="image" className="w-[132px] object-cover" />
        </div>
        <div className="flex justify-center items-center h-[94vh]">
          <form
            className=" md:w-[25rem] p-5 rounded-md"
            onSubmit={handleSubmit}
          >
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-[14px] font- text-[#575757]/70 mt-2">
              Please enter your details
            </p>
            <div className="flex flex-col flex-1 gap-5 w-full h-full mt-5">
              <div className="flex flex-col gap-1 ">
                <label
                  htmlFor="username"
                  className="text-black font-medium !text-[14px]"
                >
                  Email address
                </label>
                <input
                  type="text"
                  placeholder="Enter email"
                  id="email"
                  name="email"
                  value={formData?.email}
                  onChange={handleChange}
                  className={` ${
                    error === "email"
                      ? "border border-red-600 text-red-600 animate-pulse"
                      : "border text-black/70"
                  }   px-3 rounded-lg focus:outline-none  outline-none text-[14px] py-2`}
                />
              </div>
              {/* {!error && <p className="error-message text-[#0a3a75]">{error ? error : "This is the error field"}</p>} */}
              <div className="flex flex-col gap-1 relative">
                <label
                  htmlFor="password"
                  className="text-black font-medium text-[14px]"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  id="password"
                  name="password"
                  value={formData?.password}
                  // required
                  onChange={handleChange}
                  className={` ${
                    error === "password"
                      ? "border border-red-600 text-red-600 animate-pulse"
                      : "border text-black/70"
                  }   px-3 rounded-lg focus:outline-none  outline-none text-[14px] py-2`}
                />

                {/* Eye Icon */}
                <span
                  onClick={togglePassword}
                  className="absolute right-2 top-[45%] translate-y-1/2 cursor-pointer text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 text-[14px] font-medium">
                <div className="flex items-center gap-1">
                  <input type="checkbox" id="Remember-me" className="w-3 h-3" />
                  <label htmlFor="Remember-me ">Remember me</label>
                </div>
                <div className="text-[#0a3a75] cursor-pointer underline">
                  Forget password?
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#0a3a75] text-[14px] font-medium text-white py-2.5 px-4 rounded-lg"
              >
                Login
              </button>

              <button class="flex items-center justify-center bg-white text-black/70 border border-gray-300 rounded-lg px-6 py-2 text-sm font-medium    focus:outline-none">
                <svg
                  className="h-6 w-6 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  width="800px"
                  height="800px"
                  viewBox="-0.5 0 48 48"
                  version="1.1"
                >
                  <title>Google-color</title>
                  <desc>Created with Sketch.</desc>
                  <g
                    id="Icons"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="Color-"
                      transform="translate(-401.000000, -860.000000)"
                    >
                      <g
                        id="Google"
                        transform="translate(401.000000, 860.000000)"
                      >
                        <path
                          d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                          id="Fill-1"
                          fill="#FBBC05"
                        />
                        <path
                          d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                          id="Fill-2"
                          fill="#EB4335"
                        />
                        <path
                          d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                          id="Fill-3"
                          fill="#34A853"
                        />
                        <path
                          d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                          id="Fill-4"
                          fill="#4285F4"
                        />
                      </g>
                    </g>
                  </g>
                </svg>

                <span>Continue with Google</span>
              </button>

              <p className="text-[14px] text-center">
                Dont have an account?{" "}
                <Link
                  to="/https://www.eazotel.com"
                  target="_blank"
                  className="text-[#0a3a75]"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
        <Link
          to="https://wa.me/9528295631?text=Hi%20there!%20%F0%9F%91%8B%0AWelcome%20to%20Eazotel%20%F0%9F%8C%90%0AHow%20can%20I%20assist%20you%20today%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 absolute left-5 bottom-2 text-[14px] font-medium text-black/70 cursor-pointer"
        >
          <FaWhatsapp className="text-black/70" />
          Chat with us on WhatsApp
        </Link>
      </div>

      <div className="hidden lg:flex justify-center items-center">
        <img srcSet={Banner} alt="image" className="h-[100%] object-cover" />
      </div>
    </div>
  );
};

export default Login;
