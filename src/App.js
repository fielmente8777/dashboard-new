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
    <div>

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


      {/* <Footer /> */}
    </div >
  );
}

export default App;
