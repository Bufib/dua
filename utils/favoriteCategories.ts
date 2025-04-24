// import AsyncStorage from "@react-native-async-storage/async-storage";

// export interface Category {
//   id: number;
//   name: string;
//   color: string;
// }

// const STORAGE_KEY = "favoriteCategories";

// // Fetch all saved categories
// export const getCategories = async (): Promise<Category[]> => {
//   const json = await AsyncStorage.getItem(STORAGE_KEY);
//   return json ? JSON.parse(json) : [];
// };

// // Save the full array back
// const saveCategories = async (cats: Category[]) => {
//   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
// };

// // Create a new category
// export const createCategory = async (
//   name: string,
//   color: string
// ): Promise<Category> => {
//   const cats = await getCategories();
//   const newCat: Category = { id: Date.now(), name, color };
//   const updated = [...cats, newCat];
//   await saveCategories(updated);
//   return newCat;
// };


// utils/favoriteCategories.ts

// 1️⃣ Drop AsyncStorage entirely
// import AsyncStorage from "@react-native-async-storage/async-storage";

// 2️⃣ Pull in your new SQLite functions
import {
  getUserCategories,
  createUserCategory,
} from "@/utils/initializeDatabase";
import { UserCategory } from "./types";

// 3️⃣ Adapt the shape if you want to keep `{ id, name, color }` rather than `title`
export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

/**
 * Fetch all saved categories via SQLite.
 */
export const getCategories = async (): Promise<Category[]> => {
  const cats: UserCategory[] = await getUserCategories();
  // if your UI expects `name` instead of `title`, map it here
  return cats.map((c) => ({
    id: c.id,
    name: c.title,
    color: c.color,
    created_at: c.created_at,
  }));
};

/**
 * Create a new category via SQLite.
 */
export const createCategory = async (
  name: string,
  color: string
): Promise<Category> => {
  const c = await createUserCategory(name, color);
  return {
    id: c.id,
    name: c.title,
    color: c.color,
    created_at: c.created_at,
  };
};
