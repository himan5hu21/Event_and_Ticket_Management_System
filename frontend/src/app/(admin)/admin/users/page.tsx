"use client";

// External
import { useState, useCallback } from "react";
import { format } from "date-fns";
import { UseQueryResult } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Search,
  Shield,
  RefreshCw,
  Loader2,
  SlidersHorizontal,
  AlertCircle,
  RotateCw,
  MoreHorizontal,
  X,
  Building2,
  Trash2,
  Pencil,
  Eye
} from "lucide-react";

// Internal Hooks
import { useUsers as useBaseUsers } from "@/hooks/api";
import { User, PaginatedResponse } from "@/lib/schemas";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Types
type UseUsersReturn = Omit<UseQueryResult<PaginatedResponse<User>, Error>, 'refetch'> & {
  refetch: () => Promise<void>;
};

// Custom hook with proper typing
function useUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  verified?: boolean;
  search?: string;
  sortBy?: string;
  organization?: string;
  order?: 'asc' | 'desc';
}): UseUsersReturn {
  const result = useBaseUsers(params);

  const refetch = useCallback(async () => {
    try {
      await result.refetch();
    } catch (error) {
      console.error('Error in refetch:', error);
      throw error;
    }
  }, [result]);

  return {
    ...result,
    refetch,
  };
}

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get('role');
  
  const [search, setSearch] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentView, setCurrentView] = useState<'all' | 'event-managers'>('all');

  // Update filters when URL changes
  useEffect(() => {
    if (roleParam === 'event-manager') {
      setRoleFilter(['event-manager']);
      setCurrentView('event-managers');
    } else {
      setRoleFilter(['admin', 'event-manager', 'customer']);
      setCurrentView('all');
    }
  }, [roleParam]);

  const {
    data: usersResponse,
    isLoading,
    error,
    refetch: refetchUsers
  } = useUsers({
    search,
    organization: organizationFilter,
    role: roleFilter.length > 0 && roleFilter.length < 3 ? roleFilter.join(",") : undefined,
    verified: verifiedFilter === null ? undefined : verifiedFilter,
    sortBy,
    order: sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const users = usersResponse?.data?.items || [];
  const pagination = usersResponse?.data;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;

  const handleRoleFilterChange = (role: string) => {
    setCurrentPage(1);
    setRoleFilter(prev => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev;
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        // await deleteUser(userId);
        refetchUsers();
        // Show success message
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const resetRoleFilter = () => {
    setCurrentPage(1);
    setRoleFilter(["admin", "event-manager", "customer"]);
  };

  const handleVerifiedFilterChange = (value: boolean | null) => {
    setCurrentPage(1);
    setVerifiedFilter(value);
  };

  const handleSort = (field: typeof sortBy) => {
    setCurrentPage(1);
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "event-manager":
        return "secondary";
      case "customer":
        return "default";
      default:
        return "default";
    }
  };

  // Update page title and description based on current view
  const pageTitle = currentView === 'event-managers' ? 'Event Managers' : 'User Management';
  const pageDescription = currentView === 'event-managers' 
    ? 'Manage event organizers and their verification status' 
    : 'Manage all user accounts and permissions in one place';

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {pageDescription}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-muted/50 px-3 py-1.5 rounded-md text-sm">
            <span className="font-medium text-foreground">{totalItems}</span>
            <span className="text-muted-foreground"> {totalItems === 1 ? 'user' : 'users'} total</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchUsers()}
            disabled={isLoading}
            className="h-9"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
        </Button>
      </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {/* Search Input */}
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email..."
                  className="pl-10 w-full"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Organization Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[100px] sm:max-w-none">
                        {organizationFilter || 'Organization'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search organizations..."
                          className="pl-8 h-8 text-sm"
                          value={organizationFilter}
                          onChange={(e) => setOrganizationFilter(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <div className="py-1">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => {
                            setOrganizationFilter("");
                            setCurrentPage(1);
                          }}
                        >
                          <span className={!organizationFilter ? 'font-medium text-primary' : ''}>
                            All Organizations
                          </span>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Role Filter - Only show if in All Users view */}
                {currentView === 'all' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>
                          {roleFilter.length === 3
                            ? "All Roles"
                            : roleFilter.length === 2
                            ? `${roleFilter.length} roles`
                            : roleFilter[0]
                            ? roleFilter[0]
                                .charAt(0)
                                .toUpperCase() +
                              roleFilter[0].slice(1).replace("-", " ")
                            : "Roles"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetRoleFilter();
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                      <DropdownMenuSeparator />
                      {["admin", "event-manager", "customer"].map((role) => (
                        <DropdownMenuCheckboxItem
                          key={role}
                          checked={roleFilter.includes(role)}
                          onCheckedChange={() => handleRoleFilterChange(role)}
                          disabled={roleFilter.length === 1 && roleFilter.includes(role)}
                        >
                          {role.charAt(0).toUpperCase() +
                            role.slice(1).replace("-", " ")}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

              {/* Status Filter - Show different labels for Event Managers view */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {currentView === 'event-managers' ? 'Verification' : 'Status'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>
                    {currentView === 'event-managers' ? 'Verification Status' : 'Filter by Status'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={verifiedFilter === null}
                    onCheckedChange={() => handleVerifiedFilterChange(null)}
                  >
                    All {currentView === 'event-managers' ? 'Managers' : 'Users'}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={verifiedFilter === true}
                    onCheckedChange={() => handleVerifiedFilterChange(true)}
                  >
                    {currentView === 'event-managers' ? 'Verified' : 'Verified'}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={verifiedFilter === false}
                    onCheckedChange={() => handleVerifiedFilterChange(false)}
                  >
                    {currentView === 'event-managers' ? 'Needs Verification' : 'Not Verified'}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Items Per Page */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 flex items-center gap-2">
                    <span className="text-sm">{itemsPerPage} per page</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Rows per page
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[5, 10, 20, 50].map((count) => (
                    <DropdownMenuItem 
                      key={count}
                      className={`text-sm cursor-pointer ${
                        itemsPerPage === count ? 'bg-accent' : ''
                      }`}
                      onClick={() => {
                        setItemsPerPage(count);
                        setCurrentPage(1);
                      }}
                    >
                      <div className="flex items-center w-full justify-between">
                        <span>{count} rows</span>
                        {itemsPerPage === count && (
                          <svg
                            className="h-4 w-4 text-primary"
                            fill="none"
                            height="24"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Sort</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["name", "email", "createdAt", "updatedAt"].map((field) => (
                    <DropdownMenuItem key={field} onClick={() => handleSort(field as any)}>
                      <span className="flex-1 capitalize">
                        {field === "createdAt" ? "Date Joined" : field}
                      </span>
                      {sortBy === field && (
                        <span className="ml-2">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent>
          <div className="rounded-md border relative overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors">
                  <th className="h-12 px-4 text-left font-medium w-16">#</th>
                  <th className="h-12 px-4 text-left font-medium">Name</th>
                  <th className="h-12 px-4 text-left font-medium">Email</th>
                  <th className="h-12 px-4 text-left font-medium">Role</th>
                  <th className="h-12 px-4 text-left font-medium">Status</th>
                  <th className="h-12 px-4 text-left font-medium">Organization</th>
                  <th className="h-12 px-4 text-left font-medium">Joined</th>
                  <th className="h-12 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <Users className="h-16 w-16 text-muted-foreground/30 animate-pulse" />
                          <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 animate-spin text-primary" />
                        </div>
                        <p className="text-muted-foreground">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="h-64">
                      <div className="flex flex-col items-center justify-center space-y-4 p-6 rounded-lg bg-destructive/5 border border-destructive/20">
                        <div className="bg-destructive/10 p-3 rounded-full">
                          <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <div className="text-center space-y-1">
                          <h4 className="font-medium text-destructive">Failed to load users</h4>
                          <p className="text-sm text-muted-foreground">We couldn't load the user data. Please try again.</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => refetchUsers()}
                        >
                          <RotateCw className="mr-2 h-4 w-4" /> Try again
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : !usersResponse?.data?.items?.length ? (
                  <tr>
                    <td colSpan={8} className="h-64">
                      <div className="flex flex-col items-center justify-center space-y-4 p-6 rounded-lg bg-muted/20">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center space-y-1">
                          <h4 className="font-medium">No users found</h4>
                          <p className="text-sm text-muted-foreground">
                            {search || organizationFilter || roleFilter.length < 3 || verifiedFilter !== null 
                              ? "Try adjusting your search or filter criteria"
                              : "There are no users in the system yet"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usersResponse.data.items.map((user, index) => (
                    <tr key={user._id} className="border-b hover:bg-muted/50">
                      <td className="p-4 text-muted-foreground">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="capitalize"
                        >
                          {user.role.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.role === 'event-manager' || user.role === 'admin' ? (
                          <Badge variant={user.verified ? "default" : "outline"}>
                            {user.verified ? "Verified" : "Pending"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {user.organization || '-'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {format(new Date(user.createdAt), "PPP")}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user._id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
