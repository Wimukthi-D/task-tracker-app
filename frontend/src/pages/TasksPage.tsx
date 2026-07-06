import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

const TasksPage = () => {
    const { user } = useAuth();

    return (
        <AppLayout>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                    mb: 3,
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontSize: { xs: "1.8rem", sm: "2.2rem" },
                        }}
                    >
                        Tasks
                    </Typography>

                    <Typography color="text.secondary">
                        Welcome back, {user?.name}. Manage your tasks from here.
                    </Typography>
                </Box>
            </Stack>

            <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography sx={{ fontWeight: 700 }} gutterBottom>
                        Task module coming next
                    </Typography>

                    <Typography color="text.secondary">
                        The application layout is now responsive and ready for the task
                        table, filters, create dialog, edit dialog, and realtime updates.
                    </Typography>
                </CardContent>
            </Card>
        </AppLayout>
    );
};

export default TasksPage;