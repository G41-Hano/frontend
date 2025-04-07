import Form from "../components/Form";
import logo from "../assets/logo.png"; // adjust the path if needed
import "../index.css"

function Login() {
  return (
    <div className="flex h-screen bg-[#9FD6F4] font-sans items-center justify-center ">
      {/* Left side - Welcome panel */}
      <div className="w-1/2 bg-[#9FD6F4] text-white flex flex-col justify-center items-center px-10 h-full">
        <h1 className="text-5xl drop-shadow-md font-rubik-bubbles">Welcome</h1>
        <p className="text-lg mt-2">to</p>
        <img src={logo} alt="Hano Logo" className="w-40 h-auto mt-4 drop-shadow-lg" />
      </div>

      {/* Right side - Login form */}
      <div className="w-1/2 bg-white rounded-l-[100px] flex flex-col justify-center items-center px-12 h-full">
        <h2 className="text-3xl font-extrabold text-[#4C53B4] text-center mb-6">
          Learn beyond words,<br />
          Achieve beyond limits!
        </h2>

        <Form route="/api/token/" method="login" />
      </div>
    </div>
  );
}

export default Login;