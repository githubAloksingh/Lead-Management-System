import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { Lead, LeadFilters } from '../types';
import { leadsApi } from '../utils/api';
import toast from 'react-hot-toast';
import LeadModal from '../components/LeadModal';
import FilterModal from '../components/FilterModal';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const LeadsList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});

  const totalPages = Math.ceil(totalLeads / pageSize);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leadsApi.getLeads({
        page: currentPage,
        limit: pageSize,
        ...filters,
      });
      setLeads(response.data);
      setTotalLeads(response.total);
    } catch (error) {
      toast.error('Failed to load leads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleDelete = async (lead: Lead) => {
    if (!confirm(`Are you sure you want to delete ${lead.first_name} ${lead.last_name}?`)) {
      return;
    }
    try {
      await leadsApi.deleteLead(lead.id);
      toast.success('Lead deleted successfully');
      loadLeads();
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const handleLeadSaved = () => {
    loadLeads();
    handleModalClose();
  };

  const handleFilterChange = (newFilters: LeadFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // --- Cell Renderers ---
  const ActionsCellRenderer = ({ data }: { data: Lead }) => (
    <div className="flex space-x-2">
      <button onClick={() => handleEdit(data)} className="p-1 text-blue-600 hover:text-blue-800">
        <Edit className="h-4 w-4" />
      </button>
      <button onClick={() => handleDelete(data)} className="p-1 text-red-600 hover:text-red-800">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const BadgeCellRenderer = ({ value, type }: { value: string; type: 'source' | 'status' }) => {
    const colors: Record<string, string> = {
      website: 'bg-blue-100 text-blue-800',
      facebook_ads: 'bg-purple-100 text-purple-800',
      google_ads: 'bg-green-100 text-green-800',
      referral: 'bg-orange-100 text-orange-800',
      events: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      won: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
        {value?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const ScoreCellRenderer = ({ value }: { value: number }) => (
    <div className="flex items-center space-x-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${value}%` }}></div>
      </div>
      <span className="text-sm text-gray-600">{value}</span>
    </div>
  );

  const columnDefs: ColDef[] = [
    { headerName: 'Name', valueGetter: (p) => `${p.data.first_name} ${p.data.last_name}`, minWidth: 150 },
    { headerName: 'Email', field: 'email', minWidth: 200 },
    { headerName: 'Company', field: 'company', minWidth: 150 },
    { headerName: 'Phone', field: 'phone', minWidth: 130 },
    {
      headerName: 'Location',
      valueGetter: (p) => p.data.city && p.data.state ? `${p.data.city}, ${p.data.state}` : p.data.city || p.data.state || '',
      minWidth: 120,
    },
    { headerName: 'Source', field: 'source', cellRenderer: (p: any) => <BadgeCellRenderer value={p.value} type="source" />, minWidth: 120 },
    { headerName: 'Status', field: 'status', cellRenderer: (p: any) => <BadgeCellRenderer value={p.value} type="status" />, minWidth: 120 },
    { headerName: 'Score', field: 'score', cellRenderer: ScoreCellRenderer, minWidth: 120 },
    { headerName: 'Value', field: 'lead_value', valueFormatter: (p) => `$${parseFloat(p.value).toLocaleString()}`, minWidth: 100 },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      cellRenderer: (p: any) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${p.value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {p.value ? 'YES' : 'NO'}
        </span>
      ),
      minWidth: 100,
    },
    { headerName: 'Actions', cellRenderer: ActionsCellRenderer, minWidth: 100 },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-700">Manage your leads and track their progress.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
  {/* Filter Button */}
  <button
    onClick={() => setIsFilterModalOpen(true)}
    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 
               bg-white border border-gray-300 rounded-xl shadow-sm 
               hover:bg-gray-50 hover:shadow-md transition duration-200 ease-in-out"
  >
    <Filter className="h-4 w-4 mr-2 text-gray-500" />
    Filters
  </button>

  {/* Add Lead Button */}
  <button
    onClick={() => setIsModalOpen(true)}
    className="inline-flex items-center px-5 py-2 text-sm font-medium text-white 
               rounded-xl shadow-md bg-gradient-to-r from-blue-600 to-blue-500 
               hover:from-blue-700 hover:to-blue-600 hover:shadow-lg 
               transition duration-200 ease-in-out"
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Lead
  </button>
</div>

      </div>

      {/* Grid */}
      <div className="mt-8">
        <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={leads}
            pagination={false} // disable AG Grid's built-in pagination
            animateRows={true}
            rowHeight={60}
            headerHeight={48}
            onGridReady={(params: GridReadyEvent) => params.api.sizeColumnsToFit()}
          />
        </div>
      </div>

      {/* Custom Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing page {currentPage} of {totalPages} ({totalLeads} leads)
        </div>
        <div className="space-x-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Modals */}
      <LeadModal isOpen={isModalOpen} onClose={handleModalClose} lead={editingLead} onSaved={handleLeadSaved} />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} filters={filters} onFiltersChange={handleFilterChange} />
    </div>
  );
};

export default LeadsList;
