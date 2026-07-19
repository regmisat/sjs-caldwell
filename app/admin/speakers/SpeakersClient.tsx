"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
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
import AdminShell from "@/components/AdminShell";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface Speaker {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  is_keynote: boolean;
  is_published: boolean;
  book_links: any;
}

interface Session {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
}

export default function SpeakersClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(
    null
  );
  const [speakerSessions, setSpeakerSessions] = useState<
    Record<string, string[]>
  >({});
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    photo_url: "",
    is_keynote: false,
    is_published: false,
  });

  useEffect(() => {
    fetchSpeakers();
    fetchSessions();
  }, []);

  const sortedSpeakers = useMemo(() => {
    const keynoteSpeakers = speakers.filter((speaker) => speaker.is_keynote);
    const breakoutSpeakers = speakers
      .filter((speaker) => !speaker.is_keynote)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );

    return [...keynoteSpeakers, ...breakoutSpeakers];
  }, [speakers]);

  const fetchSpeakers = async () => {
    try {
      const res = await fetch("/api/admin/speakers");
      const data = await res.json();
      setSpeakers(data.speakers || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      const sessionsData = data.sessions || [];
      setSessions(sessionsData);

      // Build speaker-to-sessions mapping
      const mapping: Record<string, string[]> = {};
      sessionsData.forEach((session: any) => {
        session.speakers?.forEach((speaker: any) => {
          if (!mapping[speaker.id]) {
            mapping[speaker.id] = [];
          }
          mapping[speaker.id].push(session.id);
        });
      });
      setSpeakerSessions(mapping);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const openSessionDialog = (speakerId: string) => {
    setSelectedSpeakerId(speakerId);
    setIsSessionDialogOpen(true);
  };

  const toggleSession = async (sessionId: string) => {
    if (!selectedSpeakerId) return;

    const currentSessions = speakerSessions[selectedSpeakerId] || [];
    const isCurrentlyLinked = currentSessions.includes(sessionId);

    try {
      // Get the session
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;

      // Get current speaker IDs for this session
      const sessionData = await fetch("/api/admin/sessions").then((r) =>
        r.json()
      );
      const fullSession = sessionData.sessions.find(
        (s: any) => s.id === sessionId
      );
      const currentSpeakerIds =
        fullSession?.speakers?.map((s: any) => s.id) || [];

      // Update speaker IDs
      const newSpeakerIds = isCurrentlyLinked
        ? currentSpeakerIds.filter((id: string) => id !== selectedSpeakerId)
        : [...currentSpeakerIds, selectedSpeakerId];

      // Update the session with new speaker list
      const res = await fetch("/api/admin/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sessionId,
          title: fullSession.title,
          description: fullSession.description,
          start_time: fullSession.start_time,
          end_time: fullSession.end_time,
          location: fullSession.location,
          max_attendees: fullSession.max_attendees,
          is_general: fullSession.is_general,
          speaker_ids: newSpeakerIds,
        }),
      });

      if (!res.ok) throw new Error("Failed to update session");

      // Refresh sessions data
      await fetchSessions();
    } catch (error) {
      console.error("Error toggling session:", error);
      alert("Failed to update session");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, photo_url: data.url }));
        alert("Image uploaded successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleBioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bio: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = "/api/admin/speakers";
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...formData, id: editing.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchSpeakers();
        resetForm();
        alert(`Speaker ${editing ? "updated" : "created"} successfully!`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save speaker");
      }
    } catch (error) {
      console.error("Error saving speaker:", error);
      alert("Failed to save speaker");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this speaker?")) return;

    try {
      const res = await fetch(`/api/admin/speakers?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchSpeakers();
        alert("Speaker deleted successfully!");
      } else {
        alert("Failed to delete speaker");
      }
    } catch (error) {
      console.error("Error deleting speaker:", error);
      alert("Failed to delete speaker");
    }
  };

  const handleEdit = (speaker: Speaker) => {
    setEditing(speaker);
    setFormData({
      name: speaker.name,
      title: speaker.title || "",
      bio: speaker.bio || "",
      photo_url: speaker.photo_url || "",
      is_keynote: speaker.is_keynote,
      is_published: speaker.is_published,
    });
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      name: "",
      title: "",
      bio: "",
      photo_url: "",
      is_keynote: false,
      is_published: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <AdminShell title="Speakers" description="Loading speakers...">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          <p className="mt-4 text-sm text-gray-600">Loading speakers...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Speakers"
      description="Add speaker profiles and link them to sessions."
    >
        {/* Form */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            {editing ? "Edit speaker" : "Add speaker"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Bio</Label>
              <ReactQuill
                theme="snow"
                value={formData.bio}
                onChange={handleBioChange}
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
            <div>
              <Label htmlFor="photo-upload">Photo Upload</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="photo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <span className="text-sm text-gray-500">Uploading...</span>
                )}
              </div>
              {formData.photo_url && (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={formData.photo_url}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_keynote"
                checked={formData.is_keynote}
                onChange={(e) =>
                  setFormData({ ...formData, is_keynote: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_keynote">Keynote Speaker</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_published">Published (Visible to Users)</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting || uploading}>
                {submitting
                  ? "Saving..."
                  : editing
                  ? "Update Speaker"
                  : "Create Speaker"}
              </Button>
              {editing && (
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Speakers List */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-gray-900">
              All speakers ({sortedSpeakers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Sessions
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSpeakers.map((speaker) => (
                <tr key={speaker.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {speaker.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                        {speaker.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {speaker.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {speaker.title || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {speaker.is_keynote && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Keynote
                        </span>
                      )}
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          speaker.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {speaker.is_published ? "Published" : "Unpublished"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      onClick={() => openSessionDialog(speaker.id)}
                      variant="outline"
                      size="sm"
                    >
                      {speakerSessions[speaker.id]?.length || 0} Sessions
                    </Button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      onClick={() => handleEdit(speaker)}
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(speaker.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

      {/* Session Linking Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link Speaker to Sessions</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedSpeakerId && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Managing sessions for:{" "}
                  <span className="font-semibold">
                    {speakers.find((s) => s.id === selectedSpeakerId)?.name}
                  </span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500">No sessions available</p>
              ) : (
                sessions.map((session) => {
                  const isLinked = selectedSpeakerId
                    ? speakerSessions[selectedSpeakerId]?.includes(session.id)
                    : false;

                  return (
                    <div
                      key={session.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        id={`session-${session.id}`}
                        checked={isLinked}
                        onChange={() => toggleSession(session.id)}
                        className="mt-1 rounded"
                      />
                      <label
                        htmlFor={`session-${session.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{session.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(session.start_time).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}{" "}
                          -{" "}
                          {new Date(session.end_time).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSessionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
