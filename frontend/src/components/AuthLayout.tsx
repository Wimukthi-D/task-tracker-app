import type { ReactNode } from "react";
import { Box, Card, CardContent, Container, Typography } from "@mui/material";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, sm: 6 },
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #eef2ff 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.9rem", sm: "2.3rem" },
              fontWeight: 800,
            }}
          >
            Task Tracker
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Manage tasks with role-based access and realtime updates.
          </Typography>
        </Box>

        <Card>
          <CardContent
            sx={{
              p: { xs: 3, sm: 4 },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.75rem" },
                mb: 0.5,
              }}
            >
              {title}
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>

            {children}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AuthLayout;