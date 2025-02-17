import { supabase } from "@/utils/supabase";

export const deleteNewsItem = async (id: number) => {
  try {
    
    const { data, error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      console.error("Error deleting news item:", error.message);
      return { success: false, error };
    }

    console.log("News item deleted:", data);
    return { success: true, data };
  } catch (exception) {
    console.error("Unexpected error deleting news item:", exception);
    return { success: false, error: exception };
  }
};
