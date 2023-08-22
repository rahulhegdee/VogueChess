import { OAuth2Client } from "google-auth-library";
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = "http://localhost:3000/lobby";
const client = new OAuth2Client(clientId, clientSecret, redirectUri);
export async function verify(token: string) {
	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: clientId,
		});
		const payload = ticket.getPayload();
		return { user: payload };
	} catch {
		return { error: "Invalid User." };
	}
}
