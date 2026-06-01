import { Card, CardActionArea, CardContent, Stack, Typography, Box, Skeleton } from '@mui/material';
import { useTopPending } from '../../hooks/useServiceRequests';
import { useSelection } from '../../context/SelectionContext';

export function TopRequestsWidget() {
  const { data = [], isLoading, isError } = useTopPending();
  const { selectedId, setSelectedId } = useSelection();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Top Pending Requests</Typography>
      {isError && <Typography color="error">Failed to load.</Typography>}
      <Stack spacing={1.5}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={80} />
            ))
          : data.map(req => (
              <Card
                key={req.id}
                variant="outlined"
                sx={{
                  borderColor: selectedId === req.id ? 'primary.main' : undefined,
                  borderWidth: selectedId === req.id ? 2 : 1,
                }}
              >
                <CardActionArea onClick={() => setSelectedId(req.id)}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {req.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {req.requesterName} → {req.requesteeName}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
      </Stack>
    </Box>
  );
}
