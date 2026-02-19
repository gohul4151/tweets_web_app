import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function Login({ setlog }) {
    const inputemail = useRef(null);
    const inputpass = useRef(null);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function send(e) {
        e.preventDefault();
        const email = inputemail.current.value;
        const password = inputpass.current.value;

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.ok && data.message === "Login success") {
                if (data.token) localStorage.setItem("token", data.token); // Store token for header auth
                setlog(true);
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={send} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300">
                    Email
                </label>
                <input
                    ref={inputemail}
                    type="email"
                    className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:text-white"
                    placeholder="name@example.com"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300">
                    Password
                </label>
                <div className="relative">
                    <input
                        ref={inputpass}
                        type={showPassword ? "text" : "password"}
                        className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:text-white pr-10"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-sm font-medium text-red-500 dark:text-red-400">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors"
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}

export default Login;