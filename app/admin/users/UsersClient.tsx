"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminShell from "@/components/AdminShell";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface UserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: number;
  lastSignInAt: number | null;
  imageUrl: string;
  metadata: {
    paymentSessionId?: string;
    classification?: string;
    hasCompletedOnboarding?: boolean;
    qrCode?: string;
    paymentType?: "paid" | "exempt" | "unknown";
    paymentAmount?: number;
    title?: string;
    pronouns?: string;
    phoneNumber?: string;
    organization?: string;
    howDidYouHear?: string;
    additionalInfo?: string;
    isCheckedIn?: boolean;
  };
}

interface UsersResponse {
  users: UserData[];
  total: number;
}

interface EditHistoryEntry {
  id: string;
  user_id: string;
  edited_by: string;
  source: string;
  changes: {
    field: string;
    old_value: string | null;
    new_value: string | null;
  }[];
  created_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  pronouns: "Pronouns",
  classification: "Classification",
  title: "Title",
  organization: "Organization",
  phoneNumber: "Phone Number",
  howDidYouHear: "How Did You Hear",
  additionalInfo: "Additional Info",
  paymentType: "Payment Type",
  paymentAmount: "Payment Amount",
  paymentSessionId: "Payment Session",
  isCheckedIn: "Checked In",
};

const SOURCE_LABELS: Record<string, string> = {
  edit_information: "Edit Information",
  metadata_update: "Onboarding / Payment",
  admin_edit: "Admin Edit",
};

