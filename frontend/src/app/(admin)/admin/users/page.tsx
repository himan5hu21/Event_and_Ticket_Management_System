"use client";

// External
import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Loader2,
  SlidersHorizontal,
  AlertCircle,
  RotateCw,
  MoreHorizontal,
  Building2,
  Trash2,
  Pencil,
  Eye,
  Check,
  X,
} from "lucide-react";
import { VerificationDialog } from "@/components/verification-dialog";

// Internal Hooks
import {
  useUsers as useBaseUsers,
  useUser,
  useUpdateUser,
  useDeleteUser,
  useVerifyUser,
  useUnverifyUser,
  useChangeUserRole,
} from "@/hooks/api";
import { User } from "@/lib/schemas";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { useSearchParams } from "next/navigation";

// Types
type UserDialogMode = "view" | "edit" | null;

// User form type
type UserFormData = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  role: "event-manager" | "customer";
  verified: boolean;
};

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  // State for filters and pagination
  const [search, setSearch] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<
    "name" | "email" | "createdAt" | "updatedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentView, setCurrentView] = useState<"all" | "event-managers">(
    "all"
  );

  // State for dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<UserDialogMode>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [verificationDialog, setVerificationDialog] = useState({
    open: false,
    userId: "",
    isVerified: false,
    userName: "",
  });
  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<UserFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      organization: "",
      role: "customer",
      verified: false,
    },
    mode: "onChange",
  });

  const watchRole = watch("role");

  // Create query params
  const queryParams = {
    search,
    organization: organizationFilter || undefined,
    role:
      roleFilter.length > 0 && roleFilter.length < 2
        ? roleFilter.join(",")
        : undefined,
    verified: verifiedFilter === null ? undefined : verifiedFilter,
    sortBy,
    order: sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  };

  // Memoize the query params to prevent unnecessary refetches
  const memoizedQueryParams = useMemo(
    () => ({
      search: queryParams.search,
      organization: queryParams.organization,
      role: queryParams.role,
      verified: queryParams.verified,
      sortBy: queryParams.sortBy,
      order: queryParams.order,
      page: queryParams.page,
      limit: queryParams.limit,
    }),
    [
      queryParams.search,
      queryParams.organization,
      queryParams.role,
      queryParams.verified,
      queryParams.sortBy,
      queryParams.order,
      queryParams.page,
      queryParams.limit,
    ]
  );

  // API hooks
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useBaseUsers(memoizedQueryParams);
  const {
    data: userData,
    isLoading: isUserLoading, // ✅ track loading state
    error: userError,
    refetch: refetchUser,
  } = useUser(selectedUserId || "");
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const verifyUserMutation = useVerifyUser();
  const unverifyUserMutation = useUnverifyUser();
  const changeRoleMutation = useChangeUserRole();

  // Update filters when URL changes
  useEffect(() => {
    if (roleParam === "event-manager") {
      setRoleFilter(["event-manager"]);
      setCurrentView("event-managers");
    } else {
      setRoleFilter(["event-manager", "customer"]);
      setCurrentView("all");
    }
  }, [roleParam]);

  // Memoize the refetch function to prevent unnecessary re-renders
  const refetchUsers = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refetching users:", error);
    }
  }, [refetch]);

  const pagination = usersResponse?.data;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;

  const handleRoleFilterChange = (role: string) => {
    setCurrentPage(1);
    setRoleFilter((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev;
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  // Handle user actions
  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditUser = (userId: string, user: User) => {
    setSelectedUserId(userId);
    setDialogMode("edit");
    // Populate the form using React Hook Form's reset
    reset({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      organization: user.organization || "",
      role: user.role || "customer",
      verified: user.verified || false,
    });
    setDialogOpen(true);
  };

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const deletedUser = await deleteUserMutation.mutateAsync(userToDelete);
      console.log("Deleted user:", deletedUser);
      await refetchUsers();
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      if (verified) {
        await verifyUserMutation.mutateAsync(userId);
      } else {
        await unverifyUserMutation.mutateAsync(userId);
      }
      await refetchUsers();
      return true;
    } catch (error) {
      console.error(
        `Error ${verified ? "verifying" : "unverifying"} user:`,
        error
      );
      throw error; // Re-throw to be handled by the caller
    }
  };

  const handleVerificationClick = (userId: string, isVerified: boolean, userName: string) => {
    setVerificationDialog({
      open: true,
      userId,
      isVerified,
      userName,
    });
  };

  const handleVerificationConfirm = async () => {
    if (!verificationDialog.userId) return;

    try {
      await handleVerifyUser(verificationDialog.userId, !verificationDialog.isVerified);
      toast.success(
        `User ${!verificationDialog.isVerified ? 'verified' : 'unverified'} successfully`
      );
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error(
        `Failed to ${!verificationDialog.isVerified ? 'verify' : 'unverify'} user`
      );
    } finally {
      setVerificationDialog(prev => ({ ...prev, open: false }));
    }
  };

  const getStatusBadge = (user: User) => {
    // For event managers, show verification status
    if (user.role === 'event-manager') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleVerificationClick(user._id, user.verified, user.name);
          }}
          className="focus:outline-none"
          aria-label={user.verified ? 'Verified' : 'Pending verification'}
        >
          <Badge
            variant={user.verified ? 'verified' : 'pending'}
            className="cursor-pointer transition-all hover:opacity-80 flex items-center gap-1.5"
          >
            {user.verified ? (
              <>
                <Check className="h-3 w-3" />
                Verified
              </>
            ) : (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Pending
              </>
            )}
          </Badge>
        </button>
      );
    }

    // For customers, show active status with appropriate styling
    return (
      <Badge
        variant="secondary"
        className="text-muted-foreground flex items-center gap-1.5"
      >
        <Check className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData?.data && dialogMode === "view") {
      const user = userData.data;
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        organization: user.organization || "",
        role: user.role || "customer",
        verified: user.verified || false,
      });
    }
  }, [userData, dialogMode, reset]);

  // Handle form submission
  const onSubmit = async (data: UserFormData) => {
    if (!selectedUserId) return;

    try {
      // Prepare update data
      const updateData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        verified: data.verified,
        organization: data.role === "event-manager" ? data.organization : "",
      };

      // Update user data
      await updateUserMutation.mutateAsync({
        id: selectedUserId,
        data: updateData,
      });

      // Close the dialog and refresh the user list
      setDialogOpen(false);
      await refetchUsers();

      // Show success message
      toast.success("User updated successfully");
    } catch (error: any) {
      console.error("Error updating user:", error);

      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update user. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Handle role change in form
  const handleFormRoleChange = (role: string) => {
    setValue("role", role as "event-manager" | "customer");
    if (role !== "event-manager") {
      setValue("organization", "");
      clearErrors("organization");
    }
  };
  const resetRoleFilter = () => {
    setCurrentPage(1);
    setRoleFilter(["event-manager", "customer"]);
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
      case "event-manager":
        return "info";       // Blue for event managers (informational)
      case "customer":
        return "success";    // Green for customers (positive/standard)
      default:
        return "outline";    // Default outlined style for any other roles
    }
  };

  // Update page title and description based on current view
  const pageTitle =
    currentView === "event-managers" ? "Event Managers" : "User Management";
  const pageDescription =
    currentView === "event-managers"
      ? "Manage event organizers and their verification status"
      : "Manage all user accounts and permissions in one place";

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {pageTitle}
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {pageDescription}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-muted/50 px-3 py-1.5 rounded-md text-sm">
            <span className="font-medium text-foreground">{totalItems}</span>
            <span className="text-muted-foreground">
              {" "}
              {totalItems === 1 ? "user" : "users"} total
            </span>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 flex items-center gap-2"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[100px] sm:max-w-none">
                        {organizationFilter || "Organization"}
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
                          onChange={(e) =>
                            setOrganizationFilter(e.target.value)
                          }
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
                          <span
                            className={
                              !organizationFilter
                                ? "font-medium text-primary"
                                : ""
                            }
                          >
                            All Organizations
                          </span>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Role Filter - Only show if in All Users view */}
                {currentView === "all" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>
                          {roleFilter.length === 2
                            ? `All roles`
                            : roleFilter[0]
                              ? roleFilter[0].charAt(0).toUpperCase() + roleFilter[0].slice(0).replace("-", " ")
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
                      {["event-manager", "customer"].map((role) => (
                        <DropdownMenuCheckboxItem
                          key={role}
                          checked={roleFilter.includes(role)}
                          onCheckedChange={() => handleRoleFilterChange(role)}
                          disabled={
                            roleFilter.length === 1 && roleFilter.includes(role)
                          }
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
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {currentView === "event-managers"
                        ? "Verification"
                        : "Status"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuLabel>
                      {currentView === "event-managers"
                        ? "Verification Status"
                        : "Filter by Status"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={verifiedFilter === null}
                      onCheckedChange={() => handleVerifiedFilterChange(null)}
                    >
                      All{" "}
                      {currentView === "event-managers" ? "Managers" : "Users"}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={verifiedFilter === true}
                      onCheckedChange={() => handleVerifiedFilterChange(true)}
                    >
                      {currentView === "event-managers"
                        ? "Verified"
                        : "Verified"}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={verifiedFilter === false}
                      onCheckedChange={() => handleVerifiedFilterChange(false)}
                    >
                      {currentView === "event-managers"
                        ? "Needs Verification"
                        : "Not Verified"}
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Items Per Page */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 flex items-center gap-2"
                    >
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
                        className={`text-sm cursor-pointer ${itemsPerPage === count ? "bg-accent" : ""
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
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Sort</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {["name", "email", "createdAt", "updatedAt"].map(
                      (field) => (
                        <DropdownMenuItem
                          key={field}
                          onClick={() => handleSort(field as any)}
                        >
                          <span className="flex-1 capitalize">
                            {field === "createdAt" ? "Date Joined" : field}
                          </span>
                          {sortBy === field && (
                            <span className="ml-2">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </DropdownMenuItem>
                      )
                    )}
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
                  <th className="h-12 px-4 text-left font-medium">
                    Organization
                  </th>
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
                        <p className="text-muted-foreground">
                          Loading users...
                        </p>
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
                          <h4 className="font-medium text-destructive">
                            Failed to load users
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            We couldn't load the user data. Please try again.
                          </p>
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
                            {search ||
                              organizationFilter ||
                              roleFilter.length < 3 ||
                              verifiedFilter !== null
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
                      <td className="p-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="capitalize"
                        >
                          {user.role.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {user.organization || "-"}
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
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleViewUser(user._id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleEditUser(user._id, user)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(user._id);
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

      {/* Verification Dialog */}
      <VerificationDialog
        open={verificationDialog.open}
        onOpenChange={(open) => setVerificationDialog(prev => ({ ...prev, open }))}
        isVerified={verificationDialog.isVerified}
        onConfirm={handleVerificationConfirm}
        userName={verificationDialog.userName}
      />

      {/* User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);

        if (!open) {
          // Dialog is being closed, reset form and clear selected user
          reset({
            name: '',
            email: '',
            phone: '',
            organization: '',
            role: 'customer',
            verified: false,
          });
          setSelectedUserId(null);
          setDialogMode(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {dialogMode === "view" ? "User Details" : "Edit User"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {dialogMode === "view"
                    ? "View and manage user information"
                    : "Update user details and permissions"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isUserLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <Users className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-medium text-foreground">
                  Loading User Data
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we fetch the details
                </p>
              </div>
            </div>
          ) : userError ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive">
                Failed to load user data
              </p>
              <Button onClick={() => refetchUser()}>Retry</Button>
            </div>
          ) : dialogMode === "view" ? (
            // View Mode (read-only)
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      {userData?.data?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {userData?.data?.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={getRoleBadgeVariant(userData?.data?.role || "")}
                      className="capitalize"
                    >
                      {userData?.data?.role?.replace("-", " ")}
                    </Badge>
                    <Badge
                      variant={userData?.data?.verified ? "default" : "outline"}
                      className="capitalize"
                    >
                      {userData?.data?.verified ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Contact Information
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span>{" "}
                        {userData?.data?.phone || "Not provided"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Organization:</span>{" "}
                        {userData?.data?.organization || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Account Details
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Member Since:</span>{" "}
                        {format(
                          new Date(userData?.data?.createdAt || new Date()),
                          "MMM d, yyyy"
                        )}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Last Updated:</span>{" "}
                        {format(
                          new Date(userData?.data?.updatedAt || new Date()),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    if (userData?.data) {
                      reset({
                        name: userData.data.name || "",
                        email: userData.data.email || "",
                        phone: userData.data.phone || "",
                        organization: userData.data.organization || "",
                        role: userData.data.role || "customer",
                        verified: userData.data.verified || false,
                      });
                    }
                  }}
                  className="mr-2"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    handleEditUser(selectedUserId || "", userData?.data as User)
                  }
                  variant="default"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit User
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Edit Mode (form)
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: "Name is required" }}
                      render={({ field }) => (
                        <div className="space-y-1">
                          <Input
                            id="name"
                            placeholder="Enter full name"
                            {...field}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      }}
                      render={({ field }) => (
                        <div className="space-y-1">
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Controller
                      name="phone"
                      control={control}
                      rules={{
                        pattern: {
                          value: /^\d{8,15}$/,
                          message: "Please enter a valid phone number",
                        },
                      }}
                      render={({ field }) => (
                        <div className="space-y-1">
                          <Input
                            id="phone"
                            placeholder="Enter phone number (e.g., +1234567890)"
                            {...field}
                            onKeyDown={(e) => {
                              if (e.key === ".") {
                                e.preventDefault(); // prevent typing a dot
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Format: +[country code][number]
                          </p>
                          {errors.phone && (
                            <p className="text-sm text-destructive">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">User Role</Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field: { value, onChange, ...field } }) => (
                        <Select
                          value={value}
                          onValueChange={(val) => {
                            onChange(val);
                            handleFormRoleChange(val);
                          }}
                          {...field}
                        >
                          <SelectTrigger id="role" className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="event-manager">
                              Event Manager
                            </SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Controller
                    name="organization"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (watchRole === "event-manager" && !value?.trim()) {
                          return "Organization is required for event managers";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Input
                          id="organization"
                          placeholder={
                            watchRole === "event-manager"
                              ? "Enter organization name"
                              : "Available for event managers only"
                          }
                          disabled={watchRole !== "event-manager"}
                          {...field}
                        />
                        {watchRole === "event-manager" && (
                          <p className="text-xs text-muted-foreground">
                            Required for event managers
                          </p>
                        )}
                        {errors.organization && (
                          <p className="text-sm text-destructive">
                            {errors.organization.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="verified" className="text-base">
                      Account Verification
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {watch("verified")
                        ? "This user has been verified and has full access."
                        : "This user requires verification to access certain features."}
                    </p>
                  </div>
                  <Controller
                    name="verified"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <Switch
                        id="verified"
                        checked={value}
                        onCheckedChange={onChange}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    if (userData?.data) {
                      reset({
                        name: userData.data.name || "",
                        email: userData.data.email || "",
                        phone: userData.data.phone || "",
                        organization: userData.data.organization || "",
                        role: userData.data.role || "customer",
                        verified: userData.data.verified || false,
                      });
                    }
                  }}
                  disabled={updateUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="min-w-[120px]"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Delete User</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-sm text-foreground">
              Are you sure you want to delete this user? All associated data will be permanently removed.
            </p>
            <div className="bg-destructive/5 p-3 rounded-md border border-destructive/20">
              <p className="text-sm font-medium">This action is irreversible</p>
              <p className="text-xs text-muted-foreground mt-1">
                The user and all their data will be permanently deleted from our servers.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="relative"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
