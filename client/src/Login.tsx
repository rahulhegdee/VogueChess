import { GoogleLogin } from "@react-oauth/google";
import { Socket, io } from "socket.io-client";

type LoginProps = {
	setSocket: (socket: Socket) => void;
};

function Login({ setSocket }: LoginProps) {
	function connectToSocket(token: string | undefined) {
		if (token != null) {
			const socket = io("http://localhost:8080", {
				autoConnect: false,
				auth: { token },
			});

			setSocket(socket);
		}
	}
	return (
		<GoogleLogin
			onSuccess={(credentialResponse) => {
				connectToSocket(credentialResponse?.credential);
			}}
			onError={() => {
				console.log("Login Failed");
			}}
			useOneTap
		/>
	);
}

export default Login;
