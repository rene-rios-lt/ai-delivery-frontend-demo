import { useState, type ChangeEvent } from 'react';
import { DataGrid, type GridColDef, type GridRowParams, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Paper, Typography, Box, TextField } from '@mui/material';
import { useServiceRequests } from '../../hooks/useServiceRequests';
import { useSelection } from '../../context/SelectionContext';

const columns: GridColDef[] = [
  { field: 'title', headerName: 'Title', flex: 2, minWidth: 200 },
  { field: 'requesterName', headerName: 'Requester', flex: 1, minWidth: 130 },
  { field: 'requesteeName', headerName: 'Requestee', flex: 1, minWidth: 130 },
  {
    field: 'createdAt',
    headerName: 'Created',
    width: 120,
    valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
  },
];

export function RequestListWidget() {
  const { data = [], isLoading, isError } = useServiceRequests();
  const { selectedId, setSelectedId } = useSelection();
  const [filterText, setFilterText] = useState('');

  const activeFilter = filterText.trim().toLowerCase();
  const filteredRows = activeFilter
    ? data.filter(
        r =>
          r.title.toLowerCase().includes(activeFilter) ||
          r.requesterName.toLowerCase().includes(activeFilter) ||
          r.requesteeName.toLowerCase().includes(activeFilter)
      )
    : data;

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>All Requests</Typography>
      {isError && <Typography color="error">Failed to load requests.</Typography>}
      <TextField
        size="small"
        placeholder="Search by title, requester, or requestee…"
        value={filterText}
        onChange={handleFilterChange}
        slotProps={{ htmlInput: { 'aria-label': 'Search requests' } }}
        sx={{ mb: 1 }}
        fullWidth
      />
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={isLoading}
          localeText={{
            noRowsLabel: activeFilter ? 'No requests match your search' : 'No rows',
          }}
          rowSelectionModel={
            { type: 'include', ids: new Set(selectedId ? [selectedId] : []) } as GridRowSelectionModel
          }
          onRowClick={(params: GridRowParams) => setSelectedId(params.id as string)}
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          getRowId={row => row.id}
          sx={{ border: 0 }}
        />
      </Box>
    </Paper>
  );
}
