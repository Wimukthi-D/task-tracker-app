import { useEffect, useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type {
    Task,
    TaskStatus,
    UpdateTaskRequest,
} from "../../types/task.types";
import type { AssignableUser } from "../../types/user.types";
import ConfirmDialog from "../common/ConfirmDialog";

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];

type TaskListItemProps = {
    task: Task;
    isAdmin: boolean;
    assignableUsers: AssignableUser[];
    onUpdate: (id: number, data: UpdateTaskRequest) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
};

type TaskEditForm = {
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string;
    ownerId: string;
};

const formatDateForInput = (date: string) => {
    return date ? date.slice(0, 10) : "";
};

const formatDateForDisplay = (date: string) => {
    return new Date(date).toLocaleDateString();
};

const TaskListItem = ({
    task,
    isAdmin,
    assignableUsers,
    onUpdate,
    onDelete,
}: TaskListItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const initialValues = useMemo<TaskEditForm>(
        () => ({
            title: task.title,
            description: task.description ?? "",
            status: task.status,
            dueDate: formatDateForInput(task.dueDate),
            ownerId: String(task.ownerId),
        }),
        [
            task.title,
            task.description,
            task.status,
            task.dueDate,
            task.ownerId,
        ]
    );

    const [form, setForm] = useState<TaskEditForm>(initialValues);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        setForm(initialValues);
        setIsEditing(false);
    }, [initialValues]);

    const hasChanges =
        form.title !== initialValues.title ||
        form.description !== initialValues.description ||
        form.status !== initialValues.status ||
        form.dueDate !== initialValues.dueDate ||
        (isAdmin && form.ownerId !== initialValues.ownerId);

    const isOwnerIdValid =
        !isAdmin ||
        assignableUsers.some(
            (assignedUser) => String(assignedUser.id) === form.ownerId
        );

    const isFormValid =
        form.title.trim().length > 0 &&
        Boolean(form.dueDate) &&
        isOwnerIdValid;

    const isUpdateDisabled = !hasChanges || !isFormValid || isSaving;

    const handleChange = <K extends keyof TaskEditForm>(
        field: K,
        value: TaskEditForm[K]
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCancel = () => {
        setForm(initialValues);
        setIsEditing(false);
    };

    const handleUpdate = async () => {
        if (isUpdateDisabled) {
            return;
        }

        const payload: UpdateTaskRequest = {};

        if (form.title !== initialValues.title) {
            payload.title = form.title.trim();
        }

        if (form.description !== initialValues.description) {
            payload.description = form.description.trim();
        }

        if (form.status !== initialValues.status) {
            payload.status = form.status;
        }

        if (form.dueDate !== initialValues.dueDate) {
            payload.dueDate = form.dueDate;
        }

        if (isAdmin && form.ownerId !== initialValues.ownerId) {
            payload.ownerId = Number(form.ownerId);
        }

        setIsSaving(true);

        try {
            await onUpdate(task.id, payload);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            await onDelete(task.id);
            setIsDeleteConfirmOpen(false)
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
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
                        direction={{ xs: "column", md: "row" }}
                        spacing={1.5}
                        sx={{
                            width: "100%",
                            pr: 2,
                            alignItems: { xs: "flex-start", md: "center" },
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 700 }}>{task.title}</Typography>

                            <Box sx={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 2,
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    Due date: {formatDateForDisplay(task.dueDate)}
                                </Typography>
                                {isAdmin && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ minWidth: { md: 180 } }}
                                    >
                                        Assigned to: {task.owner?.name ?? "Unknown user"}
                                    </Typography>
                                )}
                            </Box>

                        </Box>

                        <Chip
                            label={task.status.replace("_", " ")}
                            size="small"
                            color={
                                task.status === "COMPLETED"
                                    ? "success"
                                    : task.status === "IN_PROGRESS"
                                        ? "info"
                                        : "default"
                            }
                        />
                    </Stack>
                </AccordionSummary>

                <AccordionDetails>
                    {!isEditing ? (
                        <Stack spacing={2}>
                            <Typography color="text.secondary">
                                {task.description || "No description provided."}
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ justifyContent: "flex-end" }}
                            >
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </Button>
                            </Stack>
                        </Stack>
                    ) : (
                        <Stack spacing={2}>
                            <TextField
                                label="Title"
                                value={form.title}
                                onChange={(event) =>
                                    handleChange("title", event.target.value)
                                }
                                fullWidth
                                required
                            />

                            <TextField
                                label="Description"
                                value={form.description}
                                onChange={(event) =>
                                    handleChange("description", event.target.value)
                                }
                                fullWidth
                                multiline
                                minRows={3}
                            />

                            <TextField
                                select
                                label="Status"
                                value={form.status}
                                onChange={(event) =>
                                    handleChange(
                                        "status",
                                        event.target.value as TaskStatus
                                    )
                                }
                                fullWidth
                            >
                                {statusOptions.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status.replace("_", " ")}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Due Date"
                                type="date"
                                value={form.dueDate}
                                onChange={(event) =>
                                    handleChange("dueDate", event.target.value)
                                }
                                fullWidth
                                required
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            />

                            {isAdmin && (
                                <TextField
                                    select
                                    label="Assigned User"
                                    value={form.ownerId}
                                    onChange={(event) =>
                                        handleChange("ownerId", event.target.value)
                                    }
                                    fullWidth
                                    required
                                    error={!isOwnerIdValid}
                                    helperText={
                                        !isOwnerIdValid
                                            ? "Please select an assigned user."
                                            : ""
                                    }
                                >
                                    {assignableUsers.map((assignedUser) => (
                                        <MenuItem key={assignedUser.id} value={String(assignedUser.id)}>
                                            {assignedUser.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ justifyContent: "flex-end" }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleUpdate}
                                    disabled={isUpdateDisabled}
                                >
                                    {isSaving ? "Updating..." : "Update"}
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </AccordionDetails>
            </Accordion>
            <ConfirmDialog
                open={isDeleteConfirmOpen}
                title="Delete task?"
                description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="error"
                isLoading={isDeleting}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
};

export default TaskListItem;