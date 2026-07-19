"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AdminShell from "@/components/AdminShell";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface Session {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  max_attendees: number;
  is_general: boolean;
  is_published: boolean;
  registration_count: number;
  speakers: Array<{
    id: string;
    name: string;
  }>;
}

interface Speaker {
  id: string;
  name: string;
  title: string | null;
}

export default function SessionsClient() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    max_attendees: 0,
    is_general: false,
    is_published: false,
    speaker_ids: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const handleDescriptionChange = (content: string) => {
    setFormData({ ...formData, description: content });
  };

  useEffect(() => {
    fetchSessions();
    fetchSpeakers();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpeakers = async () => {
    try {
      const res = await fetch("/api/admin/speakers");
      const data = await res.json();
      setSpeakers(data.speakers || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
    }
  };

  // Convert UTC date to EST datetime-local format
  const toESTDatetimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const estDate = new Date(
      date.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const year = estDate.getFullYear();
    const month = String(estDate.getMonth() + 1).padStart(2, "0");
    const day = String(estDate.getDate()).padStart(2, "0");
    const hours = String(estDate.getHours()).padStart(2, "0");
    const minutes = String(estDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const openEditDialog = (session: Session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || "",
      start_time: toESTDatetimeLocal(session.start_time),
      end_time: toESTDatetimeLocal(session.end_time),
      location: session.location || "",
      max_attendees: session.max_attendees,
      is_general: session.is_general,
      is_published: session.is_published,
      speaker_ids: session.speakers.map((s) => s.id),
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSession(null);
    setFormData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      max_attendees: 0,
      is_general: false,
      is_published: false,
      speaker_ids: [],
    });
    setIsCreateDialogOpen(true);
  };

  // Convert EST datetime-local to UTC ISO string for storage
  const estToUTC = (estDatetimeLocal: string) => {
    // Parse the datetime-local value as EST
    const [datePart, timePart] = estDatetimeLocal.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    // Create a date string with explicit EST timezone
    const estDateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

    // Create a date object treating the input as EST
    const estDate = new Date(
      new Date(estDateString).toLocaleString("en-US", {
        timeZone: "America/New_York",
      })
    );

    // Get the offset for EST/EDT
    const utcDate = new Date(estDateString + "-05:00"); // EST offset
    return utcDate.toISOString();
  };

  const handleSave = async () => {
    if (!formData.title || !formData.start_time || !formData.end_time) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const url = "/api/admin/sessions";
      const method = editingSession ? "PUT" : "POST";

      // Convert EST times to UTC for storage
      const dataToSave = {
        ...formData,
        start_time: estToUTC(formData.start_time),
        end_time: estToUTC(formData.end_time),
      };

      const body = editingSession
        ? { ...dataToSave, id: editingSession.id }
        : dataToSave;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save session");

      await fetchSessions();
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Failed to save session");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const res = await fetch(`/api/admin/sessions?id=${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete session");

      await fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session");
    }
  };

  const toggleSpeaker = (speakerId: string) => {
    setFormData((prev) => ({
      ...prev,
      speaker_ids: prev.speaker_ids.includes(speakerId)
        ? prev.speaker_ids.filter((id) => id !== speakerId)
        : [...prev.speaker_ids, speakerId],
    }));
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    });
  };

  if (loading) {
    return (
      <AdminShell title="Sessions" description="Loading sessions...">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          <p className="mt-4 text-sm text-gray-600">Loading sessions...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Sessions"
      description="Create and manage symposium sessions."
      actions={
        <Button onClick={openCreateDialog} size="sm">
          Create session
        </Button>
      }
    >
      <div className="space-y-3">
        {sessions.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-medium text-gray-900">No sessions yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Create a session to get started.
            </p>
            <Button onClick={openCreateDialog} size="sm" className="mt-4">
              Create session
            </Button>
          </div>
        )}

        {sessions.map((session) => (
          <div
            key={session.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.title}
                  </h3>
                  <Badge
                    variant={
                      session.is_published ? "secondary" : "destructive"
                    }
                  >
                    {session.is_published ? "Published" : "Unpublished"}
                  </Badge>
                  {session.is_general && (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      General
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-700">Time:</span>{" "}
                    {formatTime(session.start_time)} –{" "}
                    {formatTime(session.end_time)}
                  </p>
                  {session.location && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Location:
                      </span>{" "}
                      {session.location}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-gray-700">
                      Attendees:
                    </span>{" "}
                    {session.registration_count} / {session.max_attendees}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  onClick={() => openEditDialog(session)}
                  size="sm"
                  variant="outline"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(session.id)}
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </div>

            {session.description && (
              <div
                className="prose prose-sm mt-4 max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: session.description.replaceAll("&nbsp;", " "),
                }}
              />
            )}

            {session.speakers.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Speakers
                </p>
                <div className="flex flex-wrap gap-2">
                  {session.speakers.map((speaker) => (
                    <span
                      key={speaker.id}
                      className="rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-800"
                    >
                      {speaker.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={handleDescriptionChange}
                className="bg-white rounded-lg"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time (EST) *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time (EST) *</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="max_attendees">Max Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_attendees: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create-is_published"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="create-is_published">
                Published (Visible to Users)
              </Label>
            </div>

            <div>
              <Label>Speakers</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`speaker-${speaker.id}`}
                      checked={formData.speaker_ids.includes(speaker.id)}
                      onChange={() => toggleSpeaker(speaker.id)}
                      className="rounded"
                    />
                    <label
                      htmlFor={`speaker-${speaker.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {speaker.name}
                      {speaker.title && (
                        <span className="text-gray-500">
                          {" "}
                          - {speaker.title}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={handleDescriptionChange}
                className="bg-white rounded-lg"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-start_time">Start Time (EST) *</Label>
                <Input
                  id="create-start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="create-end_time">End Time (EST) *</Label>
                <Input
                  id="create-end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="create-location">Location</Label>
              <Input
                id="create-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="create-max_attendees">Max Attendees</Label>
              <Input
                id="create-max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_attendees: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            {/* <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create-is_general"
                checked={formData.is_general}
                onChange={(e) =>
                  setFormData({ ...formData, is_general: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="create-is_general">
                General Session (everyone attends)
              </Label>
            </div> */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create-is_published"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="create-is_published">
                Published (Visible to Users)
              </Label>
            </div>
            <div>
              <Label>Speakers</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`create-speaker-${speaker.id}`}
                      checked={formData.speaker_ids.includes(speaker.id)}
                      onChange={() => toggleSpeaker(speaker.id)}
                      className="rounded"
                    />
                    <label
                      htmlFor={`create-speaker-${speaker.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {speaker.name}
                      {speaker.title && (
                        <span className="text-gray-500">
                          {" "}
                          - {speaker.title}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
