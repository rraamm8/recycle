import { Suspense, lazy } from "react";

// const {createBrowserRouter} =require("react-router-dom");
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading....</div>
const Login = lazy(()=>import("../Pages/Login"))
const SignUp = lazy(()=>import("../Pages/SignUp"))



const root = createBrowserRouter([
  {
    path:"/login",
    element:
    <Suspense fallback={Loading}>
      <Login/>
    </Suspense>
  },
  {
    path:"signup",
    element:
    <Suspense fallback={Loading}>
      <SignUp/>
    </Suspense>
  }
])

export default root;