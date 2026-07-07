import { useEffect, useState, type FormEvent } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from "@mui/icons-material/Save";
import type {
    Task,
    TaskStatus,
    UpdateTaskRequest,
} from "../../types/task.types";

type TaskListItemProps = {
    task: Task;
    isAdmin: boolean;
    onUpdate: (id: number, data: UpdateTaskRequest) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
};

type EditErrors = {
    title?: string;
    dueDate?: string;
    ownerId?: string;
    form?: string;
};

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];

const getStatusColor = (status: TaskStatus) => {
    if (status === "COMPLETED") {
        return "success";
    }

    if (status === "IN_PROGRESS") {
        return "warning";
    }

    return "default";
};

const formatDateForInput = (value: string) => {
    if (!value) {
        return "";
    }

    return value.slice(0, 10);
};

const TaskListItem = ({
    task,
    isAdmin,
    onUpdate,
    onDelete,
}: TaskListItemProps) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [dueDate, setDueDate] = useState(formatDateForInput(task.dueDate));
    const [ownerId, setOwnerId] = useState(String(task.ownerId));

    const [errors, setErrors] = useState<EditErrors>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
        setDueDate(formatDateForInput(task.dueDate));
        setOwnerId(String(task.ownerId));
    }, [task]);

    const validateForm = () => {
        const nextErrors: EditErrors = {};

        if (!title.trim()) {
            nextErrors.title = "Title is required.";
        }

        if (!dueDate) {
            nextErrors.dueDate = "Due date is required.";
        }

        if (isAdmin && Number(ownerId) <= 0) {
            nextErrors.ownerId = "Owner ID must be a valid number.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsUpdating(true);

        try {
            await onUpdate(task.id, {
                title: title.trim(),
                description: description.trim(),
                status,
                dueDate,
                ownerId: isAdmin ? Number(ownerId) : undefined,
            });

            setErrors({});
        } catch {
            setErrors({
                form: "Failed to update task. Please try again.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this task?");

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            await onDelete(task.id);
        } catch {
            setErrors({
                form: "Failed to delete task. Please try again.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Accordion
            disableGutters
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "14px !important",
                overflow: "hidden",
                "&::before": {
                    display: "none",
                },
            }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ width: "100%", pr: 2, alignItems: { xs: "flex-start", sm: "center" } }}
                >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700 }} noWrap>
                            {task.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Due: {formatDateForInput(task.dueDate)} • Owner ID: {task.ownerId}
                        </Typography>
                    </Box>

                    <Chip
                        label={task.status.replace("_", " ")}
                        color={getStatusColor(task.status)}
                        size="small"
                    />
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                {errors.form && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.form}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleUpdate} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Title"
                                value={title}
                                onChange={(event) => {
                                    setTitle(event.target.value);
                                    setErrors((prev) => ({ ...prev, title: undefined }));
                                }}
                                error={Boolean(errors.title)}
                                helperText={errors.title || " "}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                select
                                label="Status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value as TaskStatus)
                                }
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option.replace("_", " ")}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                label="Due Date"
                                type="date"
                                value={dueDate}
                                onChange={(event) => {
                                    setDueDate(event.target.value);
                                    setErrors((prev) => ({ ...prev, dueDate: undefined }));
                                }}
                                error={Boolean(errors.dueDate)}
                                helperText={errors.dueDate || " "}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                required
                            />
                        </Grid>

                        {isAdmin && (
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Owner ID"
                                    type="number"
                                    value={ownerId}
                                    onChange={(event) => {
                                        setOwnerId(event.target.value);
                                        setErrors((prev) => ({ ...prev, ownerId: undefined }));
                                    }}
                                    error={Boolean(errors.ownerId)}
                                    helperText={errors.ownerId || " "}
                                />
                            </Grid>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                multiline
                                minRows={3}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                                sx={{
                                    justifyContent: "flex-end"
                                }}
                            >
                                <Button
                                    color="error"
                                    variant="outlined"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDelete}
                                    disabled={isDeleting || isUpdating}
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={isUpdating || isDeleting}
                                >
                                    {isUpdating ? "Updating..." : "Update"}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default TaskListItem;