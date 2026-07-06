import { Box, Button, Container, Typography } from "@mui/material";

function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom>
          Task Tracker
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Frontend setup is working.
        </Typography>

        <Button variant="contained">MUI Button</Button>
      </Box>
    </Container>
  );
}

export default App;