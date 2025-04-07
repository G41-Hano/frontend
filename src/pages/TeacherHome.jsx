import { useNavigate } from "react-router-dom"

export default function TeacherHome() {
  const navigate = useNavigate();

  return(
  <>
    <div>Teacher Home</div>
    <button onClick={()=>navigate("/logout")}>Log Out</button>
  </>
  )
}