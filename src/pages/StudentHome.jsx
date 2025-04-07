import { useNavigate } from "react-router-dom"

export default function StudentHome() {
  const navigate = useNavigate();

  return(
  <>
    <div>Student Home</div>
    <button onClick={()=>navigate("/logout")}>Log Out</button>
  </>
  )
}