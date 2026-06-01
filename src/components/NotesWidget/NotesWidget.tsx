import { Paper, Typography, Divider, Box } from '@mui/material';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import { useServiceRequest } from '../../hooks/useServiceRequests';
import { useSelection } from '../../context/SelectionContext';

export function NotesWidget() {
  const { selectedId } = useSelection();
  const { data: request, isLoading } = useServiceRequest(selectedId);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Notes</Typography>
      <Divider sx={{ mb: 2 }} />
      {!selectedId ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'text.disabled', pt: 4, gap: 1 }}>
          <NoteAltOutlinedIcon sx={{ fontSize: 48 }} />
          <Typography variant="body2">Select a request to view its notes</Typography>
        </Box>
      ) : isLoading ? (
        <Typography variant="body2" color="text.secondary">Loading...</Typography>
      ) : request ? (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
            {request.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {request.description ?? 'No description provided.'}
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
}
