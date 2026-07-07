import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    MenuItem,
    Pagination,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AppLayout from "../components/AppLayout";
import TaskCreateDialog from "../components/tasks/TaskCreateDialog";
import TaskListItem from "../components/tasks/TaskListItem";
import { useAuth } from "../context/AuthContext";
import {
    createTaskApi,
    deleteTaskApi,
    getTasksApi,
    updateTaskApi,
} from "../api/task.api";
import type {
    CreateTaskRequest,
    Task,
    TaskStatus,
    UpdateTaskRequest,
} from "../types/task.types";
import { connectSocket } from "../realtime/socket";
import StackedSnackbar, {
    type AppNotification,
} from "../components/StackedSnackbar";
import { getUsersApi } from "../api/user.api";
import type { AssignableUser } from "../types/user.types";

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];

const TasksPage = () => {
    const { user, accessToken } = useAuth();

    const isAdmin = user?.role === "ADMIN";

    const [tasks, setTasks] = useState<Task[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
    const [ownerFilter, setOwnerFilter] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pageError, setPageError] = useState("");

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);

    const loadTasks = useCallback(async () => {
        if (!accessToken) {
            return;
        }

        setIsLoading(true);
        setPageError("");

        try {
            const response = await getTasksApi(accessToken, {
                page,
                limit,
                status: statusFilter || undefined,
                ownerId: isAdmin && ownerFilter ? Number(ownerFilter) : undefined,
            });

            setTasks(response.data);
            setTotalPages(response.pagination.totalPages || 1);
        } catch {
            setPageError("Failed to load tasks. Please refresh and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, page, limit, statusFilter, ownerFilter, isAdmin]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        const loadAssignableUsers = async () => {
            if (!accessToken || !isAdmin) {
                setAssignableUsers([]);
                return;
            }

            try {
                const response = await getUsersApi(accessToken);
                setAssignableUsers(response.data);
            } catch {
                addNotification("Failed to load assigned user list.", "error");
            }
        };

        loadAssignableUsers();
    }, [accessToken, isAdmin]);

    const addNotification = (
        message: string,
        severity: AppNotification["severity"] = "info"
    ) => {
        setNotifications((prev) => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                message,
                severity,
                open: true,
            },
        ]);
    };

    const closeNotification = (id: number) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? {
                        ...notification,
                        open: false,
                    }
                    : notification
            )
        );
    };

    const removeNotification = (id: number) => {
        setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id)
        );
    };

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        const socket = connectSocket(accessToken);


        // socket.on("connect_error", (error) => {
        //     addNotification("Realtime connection failed.", error);
        // });

        socket.on("task:created", async (task) => {
            addNotification(`${task.title}" was created by ${task.actor}.`, "success");
            await loadTasks();
        });

        socket.on("task:updated", async (task) => {
            addNotification(`${task.title} was updated by ${task.actor}.`, "info");
            await loadTasks();
        });

        socket.on("task:deleted", async (payload) => {
            addNotification(`Task #${payload.id} was deleted by ${payload.actor}.`, "warning");
            await loadTasks();
        });

        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("task:created");
            socket.off("task:updated");
            socket.off("task:deleted");
        };
    }, [accessToken, loadTasks]);

    const handleCreateTask = async (data: CreateTaskRequest) => {
        if (!accessToken) {
            return;
        }

        await createTaskApi(accessToken, data);
        setPage(1);
        await loadTasks();
    };

    const handleUpdateTask = async (id: number, data: UpdateTaskRequest) => {
        if (!accessToken) {
            return;
        }

        await updateTaskApi(accessToken, id, data);
        await loadTasks();
    };

    const handleDeleteTask = async (id: number) => {
        if (!accessToken) {
            return;
        }

        await deleteTaskApi(accessToken, id);

        if (tasks.length === 1 && page > 1) {
            setPage((prev) => prev - 1);
            return;
        }

        await loadTasks();
    };

    const handleStatusFilterChange = (value: TaskStatus | "") => {
        setStatusFilter(value);
        setPage(1);
    };

    const handleOwnerFilterChange = (value: string) => {
        setOwnerFilter(value);
        setPage(1);
    };

    const handleLimitChange = (value: string) => {
        setLimit(Number(value));
        setPage(1);
    };

    return (
        <AppLayout>
            <Stack
                direction={{ xs: "column", md: "row" }}

                spacing={2}
                sx={{
                    mb: 3,
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", md: "center" }
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
                        Create, filter, update, and manage tasks from one place.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateOpen(true)}
                    sx={{
                        alignSelf: { xs: "stretch", md: "center" },
                    }}
                >
                    Create New Task
                </Button>
            </Stack>

            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        sx={{ alignItems: { xs: "stretch", md: "center" } }}
                    >
                        <TextField
                            select
                            label="Filter by Status"
                            value={statusFilter}
                            onChange={(event) =>
                                handleStatusFilterChange(event.target.value as TaskStatus | "")
                            }
                            sx={{ minWidth: { md: 220 } }}
                        >
                            <MenuItem value="">All Statuses</MenuItem>

                            {statusOptions.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status.replace("_", " ")}
                                </MenuItem>
                            ))}
                        </TextField>

                        {isAdmin && (
                            <TextField
                                select
                                label="Assigned User"
                                value={ownerFilter}
                                onChange={(event) => handleOwnerFilterChange(event.target.value)}
                                sx={{ minWidth: { md: 220 } }}
                            >
                                <MenuItem value="">All Users</MenuItem>

                                {assignableUsers.map((assignedUser) => (
                                    <MenuItem key={assignedUser.id} value={String(assignedUser.id)}>
                                        {assignedUser.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        <TextField
                            select
                            label="Items per page"
                            value={String(limit)}
                            onChange={(event) => handleLimitChange(event.target.value)}
                            sx={{ minWidth: { md: 180 } }}
                        >
                            <MenuItem value="5">5</MenuItem>
                            <MenuItem value="10">10</MenuItem>
                            <MenuItem value="20">20</MenuItem>
                        </TextField>
                    </Stack>
                </CardContent>
            </Card>

            {pageError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {pageError}
                </Alert>
            )}

            <Stack spacing={2}>
                {isLoading ? (
                    <Card>
                        <CardContent
                            sx={{
                                minHeight: 180,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CircularProgress />
                        </CardContent>
                    </Card>
                ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskListItem
                            key={task.id}
                            task={task}
                            isAdmin={isAdmin}
                            assignableUsers={assignableUsers}
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                        />
                    ))
                ) : (
                    <Card>
                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: { xs: 5, sm: 7 },
                            }}
                        >
                            <Typography variant="h6">No tasks found</Typography>

                            <Typography color="text.secondary" sx={{ mt: 1 }}>
                                Create a new task or change the filters.
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Stack>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}

                sx={{
                    mt: 3, alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Page {page} of {totalPages}
                </Typography>

                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    shape="rounded"
                />
            </Stack>

            <TaskCreateDialog
                open={isCreateOpen}
                isAdmin={isAdmin}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreateTask}
            />

            <StackedSnackbar
                notifications={notifications}
                onClose={closeNotification}
                onExited={removeNotification}
            />

        </AppLayout>
    );
};

export default TasksPage;