import type { SupabaseClient } from "@supabase/supabase-js";

export const SPEAKER_PHOTOS_BUCKET = "speaker-photos";

/**
 * Ensures the public speaker-photos bucket exists.
 * Uses the service-role client (bypasses RLS).
 */
export async function ensureSpeakerPhotosBucket(supabase: SupabaseClient) {
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Failed to list storage buckets: ${listError.message}`);
  }

  const exists = buckets?.some(
    (bucket) => bucket.name === SPEAKER_PHOTOS_BUCKET,
  );

  if (exists) return;

  const { error: createError } = await supabase.storage.createBucket(
    SPEAKER_PHOTOS_BUCKET,
    {
      public: true,
      fileSizeLimit: 15 * 1024 * 1024,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/jpg",
      ],
    },
  );

  if (!createError) return;

  // 409 / already exists = race with another request; safe to ignore
  const statusCode = (createError as { statusCode?: string | number })
    .statusCode;
  const alreadyExists =
    statusCode === "409" ||
    statusCode === 409 ||
    /already exists/i.test(createError.message);

  if (!alreadyExists) {
    throw new Error(
      `Failed to create storage bucket: ${createError.message}`,
    );
  }
}
