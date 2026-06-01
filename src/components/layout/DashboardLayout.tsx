import { Box, Container, Typography, AppBar, Toolbar, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { RequestListWidget } from '../RequestListWidget/RequestListWidget';
import { TopRequestsWidget } from '../TopRequestsWidget/TopRequestsWidget';
import { NotesWidget } from '../NotesWidget/NotesWidget';

export function DashboardLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Service Request Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3, flexGrow: 1 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ height: 600 }}>
            <RequestListWidget />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="column" spacing={3}>
              <TopRequestsWidget />
              <Box sx={{ height: 260 }}>
                <NotesWidget />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
