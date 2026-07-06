import type { ReactNode } from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

type AppLayoutProps = {
    children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
    const { user, logout } = useAuth();

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
            <AppBar position="sticky">
                <Toolbar
                    sx={{
                        minHeight: { xs: 64, sm: 72 },
                        px: { xs: 2, sm: 3 },
                        gap: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                    >
                        Task Tracker
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                            alignItems: "center",
                            display: { xs: "none", sm: "flex" },
                        }}
                    >
                        <Box sx={{ textAlign: "right" }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                }}
                            >
                                {user?.name}
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                }}
                            >
                                {user?.role}
                            </Typography>
                        </Box>

                        <Stack
                            direction="column"
                            spacing={1.5}
                            sx={{
                                alignItems: "center",
                                justifyContent:"center",
                                display: { xs: "flex", sm: "flex" },
                            }}
                        >
                            <Button variant="outlined" size="small" onClick={logout}>
                                Logout
                            </Button>
                        </Stack>

                    </Stack>

                    {/* <Button
                        variant="outlined"
                        size="small"
                        onClick={logout}
                        sx={{
                            display: { xs: "inline-flex", sm: "none" },
                        }}
                    >
                        Logout
                    </Button> */}
                </Toolbar>
            </AppBar>

            <Container
                sx={{
                    py: { xs: 3, sm: 4 },
                }}
            >
                {children}
            </Container>
        </Box>
    );
};

export default AppLayout;