import { useState, type FormEvent } from "react";
import {
    Alert,
    Box,
    Button,
    Link,
    TextField,
    Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";

type RegisterErrors = {
    name?: string;
    email?: string;
    password?: string;
    form?: string;
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<RegisterErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const nextErrors: RegisterErrors = {};

        if (!name.trim()) {
            nextErrors.name = "Name is required.";
        } else if (name.trim().length < 3) {
            nextErrors.name = "Name must be at least 3 characters.";
        }

        if (!email.trim()) {
            nextErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            nextErrors.email = "Please enter a valid email address.";
        }

        if (!password) {
            nextErrors.password = "Password is required.";
        } else if (password.length < 6) {
            nextErrors.password = "Password must be at least 6 characters.";
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
            await register({ name, email, password });
            navigate("/tasks");
        } catch {
            setErrors({
                form: "Registration failed. Please check your details.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Register" subtitle="Create your Task Tracker account.">
            {errors.form && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.form}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                    label="Name"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        setErrors((prev) => ({ ...prev, name: undefined, form: undefined }));
                    }}
                    error={Boolean(errors.name)}
                    helperText={errors.name || " "}
                    required
                />

                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);
                        setErrors((prev) => ({
                            ...prev,
                            email: undefined,
                            form: undefined,
                        }));
                    }}
                    error={Boolean(errors.email)}
                    helperText={errors.email || " "}
                    required
                />

                <TextField
                    label="Password"
                    type="password"
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
                    {isSubmitting ? "Creating account..." : "Register"}
                </Button>
            </Box>

            <Typography sx={{ mt: 3, textAlign: "center" }} >
                Already have an account?{" "}
                <Link component={RouterLink} to="/login">
                    Login
                </Link>
            </Typography>
        </AuthLayout>
    );
};

export default RegisterPage;