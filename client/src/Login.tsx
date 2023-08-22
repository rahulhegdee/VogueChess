import { GoogleLogin } from "@react-oauth/google";

type LoginProps = {
	setToken: (token: string) => void;
};

function Login({ setToken }: LoginProps) {
	function connectToSocket(token: string | undefined) {
		if (token != null) {
			setToken(token);
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
