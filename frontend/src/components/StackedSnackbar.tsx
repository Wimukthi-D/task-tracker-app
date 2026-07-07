import { Alert, Snackbar, Slide, type AlertColor } from "@mui/material";
import type { SlideProps } from "@mui/material/Slide";

export type AppNotification = {
  id: number;
  message: string;
  severity: AlertColor;
  open: boolean;
};

type StackedSnackbarProps = {
  notifications: AppNotification[];
  onClose: (id: number) => void;
  onExited: (id: number) => void;
};

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="left" />;
};

const StackedSnackbar = ({
  notifications,
  onClose,
  onExited,
}: StackedSnackbarProps) => {
  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={notification.open}
          autoHideDuration={3500}
          onClose={(_, reason) => {
            if (reason === "clickaway") {
              return;
            }

            onClose(notification.id);
          }}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          slots={{
            transition: SlideTransition,
          }}
          slotProps={{
            transition: {
              onExited: () => onExited(notification.id),
            },
          }}
          sx={{
            top: `${24 + index * 72}px !important`,
            right: { xs: "16px !important", sm: "24px !important" },
          }}
        >
          <Alert
            severity={notification.severity}
            variant="filled"
            onClose={() => onClose(notification.id)}
            sx={{
              width: "100%",
              minWidth: { xs: 280, sm: 360 },
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default StackedSnackbar;