export default function UsersClient() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [nameSortOrder, setNameSortOrder] = useState<"asc" | "desc" | null>(
    null,
  );
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [checkInUpdating, setCheckInUpdating] = useState<
    Record<string, boolean>
  >({});

  // Edit history dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<UserData | null>(null);
  const [historyEntries, setHistoryEntries] = useState<EditHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Add user dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    classification: "",
    paymentType: "paid" as "paid" | "exempt" | "unknown",
    paymentAmount: 39,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    classification: "",
    paymentType: "unknown" as "paid" | "exempt" | "unknown",
    paymentAmount: 39,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const usersData = await response.json();
      console.log(usersData);
      setData(usersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      classification: user.metadata.classification || "",
      paymentType:
        user.metadata.paymentType === "paid" ||
        user.metadata.paymentType === "exempt"
          ? user.metadata.paymentType
          : "unknown",
      paymentAmount: user.metadata.paymentAmount || 39,
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setEditLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          metadata: {
            classification: editForm.classification,
            paymentType: editForm.paymentType,
            paymentAmount: editForm.paymentAmount,
            paymentSessionId:
              editForm.paymentType === "paid"
                ? "paid"
                : selectedUser.metadata.paymentSessionId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Refresh data
      await fetchUsers();
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const openHistoryDialog = async (user: UserData) => {
    setHistoryUser(user);
    setHistoryDialogOpen(true);
    setHistoryEntries([]);
    setHistoryError(null);

    try {
      setHistoryLoading(true);
      const response = await fetch(
        `/api/admin/users/edit-history?userId=${encodeURIComponent(user.id)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch edit history");
      }

      const historyData = await response.json();
      setHistoryEntries(historyData.history || []);
    } catch (err: any) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openDeleteDialog = (user: UserData) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(
        `/api/admin/users?userId=${userToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      // Refresh data
      await fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetAddForm = () => {
    setAddForm({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      classification: "",
      paymentType: "paid",
      paymentAmount: 39,
    });
  };

  const handleAddUser = async () => {
    try {
      setAddLoading(true);
      const payload = {
        ...addForm,
        email: addForm.email.trim() || undefined,
        password: addForm.password || undefined,
      };

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      // Refresh data
      await fetchUsers();
      setAddDialogOpen(false);
      resetAddForm();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      alert("No users to export");
      return;
    }

    // Prepare data for Excel
    const excelData = filteredUsers.map((user) => ({
      "First Name": user.firstName || "",
      "Last Name": user.lastName || "",
      Email: user.email,
      Classification: user.metadata.classification || "Not set",
      "Payment Type":
        user.metadata.paymentType === "exempt"
          ? "Exempt"
          : user.metadata.paymentType === "paid"
            ? "Paid"
            : "Unknown",
      "Payment Amount":
        user.metadata.paymentType === "paid"
          ? `$${user.metadata.paymentAmount || 39}`
          : "",
      Title: user.metadata.title || "",
      Pronouns: user.metadata.pronouns || "",
      Organization: user.metadata.organization || "",
      "Phone Number": user.metadata.phoneNumber || "",
      "How Did You Hear": user.metadata.howDidYouHear || "",
      "Additional Info": user.metadata.additionalInfo || "",
      "Joined Date": new Date(user.createdAt).toLocaleDateString(),
      "Last Sign In": user.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleDateString()
        : "Never",
      "User ID": user.id,
      "Is Checked In": user.metadata.isCheckedIn ? "Yes" : "No",
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(excelData[0]).map((key) => ({
      wch: Math.min(
        maxWidth,
        Math.max(
          key.length,
          ...excelData.map(
            (row) => String(row[key as keyof typeof row]).length,
          ),
        ),
      ),
    }));
    worksheet["!cols"] = colWidths;

    // Generate filename with date
    const date = new Date().toISOString().split("T")[0];
    const filename = `users_export_${date}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  };

  const filteredUsers = data?.users
    .filter((user) => {
      // Search filter
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName || ""} ${user.lastName || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Payment filter
      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" &&
          (user.metadata.paymentType === "paid" ||
            user.metadata.paymentType === "exempt")) ||
        (paymentFilter === "unpaid" &&
          user.metadata.paymentType !== "paid" &&
          user.metadata.paymentType !== "exempt");

      return matchesSearch && matchesPayment;
    })
    .sort((a, b) => {
      if (!nameSortOrder) return 0;
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`
        .trim()
        .toLowerCase();
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`
        .trim()
        .toLowerCase();
      const comparison = nameA.localeCompare(nameB);
      return nameSortOrder === "asc" ? comparison : -comparison;
    });

  const handleCheckInToggle = async (user: UserData, isCheckedIn: boolean) => {
    try {
      setCheckInUpdating((prev) => ({ ...prev, [user.id]: true }));
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          metadata: {
            isCheckedIn,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update check-in status");
      }

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  metadata: {
                    ...u.metadata,
                    isCheckedIn,
                  },
                }
              : u,
          ),
        };
      });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setCheckInUpdating((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  if (loading) {
    return (
      <AdminShell title="Users" description="Loading users...">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          <p className="mt-4 text-sm text-gray-600">Loading users...</p>
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell title="Users" description="Unable to load users.">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </AdminShell>
    );
  }

  const paidCount =
    data?.users.filter((u) => u.metadata.paymentType === "paid").length || 0;
  const exemptCount =
    data?.users.filter((u) => u.metadata.paymentType === "exempt").length || 0;
  const unknownCount =
    data?.users.filter(
      (u) =>
        u.metadata.paymentType !== "paid" &&
        u.metadata.paymentType !== "exempt",
    ).length || 0;
  const totalPaidAmount =
    data?.users
      .filter((u) => u.metadata.paymentType === "paid")
      .reduce((sum, u) => sum + (u.metadata.paymentAmount || 0), 0)
      .toFixed(2) || "0.00";

  return (
    <AdminShell
      title="Users"
      description="Search registrants, update payment status, and manage check-in."
      actions={
        <>
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="sm"
            variant="default"
          >
            Add user
          </Button>
          <Button
            onClick={handleDownloadExcel}
            size="sm"
            variant="outline"
            disabled={!filteredUsers || filteredUsers.length === 0}
          >
            Export Excel
          </Button>
        </>
      }
    >
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total users
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {data?.total || 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Paid
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{paidCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Amount paid
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            ${totalPaidAmount}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Exempt
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {exemptCount}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Unknown
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {unknownCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Search
            </label>
            <Input
              type="text"
              placeholder="Name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Payment status
            </label>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 sm:px-6"
                  onClick={() =>
                    setNameSortOrder((prev) =>
                      prev === null ? "asc" : prev === "asc" ? "desc" : null,
                    )
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    User
                    {nameSortOrder === "asc" ? (
                      <ArrowUp className="h-3.5 w-3.5" />
                    ) : nameSortOrder === "desc" ? (
                      <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Classification
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Checked in
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <img
                          src={user.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded-full flex-shrink-0"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName} 
                            {user.metadata.pronouns && (
                              <span className="text-gray-500 font-normal ml-1">
                                ({user.metadata.pronouns})
                              </span>
                            )}
                          </div>
                         
                          {/* Additional Details */}
                          <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                            {user.metadata.title && (
                              <div>
                                <span className="font-medium">Title:</span>{" "}
                                {user.metadata.title}
                              </div>
                            )}
                            {user.metadata.organization && (
                              <div>
                                <span className="font-medium">Org:</span>{" "}
                                {user.metadata.organization}
                              </div>
                            )}
                            {user.metadata.phoneNumber && (
                              <div>
                                <span className="font-medium">Phone:</span>{" "}
                                {user.metadata.phoneNumber}
                              </div>
                            )}
                            {user.metadata.howDidYouHear && (
                              <div>
                                <span className="font-medium">How heard:</span>{" "}
                                {user.metadata.howDidYouHear}
                              </div>
                            )}
                            {user.metadata.additionalInfo && (
                              <div className="max-w-xs">
                                <span className="font-medium">Notes:</span>{" "}
                                <span className="text-gray-500">
                                  {user.metadata.additionalInfo}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.metadata.classification || "Not set"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.metadata.paymentType === "exempt"
                            ? "bg-blue-100 text-blue-800"
                            : user.metadata.paymentType === "paid"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.metadata.paymentType === "exempt"
                          ? "Exempt"
                          : user.metadata.paymentType === "paid"
                            ? `Paid ($${user.metadata.paymentAmount || 39})`
                            : "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Switch
                        checked={!!user.metadata.isCheckedIn}
                        disabled={!!checkInUpdating[user.id]}
                        onCheckedChange={(checked: boolean) =>
                          handleCheckInToggle(user, checked)
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openHistoryDialog(user)}
                        >
                          History
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and payment status
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <img
                  src={selectedUser.imageUrl}
                  alt=""
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <div className="font-medium">{selectedUser.email}</div>
                  <div className="text-sm text-gray-500">
                    ID: {selectedUser.id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="classification">Classification</Label>
                <Select
                  value={editForm.classification}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, classification: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School Student">
                      High School Student
                    </SelectItem>
                    <SelectItem value="Undergraduate/Graduate Student">
                      Undergraduate/Graduate Student
                    </SelectItem>
                    <SelectItem value="Caldwell University Faculty/Staff">
                      Caldwell University Faculty/Staff
                    </SelectItem>
                    <SelectItem value="K-12 Educator">K-12 Educator</SelectItem>
                    <SelectItem value="Sister of St. Dominic">
                      Sister of St. Dominic
                    </SelectItem>
                    <SelectItem value="Alumni">Alumni</SelectItem>
                    <SelectItem value="Community Member">
                      Community Member
                    </SelectItem>
                    <SelectItem value="Speaker/Presenter">
                      Speaker/Presenter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select
                  value={editForm.paymentType}
                  onValueChange={(value) =>
                    setEditForm({
                      ...editForm,
                      paymentType: value as "paid" | "exempt" | "unknown",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="exempt">Exempt</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.paymentType === "paid" && (
                <div>
                  <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.paymentAmount}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        paymentAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit History</DialogTitle>
            <DialogDescription>
              {historyUser
                ? `Changes made to ${historyUser.firstName || ""} ${
                    historyUser.lastName || ""
                  } (${historyUser.email})`
                : "Changes made to this user's information"}
            </DialogDescription>
          </DialogHeader>

          {historyLoading ? (
            <div className="py-8 text-center text-gray-500">
              Loading history...
            </div>
          ) : historyError ? (
            <div className="py-8 text-center text-red-600">
              Error: {historyError}
            </div>
          ) : historyEntries.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No edits recorded for this user yet.
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {historyEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        entry.source === "admin_edit"
                          ? "bg-amber-100 text-amber-800"
                          : entry.source === "edit_information"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {SOURCE_LABELS[entry.source] || entry.source}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>

                  {entry.source === "admin_edit" &&
                    entry.edited_by !== entry.user_id && (
                      <div className="text-xs text-gray-500 mb-2">
                        Edited by admin: {entry.edited_by}
                      </div>
                    )}

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase">
                        <th className="pb-1 pr-2 font-medium">Field</th>
                        <th className="pb-1 pr-2 font-medium">Before</th>
                        <th className="pb-1 font-medium">After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.changes.map((change, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="py-1.5 pr-2 font-medium text-gray-900">
                            {FIELD_LABELS[change.field] || change.field}
                          </td>
                          <td className="py-1.5 pr-2 text-red-700 break-all">
                            {change.old_value ?? (
                              <span className="text-gray-400 italic">
                                empty
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 text-green-700 break-all">
                            {change.new_value ?? (
                              <span className="text-gray-400 italic">
                                empty
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <img
                  src={userToDelete.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <div className="font-medium">
                    {userToDelete.firstName} {userToDelete.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {userToDelete.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="addEmail">Email (Optional)</Label>
              <Input
                id="addEmail"
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                placeholder="user@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addFirstName">First Name *</Label>
                <Input
                  id="addFirstName"
                  value={addForm.firstName}
                  onChange={(e) =>
                    setAddForm({ ...addForm, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="addLastName">Last Name *</Label>
                <Input
                  id="addLastName"
                  value={addForm.lastName}
                  onChange={(e) =>
                    setAddForm({ ...addForm, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="addPassword">
                Password (Optional, min 8 characters if provided)
              </Label>
              <Input
                id="addPassword"
                type="password"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({ ...addForm, password: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="addClassification">Classification *</Label>
              <Select
                value={addForm.classification}
                onValueChange={(value) =>
                  setAddForm({ ...addForm, classification: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School Student">
                    High School Student
                  </SelectItem>
                  <SelectItem value="Undergraduate/Graduate Student">
                    Undergraduate/Graduate Student
                  </SelectItem>
                  <SelectItem value="Caldwell University Faculty/Staff">
                    Caldwell University Faculty/Staff
                  </SelectItem>
                  <SelectItem value="K-12 Educator">K-12 Educator</SelectItem>
                  <SelectItem value="Sister of St. Dominic">
                    Sister of St. Dominic
                  </SelectItem>
                  <SelectItem value="Alumni">Alumni</SelectItem>
                  <SelectItem value="Community Member">
                    Community Member
                  </SelectItem>
                  <SelectItem value="Speaker/Presenter">
                    Speaker/Presenter
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="addPaymentType">Payment Type *</Label>
              <Select
                value={addForm.paymentType}
                onValueChange={(value) =>
                  setAddForm({
                    ...addForm,
                    paymentType: value as "paid" | "exempt" | "unknown",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="exempt">Exempt</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {addForm.paymentType === "paid" && (
              <div>
                <Label htmlFor="addPaymentAmount">Payment Amount ($)</Label>
                <Input
                  id="addPaymentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.paymentAmount}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      paymentAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                resetAddForm();
              }}
              disabled={addLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={
                addLoading ||
                !addForm.firstName ||
                !addForm.lastName ||
                (addForm.password.length > 0 && addForm.password.length < 8) ||
                !addForm.classification
              }
            >
              {addLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
