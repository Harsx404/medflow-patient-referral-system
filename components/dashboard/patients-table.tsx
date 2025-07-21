"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { PDFViewerModal } from './pdf-viewer-modal'
import { useAppStore } from '@/lib/store'
import { 
  Search, 
  Eye, 
  FileText, 
  Calendar,
  UserCheck,
  UserX,
  ArrowUpDown,
  RefreshCw,
  Globe,
  Database,
  Upload
} from 'lucide-react'

export function PatientsTable() {
  const { patients, updatePatientStatus, isLoadingPatients } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<'name' | 'age' | 'createdAt'>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const itemsPerPage = 10

  // Filtered and sorted patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.assignedDoctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (patient.referralId && patient.referralId.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
      
      return matchesSearch && matchesStatus
    }).sort((a, b) => {
      let aValue, bValue
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'age':
          aValue = a.age
          bValue = b.age
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [patients, searchTerm, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: 'name' | 'age' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleStatusUpdate = async (patientId: string, newStatus: any) => {
    await updatePatientStatus(patientId, newStatus, 'Admin')
  }

  const handleViewPDF = (patientId: string) => {
    setSelectedPatient(patientId)
    setShowPDFViewer(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'Transferred': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSourceBadge = (source: string | undefined) => {
    if (source === 'custom-form') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Globe className="h-3 w-3 mr-1" />
          Form
        </Badge>
      )
    }
    if (source === 'admin-upload') {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Upload className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Database className="h-3 w-3 mr-1" />
        Mock
      </Badge>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Patient Records</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {filteredPatients.length} total referrals
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                disabled={isLoadingPatients}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingPatients ? 'animate-spin' : ''}`} />
                {isLoadingPatients ? 'Loading...' : 'Refresh Data'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search patients, doctors, or referral ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white dark:bg-slate-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                <TableHead 
                  className="cursor-pointer select-none text-slate-600 dark:text-slate-300 font-medium"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Patient</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none text-slate-600 dark:text-slate-300 font-medium"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Age</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300 font-medium">Doctors</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300 font-medium">Urgency</TableHead>
                <TableHead 
                  className="cursor-pointer select-none text-slate-600 dark:text-slate-300 font-medium"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{patient.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{patient.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{patient.age}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-slate-500 dark:text-slate-400">From:</span> Dr. {patient.referringDoctor}
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500 dark:text-slate-400">To:</span> Dr. {patient.assignedDoctor}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-2">
                      <Badge 
                        variant={
                          patient.status === 'Accepted' ? 'default' :
                          patient.status === 'Rejected' ? 'destructive' :
                          patient.status === 'Transferred' ? 'secondary' :
                          'outline'
                        }
                        className="w-fit"
                      >
                        {patient.status}
                      </Badge>
                      
                      {/* Only show status dropdown for admin or doctor */}
                      {(localStorage.getItem('userRole') === 'admin' || localStorage.getItem('userRole') === 'doctor') && (
                        <Select
                          value={patient.status}
                          onValueChange={async (newStatus) => {
                            const currentUser = localStorage.getItem('currentUser') || 'Admin';
                            await updatePatientStatus(patient.id, newStatus as 'Pending' | 'Accepted' | 'Rejected' | 'Transferred', currentUser);
                          }}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Accepted">
                              <div className="flex items-center">
                                <UserCheck className="w-3 h-3 mr-1 text-green-600" />
                                Accept
                              </div>
                            </SelectItem>
                            <SelectItem value="Rejected">
                              <div className="flex items-center">
                                <UserX className="w-3 h-3 mr-1 text-red-600" />
                                Reject
                              </div>
                            </SelectItem>
                            <SelectItem value="Transferred">Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        patient.urgencyLevel === 'Emergency' ? 'destructive' :
                        patient.urgencyLevel === 'High' ? 'destructive' :
                        patient.urgencyLevel === 'Medium' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {patient.urgencyLevel || 'Medium'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient.id)
                          setShowPDFViewer(true)
                        }}
                        className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No patients found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload your first referral to get started.'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPatients.length)} of {filteredPatients.length} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-white dark:bg-slate-700"
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0 bg-white dark:bg-slate-700"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-white dark:bg-slate-700"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedPatient && showPDFViewer && (
        <PDFViewerModal
          patient={patients.find(p => p.id === selectedPatient) || null}
          isOpen={showPDFViewer}
          onClose={() => {
            setShowPDFViewer(false)
            setSelectedPatient(null)
          }}
        />
      )}
    </>
  )
}