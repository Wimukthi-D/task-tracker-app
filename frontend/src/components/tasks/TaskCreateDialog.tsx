import { useState, type FormEvent } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";
import type {
    CreateTaskRequest,
    TaskStatus,
} from "../../types/task.types";

type TaskCreateDialogProps = {
    open: boolean;
    isAdmin: boolean;
    onClose: () => void;
    onCreate: (data: CreateTaskRequest) => Promise<void>;
};

type CreateErrors = {
    title?: string;
    dueDate?: string;
    ownerId?: string;
    form?: string;
};

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];

const TaskCreateDialog = ({
    open,
    isAdmin,
    onClose,
    onCreate,
}: TaskCreateDialogProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TaskStatus>("TODO");
    const [dueDate, setDueDate] = useState("");
    const [ownerId, setOwnerId] = useState("");

    const [errors, setErrors] = useState<CreateErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setStatus("TODO");
        setDueDate("");
        setOwnerId("");
        setErrors({});
        setIsSubmitting(false);
    };

    const handleClose = () => {
        if (isSubmitting) {
            return;
        }

        resetForm();
        onClose();
    };

    const validateForm = () => {
        const nextErrors: CreateErrors = {};

        if (!title.trim()) {
            nextErrors.title = "Title is required.";
        }

        if (!dueDate) {
            nextErrors.dueDate = "Due date is required.";
        }

        if (isAdmin && ownerId && Number(ownerId) <= 0) {
            nextErrors.ownerId = "Owner ID must be a valid number.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onCreate({
                title: title.trim(),
                description: description.trim(),
                status,
                dueDate,
                ownerId: isAdmin && ownerId ? Number(ownerId) : undefined,
            });

            resetForm();
            onClose();
        } catch {
            setErrors({
                form: "Failed to create task. Please check the details and try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <DialogTitle>Create New Task</DialogTitle>

                <DialogContent dividers>
                    {errors.form && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errors.form}
                        </Alert>
                    )}

                    <Stack spacing={1}>
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

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            multiline
                            minRows={3}
                        />

                        <TextField
                            select
                            label="Status"
                            value={status}
                            onChange={(event) => setStatus(event.target.value as TaskStatus)}
                        >
                            {statusOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option.replace("_", " ")}
                                </MenuItem>
                            ))}
                        </TextField>

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

                        {isAdmin && (
                            <TextField
                                label="Owner ID"
                                type="number"
                                value={ownerId}
                                onChange={(event) => {
                                    setOwnerId(event.target.value);
                                    setErrors((prev) => ({ ...prev, ownerId: undefined }));
                                }}
                                error={Boolean(errors.ownerId)}
                                helperText={
                                    errors.ownerId ||
                                    "Optional. Leave empty to use backend default behavior."
                                }
                            />
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>

                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Task"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default TaskCreateDialog;