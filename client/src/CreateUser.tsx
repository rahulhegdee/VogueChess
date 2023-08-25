import { FormEvent, useState, useContext } from "react";
import { SocketContext } from "./App";

function CreateUser({ setUsername }: { setUsername: (u: string) => void }) {
	const socket = useContext(SocketContext);
	const [name, setName] = useState("");

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		socket.emit("CREATE_USER", name);
		setUsername(name);
	};

	return (
		<form onSubmit={handleSubmit}>
			<label>
				Input Username:
				<input
					type="text"
					value={name}
					name="username"
					onChange={(e) => setName(e.target.value)}
				/>
			</label>
			<input type="submit" value="Submit" />
		</form>
	);
}

export default CreateUser;
