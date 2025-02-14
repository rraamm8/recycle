import { Suspense, lazy, useEffect } from "react";
import { useState } from "react";
// const {createBrowserRouter} =require("react-router-dom");
import { createBrowserRouter, redirect, RouterProvider, Navigate } from "react-router-dom";

const Loading = <div>Loading....</div>
const Home = lazy(() => import("../Pages/home"))
const Login = lazy(() => import("../Pages/Login"))
const SignUp = lazy(() => import("../Pages/SignUp"))
const DashBoard = lazy(()=> import("../Dashboard/DashBoardMain"))
const FileUpload = lazy(()=> import("../Dashboard/FileUpload"))
const CRCDetailPage = lazy(()=>import("../Dashboard/CRCDetailPage"))
const VideoUploader = lazy(()=>import("../Dashboard/VideoUploader"))
const Logout = lazy(()=>import("../Pages/Logout"))
const LTDetailPage = lazy(()=>import("../Dashboard/LTDetailPage"))
const CalendarDetailPage = lazy(()=>import("../Dashboard/CalendarDetailPage"))


// // 로그아웃 시 상태 변경
// const handleLogout = () => {
//   sessionStorage.removeItem("jwtToken");
//   sessionStorage.removeItem("username");
//   setIsLoggedIn(false);
//   sessionStorage.clear();

//   console.log("logout");
// };
const loginCheck = () => {
  const isLoggedIn = !!sessionStorage.getItem("jwtToken");
  if (isLoggedIn) {
    return redirect(""); // 로그인되어 있으면 홈으로 리디렉션
  }
  return null; // 로그인되지 않았으면 아무것도 하지 않음
}

const root = createBrowserRouter([
    {
      path: "/",
      element:
        <Suspense fallback={Loading}>
          <Home />
        </Suspense>
    },
    {
      path: "/login",
      element:
        <Suspense fallback={Loading}>
          <Login />
        </Suspense>,
      loader : loginCheck,
    },
    {
      path: "/signup",
      element:
        <Suspense fallback={Loading}>
          <SignUp />
        </Suspense>
    },
    {
      path: "/dashboard",
      element:
        <Suspense fallback={Loading}>
          <DashBoard/>
        </Suspense>
    },
    {
      path: "/dashboard/:date",
      element:
        <Suspense fallback={Loading}>
          <CalendarDetailPage/> {/* 날짜별 데이터를 렌더링할 컴포넌트 */}
        </Suspense>
    },
    {
        path: "/calendar/:date",
        element: 
        <Suspense fallback={Loading}>
          <CalendarDetailPage/> {/* 날짜별 데이터를 렌더링할 컴포넌트 */}
        </Suspense>
      },
      
    {
      path: "/fileupload",
      element:
        <Suspense fallback={Loading}>
          <FileUpload/>
        </Suspense>
    },
    {
      path: "/CRCDetailPage",
      element:
        <Suspense fallback={Loading}>
          <CRCDetailPage/>
        </Suspense>
    },
    {
      path: "/videouploader",
      element:
        <Suspense fallback={Loading}>
          <VideoUploader/>
        </Suspense>
    },
    {
      path: "/logout",
      element:
        <Suspense fallback={Loading}>
          <Logout />
        </Suspense>
    },
    {
      path: "/LTDetailPage",
      element:
        <Suspense fallback={Loading}>
          <LTDetailPage />
        </Suspense>
    },
  ])
 export default root;
  // return <RouterProvider router={router} />;
