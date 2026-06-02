import { useState, type ComponentProps } from 'react';
import { DataGrid, type GridColDef, type GridRowParams, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Paper, Typography, Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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

function SearchEmptyOverlay({ searchTerm }: { searchTerm?: string }) {
  if (!searchTerm) return null;
  return (
    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        No requests match your search
      </Typography>
    </Box>
  );
}

export function RequestListWidget() {
  const { data = [], isLoading, isError } = useServiceRequests();
  const { selectedId, setSelectedId } = useSelection();
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const filteredData = searchTerm
    ? data.filter(row =>
        [row.title, row.requesterName, row.requesteeName].some(field =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>All Requests</Typography>
      {isError && <Typography color="error">Failed to load requests.</Typography>}
      <TextField
        size="small"
        placeholder="Search by title, requester, or requestee…"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          setPaginationModel(prev => ({ ...prev, page: 0 }));
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 1 }}
        fullWidth
      />
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={isLoading}
          rowSelectionModel={
            { type: 'include', ids: new Set(selectedId ? [selectedId] : []) } as GridRowSelectionModel
          }
          onRowClick={(params: GridRowParams) => setSelectedId(params.id as string)}
          pageSizeOptions={[10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{ noRowsOverlay: SearchEmptyOverlay }}
          slotProps={{
            noRowsOverlay: { searchTerm } as ComponentProps<typeof SearchEmptyOverlay>,
          }}
          getRowId={row => row.id}
          sx={{ border: 0 }}
        />
      </Box>
    </Paper>
  );
}
