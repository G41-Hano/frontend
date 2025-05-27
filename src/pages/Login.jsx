import Form from "../components/Form";
import logo from "../assets/logo.png"; // adjust the path if needed
import bgImage from "../assets/bg_loginregister.png"
import MouseTrail from "../components/MouseTrail"
import "../index.css"
import { useNotifications } from '../contexts/NotificationContext';

function Login() {
  const { refreshNotifications } = useNotifications();

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between relative overflow-hidden">
      {/* Left side - Welcome panel */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <MouseTrail excludeSelector=".form-container" />

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center py-8 md:py-0 relative z-10">
        <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 md:bg-transparent md:backdrop-blur-none">
          <h1 className="text-6xl md:text-8xl drop-shadow-md font-rubik-bubbles text-white text-center">Welcome</h1>
          <p className="text-3xl mt-2 text-white text-center font-rubik-bubbles">to</p>
          <img src={logo} alt="Hano Logo" className="w-50 md:w-62 h-auto mt-4 drop-shadow-lg mx-auto" />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="form-container w-full md:w-1/2 bg-white/80 backdrop-blur-md md:rounded-l-[100px] flex flex-col justify-center items-center px-4 md:px-12 py-8 min-h-[60vh] md:min-h-screen relative z-10 shadow-[0_0_50px_0_rgba(76,83,180,0.2)] hover:shadow-[0_0_70px_0_rgba(76,83,180,0.3)] transition-shadow duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#4C53B4] drop-shadow-sm">
            Learn beyond words,
          </h2>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#4C53B4] drop-shadow-sm">
            Achieve beyond limits!
          </h2>
        </div>

        <Form
          route="/api/token/"
          method="login"
          onSuccess={refreshNotifications}
        />
      </div>
    </div>
  );
}

export default Login;