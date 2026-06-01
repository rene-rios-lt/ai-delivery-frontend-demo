import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SelectionProvider } from './context/SelectionContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const theme = createTheme({
  palette: { mode: 'light' },
  shape: { borderRadius: 8 },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SelectionProvider>
          <DashboardLayout />
        </SelectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
