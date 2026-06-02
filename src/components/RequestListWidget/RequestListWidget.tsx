import { DataGrid, type GridColDef, type GridRenderCellParams, type GridRowParams, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Paper, Typography, Box } from '@mui/material';
import { useServiceRequests } from '../../hooks/useServiceRequests';
import { useSelection } from '../../context/SelectionContext';
import { StatusChip } from '../StatusChip/StatusChip';
import type { ServiceRequest } from '../../types';

const columns: GridColDef<ServiceRequest>[] = [
  { field: 'title', headerName: 'Title', flex: 2, minWidth: 200 },
  { field: 'requesterName', headerName: 'Requester', flex: 1, minWidth: 130 },
  { field: 'requesteeName', headerName: 'Requestee', flex: 1, minWidth: 130 },
  {
    field: 'createdAt',
    headerName: 'Created',
    width: 120,
    valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params: GridRenderCellParams<ServiceRequest>) => (
      <StatusChip status={params.row.status} />
    ),
  },
];

export function RequestListWidget() {
  const { data = [], isLoading, isError } = useServiceRequests();
  const { selectedId, setSelectedId } = useSelection();

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>All Requests</Typography>
      {isError && <Typography color="error">Failed to load requests.</Typography>}
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={isLoading}
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
