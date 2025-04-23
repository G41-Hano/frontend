import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom"

export default function TeacherHome() {
  const navigate = useNavigate();

  return(
  <div className="p-5">
    <div>Teacher Home</div>
    {/* <button onClick={()=>navigate("/logout")}>Log Out</button> */}
    <Button variant="outlined" onClick={()=>navigate("/logout")}>Log Out</Button>
  </div>
  )
}