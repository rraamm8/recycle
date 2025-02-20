import { useEffect } from "react"
import { Link,useNavigate } from 'react-router-dom'

export default function Logout() {
  const navigate = useNavigate();

  // // 로그아웃 시 상태 변경
  const handleLogout = () => {
    sessionStorage.clear();
    console.log("logout");
    navigate("/");
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div>
      Logout
    </div>
  )
}
