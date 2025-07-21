import { useState } from "react";
import { FaEye, FaEyeSlash, FaWhatsapp } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Banner from "../../assets/HotelVhNPHJ.png";
import Logo from "../../assets/companylogo.b.png";
import { loginUser } from "../../redux/slice/LoginSlice";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { setCookie } from "../../utils/handleCookies";
import Whatsapp from "../../components/Contacts/WhtasApp";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye } from "react-icons/ai";
import { HiOutlineEyeOff } from "react-icons/hi";
import Loader from "../../components/Loader";
import axios from "axios";
import { BASE_URL } from "../../data/constant";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { verify } from "../../utils/verify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [spinnerLoader, setSpinnerLoader] = useState(false);
  const [forget, setForget] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSpinnerLoader(true);
    // Dispatch login action
    const response = await dispatch(loginUser(formData));
    let timerInterval;
    if (response.success === false) {
      setSpinnerLoader(false);
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
      setCookie("token", token || "");
      setSpinnerLoader(false);
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
      setSpinnerLoader(false);
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/eazotel/forgot/password`, {
        email: formData.email,
      });

      if (response?.data?.Status === true) {
        Swal.fire({
          title: "Password reset successfully",
          text: "Please check your email to reset your password.",
          icon: "success",
          confirmButtonText: "OK",
        });
        setForget(false);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "There was an error sending the email. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSuccess = async (response) => {
    setLoading(true);
    setError(null);
    try {
      const token = response.credential;
      console.log(token);

      const result = (await verify(token)).data;

      console.log(result)

      let timerInterval;
      if (result?.status === true) {
        handleLocalStorage("token", result?.token || "");
        setCookie("token", result?.token || "");
        // setSpinnerLoader(false);
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
      }

      // await testprotected(jwtToken);
      // saveToken(jwtToken);
      // navigate("/onboarding");
      return "Login successful";
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFailure = (error) => {
    console.error("Login Failed:", error);
    setError("Login failed. Please try again.");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="max-w-[1500px] w-full grid lg:grid-cols-2 items-center gap-4">
        <div className="aspect-[4/4]">
          <img
            src="/LoginImage.png"
            alt=""
            className="w-full h-full object-cover object-bottom"
          />
        </div>

        <div className="border p-6 rounded-2xl max-w-xl w-full mx-auto">
          <div>
            <div className="max-w-60 mx-auto aspect-[3/1]">
              <img
                src="/EAZOTEL LOGO.png"
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-text-black">Sign In</h2>
              <p className="text-text-gray">
                Provide Your Details to Access Your Account.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor=""
                  className="font-medium text-text-black text-md"
                >
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  placeholder="Enter you email"
                  className="p-4 border border-text-light  outline-none placeholder:text-gray-400 shadow-sm"
                  onChange={handleChange}
                  value={formData.email}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor=""
                  className="font-medium text-text-black text-md"
                >
                  Password
                </label>

                <div className="w-full relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="p-4 border border-text-light  outline-none placeholder:text-gray-400 shadow-sm w-full"
                    onChange={handleChange}
                    value={formData.password}
                  />

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 ">
                    {showPassword ? (
                      <AiOutlineEye
                        size={20}
                        onClick={togglePassword}
                        className="text-gray-400"
                      />
                    ) : (
                      <HiOutlineEyeOff
                        size={20}
                        onClick={togglePassword}
                        className="text-gray-400"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    <input type="checkbox" id="remember" className="mt-1" />
                    <label
                      htmlFor="remember"
                      className="text-sm text-text-black font-medium"
                    >
                      Remember Me
                    </label>
                  </div>

                  <p
                    onClick={() => setForget(true)}
                    className="cursor-pointer text-sm text-secondary  inline-block font-medium"
                  >
                    Forgot Password
                  </p>
                </div>
              </div>

              <div className="flex">
                <button className="bg-ternary text-white py-4 shadow-md w-full flex justify-center gap-3 items-center">
                  Sign In <SignInIcon />
                  {spinnerLoader && <Loader size={20} color="white" />}
                </button>
              </div>


              <div className="">
                <h1 className="font-medium text-lg text-text-black mb-3">Sign in using</h1>

                <GoogleOAuthProvider
                  clientId={"737012285391-mvm0kikmmfqm8vu8hr3lmcc39lb8blj2.apps.googleusercontent.com"}
                // clientSecret={"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"}
                >
                  <div className="flex justify-center w-full rounded-md">
                    <GoogleLogin
                      onSuccess={handleSuccess}
                      onError={handleFailure}
                      disabled={loading}
                      text="continue_with"
                      width="700px"
                      type="standard"
                      theme="filled_blue"
                      size="large"
                      shape="pill"
                      useOneTap={true}
                    />

                    {/* <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleFailure}
                    useOneTap
                  /> */}
                  </div>

                </GoogleOAuthProvider>
              </div>

              <div>
                <p className="text-md font-medium text-text-gray -mt-4">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signin"
                    className="text-secondary font-medium inline-block"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

const SignInIcon = () => {
  return (
    <svg
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 18.5V16.5H16V2.5H9V0.5H16C16.55 0.5 17.0208 0.695833 17.4125 1.0875C17.8042 1.47917 18 1.95 18 2.5V16.5C18 17.05 17.8042 17.5208 17.4125 17.9125C17.0208 18.3042 16.55 18.5 16 18.5H9ZM7 14.5L5.625 13.05L8.175 10.5H0V8.5H8.175L5.625 5.95L7 4.5L12 9.5L7 14.5Z"
        fill="white"
      />
    </svg>
  );
};

// <div className="w-full h-screen flex items-center justify-center md:px-6">
//     <div className="max-w-7xl w-full border-2 py-24 px-8 grid md:grid-cols-2 items-center gap-12 shadow-lg bg-white rounded-md">
//       <div>
//         <div className="w-full">
//           <img
//             src="/loginform.jpg"
//             className="object-cover w-full h-full"
//             alt="undraw-svg"
//           />
//         </div>
//       </div>

//       <div>
//         {!forget ?
//           <form onSubmit={handleSubmit}>
//             <div className="space-y-1">
//               <h2 className="font-bold text-xl">Welcome Back!</h2>
//               <h3 className="text-sm font-medium text-gray-500">
//                 Login your account!
//               </h3>
//             </div>

//             <div className="space-y-6 mt-6">
//               <div className="flex flex-col gap-2">
//                 <label htmlFor="" className="font-medium text-gray-600">
//                   Email
//                 </label>
//                 <input
//                   name="email"
//                   type="email"
//                   placeholder="Enter you email"
//                   className="px-4 py-3 border-2 border-gray-300 focus:border-primary/80 rounded-md outline-none placeholder:text-gray-400 shadow-sm"
//                   onChange={handleChange}
//                   value={formData.email}
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <label htmlFor="" className="font-medium text-gray-600">
//                   Password
//                 </label>

//                 <div className="w-full relative">
//                   <input
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary/80 rounded-md outline-none placeholder:text-gray-400 shadow-sm"
//                     onChange={handleChange}
//                     value={formData.password}
//                   />

//                   <div className="absolute right-3 top-1/2 -translate-y-1/2 ">
//                     {showPassword ? (
//                       <AiOutlineEye
//                         size={20}
//                         onClick={togglePassword}
//                         className="text-gray-400"
//                       />
//                     ) : (
//                       <HiOutlineEyeOff
//                         size={20}
//                         onClick={togglePassword}
//                         className="text-gray-400"
//                       />
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <p onClick={() => setForget(true)} className="cursor-pointer text-sm text-blue-600 underline inline-block font-medium">
//                   Forgot password?
//                 </p>
//               </div>

//               <div className="flex">
//                 <button className="bg-primary text-white px-4 py-2 rounded-full max-w-28 shadow-md w-full flex justify-center gap-3 items-center">
//                   Login {spinnerLoader && <Loader size={20} color="white" />}
//                 </button>
//               </div>
//             </div>

//             <div className="flex gap-3 items-center mt-5">
//               {/* <h2 className="text-gray-500 font-medium">
//                 Create an account with:
//               </h2> */}
//               {/* <div className="size-10 border border-gray-300 flex items-center justify-center rounded-full cursor-pointer"> */}
//               {/* <GoogleOAuthProvider
//                 clientId={"737012285391-mvm0kikmmfqm8vu8hr3lmcc39lb8blj2.apps.googleusercontent.com"}
//               // clientSecret={"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"}
//               >
//                 <div className="flex justify-center w-full border-2 rounded-md">
//                   <GoogleLogin
//                       onSuccess={handleSuccess}
//                       onError={handleFailure}
//                       disabled={loading}
//                       theme="outline"
//                       size="large"
//                       shape="rectangular"
//                       useOneTap
//                     />

//                   <GoogleLogin
//                     onSuccess={handleSuccess}
//                     onError={handleFailure}
//                     useOneTap
//                   />
//                 </div>

//               </GoogleOAuthProvider> */}

//               {/* </div> */}
//             </div>

//             <div>
//               <h2 className="text-gray-500 font-medium py-2 flex gap-2 items-center">
//                 Don't have an account?
//                 <Link to="https://app.eazotel.com" target="_blank" className="text-blue-600 underline">
//                   Sign up
//                 </Link>
//               </h2>
//             </div>
//           </form>
//           :

//           <form onSubmit={handleForgotSubmit}>
//             <div className="space-y-1">
//               <h2 className="font-bold text-xl">Welcome Back!</h2>
//               <h3 className="text-sm font-medium text-gray-500">
//                 Change password of your account!
//               </h3>
//             </div>

//             <div className="space-y-6 mt-6">
//               <div className="flex flex-col gap-2">
//                 <label htmlFor="" className="font-medium text-gray-600">
//                   Email
//                 </label>
//                 <input
//                   name="email"
//                   type="email"
//                   placeholder="Enter you email"
//                   className="px-4 py-3 border-2 border-gray-300 focus:border-primary/80 rounded-md outline-none placeholder:text-gray-400 shadow-sm"
//                   onChange={handleChange}
//                   value={formData.email}
//                 />
//               </div>

//               <div className="flex">
//                 <button className="bg-primary text-white px-4 py-2 rounded-full max-w-28 shadow-md w-full flex justify-center gap-3 items-center">
//                   Send Email {spinnerLoader && <Loader size={20} color="white" />}
//                 </button>
//               </div>
//             </div>

//             {/* <div className="flex gap-3 items-center mt-5">
//             <h2 className="text-gray-500 font-medium">
//               Create an account with:
//             </h2>
//             <div className="size-10 border border-gray-300 flex items-center justify-center rounded-full cursor-pointer">
//               <FcGoogle size={22} />
//             </div>
//           </div> */}

//             <div>
//               <h2 className="text-gray-500 font-medium p-2 flex gap-2 items-center">
//                 Do you know password?
//                 <p onClick={() => setForget(false)} className="cursor-pointer text-blue-600 underline">
//                   Login
//                 </p>
//               </h2>
//             </div>
//           </form>}
//       </div>
//     </div>
//   </div>
