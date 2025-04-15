import { useContext, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Main from "./pages/Home/Main";
import DataContext from "./context/DataContext";
import Login from "./pages/Login/Login";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const { auth, setAuth } = useContext(DataContext);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setAuth(true);
    }
  }, [localStorage.getItem('token')])
  return (
    <div className="overflow-hidden ">
      <div className="hidden lg:block">

        {auth ? (
          <>
            <Navbar />
            <Main />

            {/* <Footer /> */}
          </>
        ) : (
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}

      </div>

      {/* <Footer /> */}


      <div className="h-screen lg:hidden w-full flex justify-center items-center">
        Please open it on desktop view
      </div>
    </div >
  );
}

export default App;
