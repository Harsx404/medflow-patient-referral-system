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
  Upload,
  Users,
  Filter,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Activity
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
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5" />
          <div className="relative p-8 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Patient Records
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium text-blue-600 dark:text-blue-400">{filteredPatients.length}</span> total referrals
                    </p>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Live Updates</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  disabled={isLoadingPatients}
                  variant="ghost"
                  size="sm"
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all duration-200 rounded-xl px-4 py-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingPatients ? 'animate-spin' : ''}`} />
                  {isLoadingPatients ? 'Syncing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50" />
          <div className="relative p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Enhanced Search */}
              <div className="flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />
                    <Input
                      placeholder="Search patients, doctors, or referral ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Enhanced Status Filter */}
              <div className="w-full lg:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-500" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl">
                    <SelectItem value="all" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full" />
                        All Statuses
                      </div>
                    </SelectItem>
                    <SelectItem value="Pending" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-yellow-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="Accepted" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Accepted
                      </div>
                    </SelectItem>
                    <SelectItem value="Rejected" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Rejected
                      </div>
                    </SelectItem>
                    <SelectItem value="Transferred" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3 text-blue-500" />
                        Transferred
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                <TableHead 
                  className="cursor-pointer select-none text-slate-700 dark:text-slate-300 font-semibold py-4 px-6 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    <span>Patient</span>
                    <ArrowUpDown className="h-4 w-4 opacity-60" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none text-slate-700 dark:text-slate-300 font-semibold py-4 px-6 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center gap-2">
                    <span>Age</span>
                    <ArrowUpDown className="h-4 w-4 opacity-60" />
                  </div>
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4 px-6">Medical Team</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4 px-6">Status</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4 px-6">Priority</TableHead>
                <TableHead 
                  className="cursor-pointer select-none text-slate-700 dark:text-slate-300 font-semibold py-4 px-6 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    <span>Created</span>
                    <ArrowUpDown className="h-4 w-4 opacity-60" />
                  </div>
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id} className="group hover:bg-white/50 dark:hover:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 transition-all duration-200">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                        {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{patient.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{patient.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{patient.age}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">years</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <div className="text-sm">
                          <span className="text-slate-500 dark:text-slate-400">From:</span>
                          <span className="ml-1 font-medium text-slate-700 dark:text-slate-300">Dr. {patient.referringDoctor}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div className="text-sm">
                          <span className="text-slate-500 dark:text-slate-400">To:</span>
                          <span className="ml-1 font-medium text-slate-700 dark:text-slate-300">Dr. {patient.assignedDoctor}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        {patient.status === 'Accepted' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {patient.status === 'Rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                        {patient.status === 'Pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                        {patient.status === 'Transferred' && <ArrowRight className="h-4 w-4 text-blue-500" />}
                        <Badge 
                          className={
                            patient.status === 'Accepted' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' :
                            patient.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700' :
                            patient.status === 'Transferred' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
                          }
                        >
                          {patient.status}
                        </Badge>
                      </div>
                      
                      {/* Enhanced status dropdown for admin or doctor */}
                      {(localStorage.getItem('userRole') === 'admin' || localStorage.getItem('userRole') === 'doctor') && (
                        <Select
                          value={patient.status}
                          onValueChange={async (newStatus) => {
                            const currentUser = localStorage.getItem('currentUser') || 'Admin';
                            await updatePatientStatus(patient.id, newStatus as 'Pending' | 'Accepted' | 'Rejected' | 'Transferred', currentUser);
                          }}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl">
                            <SelectItem value="Pending" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-yellow-500" />
                                Pending
                              </div>
                            </SelectItem>
                            <SelectItem value="Accepted" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-3 h-3 text-green-600" />
                                Accept
                              </div>
                            </SelectItem>
                            <SelectItem value="Rejected" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <UserX className="w-3 h-3 text-red-600" />
                                Reject
                              </div>
                            </SelectItem>
                            <SelectItem value="Transferred" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-3 h-3 text-blue-500" />
                                Transfer
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {patient.urgencyLevel === 'Emergency' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {patient.urgencyLevel === 'High' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      <Badge 
                        className={
                          patient.urgencyLevel === 'Emergency' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700' :
                          patient.urgencyLevel === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700' :
                          patient.urgencyLevel === 'Medium' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700' : 
                          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'
                        }
                      >
                        {patient.urgencyLevel || 'Medium'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div className="text-sm">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient.id)
                          setShowPDFViewer(true)
                        }}
                        className="h-9 w-9 p-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 rounded-lg group"
                      >
                        <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="p-16 text-center">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200/50 to-slate-300/50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-3xl blur-xl" />
              <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
                <FileText className="h-16 w-16 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                No patients found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria to find the patients you\'re looking for.'
                  : 'Upload your first referral to get started with patient management.'
                }
              </p>
              {searchTerm || statusFilter !== 'all' ? (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                  className="mt-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all duration-200 rounded-xl"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50" />
            <div className="relative p-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>
                    Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{startIndex + 1}</span> to <span className="font-semibold text-blue-600 dark:text-blue-400">{Math.min(startIndex + itemsPerPage, filteredPatients.length)}</span> of <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredPatients.length}</span> results
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl px-4"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 p-0 rounded-xl transition-all duration-200 ${
                            currentPage === page 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl' 
                              : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl px-4"
                  >
                    Next
                  </Button>
                </div>
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