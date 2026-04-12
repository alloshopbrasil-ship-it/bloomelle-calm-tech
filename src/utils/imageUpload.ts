import { supabase } from "@/integrations/supabase/client";

export const uploadJournalImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('journal_images')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    // Return the storage path (not a public URL since bucket is private)
    return fileName;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

export const getSignedImageUrl = async (storagePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('journal_images')
      .createSignedUrl(storagePath, 3600); // 1 hour

    if (error) {
      console.error("Signed URL error:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }
};
