import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    type ButtonProps,
} from "@mui/material";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: ButtonProps["color"];
    isLoading?: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
};

const ConfirmDialog = ({
    open,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "primary",
    isLoading = false,
    onClose,
    onConfirm,
}: ConfirmDialogProps) => {
    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Typography color="text.secondary">{description}</Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={isLoading}>
                    {cancelText}
                </Button>

                <Button
                    variant="contained"
                    color={confirmColor}
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? "Please wait..." : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;