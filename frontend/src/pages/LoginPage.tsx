import { useState, type FormEvent } from "react";
import {
    Alert,
    Box,
    Button,
    IconButton,
    Link,
    TextField,
    Typography,
    InputAdornment,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type LoginErrors = {
    email?: string;
    password?: string;
    form?: string;
};

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<LoginErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const nextErrors: LoginErrors = {};

        if (!email.trim()) {
            nextErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            nextErrors.email = "Please enter a valid email address.";
        }

        if (!password) {
            nextErrors.password = "Password is required.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            await login({ email, password });
            navigate("/tasks");
        } catch {
            setErrors({
                form: "Invalid email or password.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Login" subtitle="Sign in to manage your tasks.">
            {errors.form && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.form}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
                    }}
                    error={Boolean(errors.email)}
                    helperText={errors.email || " "}
                    required
                />

                <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value);
                        setErrors((prev) => ({
                            ...prev,
                            password: undefined,
                            form: undefined,
                        }));
                    }}
                    error={Boolean(errors.password)}
                    helperText={errors.password || " "}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        size="small"
                                        onMouseDown={(event) => event.preventDefault()}
                                        edge="end"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    required
                />

                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ mt: 2 }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Logging in..." : "Login"}
                </Button>
            </Box>

            <Typography sx={{ mt: 3, textAlign: "center" }} >
                Don&apos;t have an account?{" "}
                <Link component={RouterLink} to="/register">
                    Register
                </Link>
            </Typography>
        </AuthLayout>
    );
};

export default LoginPage;