// import * as SQLite from "expo-sqlite";
// import { supabase } from "@/utils/supabase";
// import Storage from "expo-sqlite/kv-store";
// import { router } from "expo-router";
// import { Alert } from "react-native";
// import debounce from "lodash/debounce";
// import {
//   checkInternetConnection,
//   setupConnectivityListener,
// } from "./checkNetwork";
// import {
//   CategoryType,
//   PrayerType,
//   PrayerTranslationType,
//   PrayerWithCategory,
//   PayPalType,
//   VersionType,
//   FavoritePrayer,
// } from "./types";

// // Singleton database instance
// let dbInstance: SQLite.SQLiteDatabase | null = null;

// /**
//  * Returns a singleton instance of the database
//  */
// const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
//   if (!dbInstance) {
//     dbInstance = await SQLite.openDatabaseAsync("content-database.db");
//     // Set up initial configuration
//     await dbInstance.execAsync(`
//       PRAGMA journal_mode = WAL;
//       PRAGMA foreign_keys = ON;
//     `);
//   }
//   return dbInstance;
// };

// // Flag to ensure only one initialization runs at a time
// let isInitializing = false;

// /**
//  * Wraps initializeDatabase to avoid concurrent executions.
//  */
// export const safeInitializeDatabase = async () => {
//   if (isInitializing) {
//     console.log("Database initialization is already running. Skipping.");
//     return;
//   }
//   isInitializing = true;
//   try {
//     await initializeDatabase();
//   } finally {
//     isInitializing = false;
//   }
// };

// // Create a debounced version of safeInitializeDatabase (3 seconds delay)
// export const debouncedSafeInitializeDatabase = debounce(() => {
//   safeInitializeDatabase();
// }, 3000);

// /**
//  * Main function to initialize the local database with remote data.
//  */
// export const initializeDatabase = async () => {
//   // Check for an active internet connection
//   const isOnline = await checkInternetConnection();

//   if (!isOnline) {
//     // When offline, check if local data already exists
//     const prayerCount = await getPrayerCount();
//     if (prayerCount > 0) {
//       console.log(
//         "Offline mode with existing data. Database considered initialized."
//       );
//       Alert.alert(
//         "Offline-Modus",
//         "Sie sind derzeit offline. Die bestehenden Inhalte werden angezeigt.",
//         [{ text: "OK" }]
//       );
//       return; // Data exists, so we consider the DB initialized
//     }

//     console.warn(
//       "No internet connection and no local data available. Running in offline mode."
//     );
//     Alert.alert(
//       "Keine Verbindung",
//       "Sie sind offline und es sind keine Daten verfügbar. Bitte stellen Sie eine Internetverbindung her.",
//       [{ text: "OK" }]
//     );
//     // Set up a connectivity listener to re-initialize once online
//     setupConnectivityListener(() => {
//       console.log("Internet connection restored. Re-initializing database...");
//       debouncedSafeInitializeDatabase();
//     });
//     return;
//   }

//   // Check if version in Storage is up to date
//   const checkVersion = async () => {
//     try {
//       const versionFromStorage = await Storage.getItem("version");
//       const versionFromSupabase = await fetchVersionFromSupabase();

//       // If there's a version mismatch, sync all data
//       if (versionFromSupabase && versionFromStorage !== versionFromSupabase) {
//         await createTables();
//         await fetchAndSyncAllData();
//         await Storage.setItemSync("version", versionFromSupabase);
//         Alert.alert(
//           "Daten geladen",
//           "Alle Inhalte wurden erfolgreich synchronisiert.",
//           [{ text: "OK" }]
//         );
//       }
//     } catch (error: any) {
//       console.error(
//         "Error during version check and data synchronization:",
//         error
//       );
//       Alert.alert(
//         "Fehler",
//         error.message ||
//           "Beim Aktualisieren der Inhalte ist ein Fehler aufgetreten.",
//         [{ text: "OK" }]
//       );
//     }
//   };

//   await checkVersion();
//   setupSubscriptions();
// };

// /**
//  * Create all necessary tables in SQLite based on Supabase structure.
//  * Only creates tables if they don't already exist.
//  */
// export const createTables = async () => {
//   try {
//     const db = await getDatabase();

//     await db.execAsync(`
//     -- Create categories table
//       CREATE TABLE IF NOT EXISTS categories (
//         id INTEGER PRIMARY KEY,
//         title TEXT NOT NULL,
//         parent_id TEXT  -- now storing a JSON array of numbers
//       );

//       -- Create prayers table
//       CREATE TABLE IF NOT EXISTS prayers (
//         id INTEGER PRIMARY KEY,
//         name TEXT,
//         arabic_title TEXT,
//         category_id INTEGER NOT NULL,
//         created_at TEXT DEFAULT CURRENT_TIMESTAMP,
//         updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
//         languages_available TEXT NOT NULL,
//         FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
//       );

//       -- Create prayer_translations table
//       CREATE TABLE IF NOT EXISTS prayer_translations (
//         id INTEGER PRIMARY KEY,
//         prayer_id INTEGER NOT NULL,
//         language_code TEXT NOT NULL,
//         introduction TEXT,
//         main_body TEXT,
//         notes TEXT,
//         source TEXT,
//         created_at TEXT DEFAULT CURRENT_TIMESTAMP,
//         updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
//         UNIQUE (prayer_id, language_code),
//         FOREIGN KEY (prayer_id) REFERENCES prayers(id) ON DELETE CASCADE
//       );

//       -- Create languages table
//       CREATE TABLE IF NOT EXISTS languages (
//         id INTEGER PRIMARY KEY,
//         language_code TEXT NOT NULL,
//         created_at TEXT DEFAULT CURRENT_TIMESTAMP
//       );

//       -- Favorites table (local only feature)
//       CREATE TABLE IF NOT EXISTS favorites (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         prayer_id INTEGER NOT NULL UNIQUE,
//         added_at TEXT DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (prayer_id) REFERENCES prayers(id) ON DELETE CASCADE
//       );

//       -- Version table
//       CREATE TABLE IF NOT EXISTS version (
//         id INTEGER PRIMARY KEY,
//         version TEXT NOT NULL,
//         created_at TEXT DEFAULT CURRENT_TIMESTAMP
//       );

//       -- PayPal table
//       CREATE TABLE IF NOT EXISTS paypal (
//         id INTEGER PRIMARY KEY,
//         paypal_link TEXT NOT NULL,
//         created_at TEXT DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     console.log("All tables created successfully");
//   } catch (error) {
//     console.error("Error creating tables:", error);
//     throw error;
//   }
// };

// /**
//  * Fetch version from Supabase.
//  */
// const fetchVersionFromSupabase = async (): Promise<string | null> => {
//   try {
//     const { data, error } = await supabase
//       .from("version")
//       .select("version")
//       .single();

//     if (error) {
//       console.error("Error fetching version:", error);
//       return null;
//     }

//     return data?.version || null;
//   } catch (error) {
//     console.error("Unexpected error in fetchVersionFromSupabase:", error);
//     return null;
//   }
// };

// /**
//  * Fetch and sync all data from Supabase to SQLite.
//  */
// const fetchAndSyncAllData = async () => {
//   try {
//     await fetchAndSyncCategories();
//     await fetchAndSyncPrayers();
//     await fetchAndSyncPrayerTranslations();
//     await fetchAndSyncLanguages();
//     await fetchPayPalLink();
//     console.log("All data synced successfully");
//   } catch (error) {
//     console.error("Error syncing data:", error);
//     Alert.alert(
//       "Synchronisierungsfehler",
//       "Die Daten konnten nicht synchronisiert werden. Bitte versuchen Sie es später erneut.",
//       [{ text: "OK" }]
//     );
//     throw error;
//   }
// };

// const fetchAndSyncCategories = async () => {
//   try {
//     const { data: categories, error } = await supabase
//       .from("categories")
//       .select("*");

//     if (error) {
//       console.error("Error fetching categories:", error);
//       return;
//     }

//     if (!categories || categories.length === 0) {
//       console.log("No categories found in Supabase.");
//       return;
//     }

//     const db = await getDatabase();

//     await db.withExclusiveTransactionAsync(async (txn) => {
//       const statement = await txn.prepareAsync(`
//         INSERT OR REPLACE INTO categories
//         (id, title, parent_id)
//         VALUES (?, ?, ?);
//       `);

//       try {
//         for (const category of categories) {
//           await statement.executeAsync([
//             category.id,
//             category.title,
//             category.parent_id ? JSON.stringify(category.parent_id) : null,
//           ]);
//         }
//       } finally {
//         await statement.finalizeAsync();
//       }
//     });

//     console.log("Categories successfully synced to SQLite.");
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       !error.message.includes("database is locked")
//     ) {
//       console.error("Error in fetchAndSyncCategories:", error);
//     }
//     throw error;
//   }
// };

// const fetchAndSyncPrayers = async () => {
//   try {
//     const { data: prayers, error } = await supabase.from("prayers").select("*");

//     if (error) throw error;
//     if (!prayers?.length) return;

//     const db = await getDatabase();

//     await db.withExclusiveTransactionAsync(async (txn) => {
//       const statement = await txn.prepareAsync(`
//         INSERT OR REPLACE INTO prayers
//         (id, name, arabic_title, category_id, created_at, updated_at, languages_available)
//         VALUES (?, ?, ?, ?, ?, ?, ?);
//       `);

//       try {
//         for (const prayer of prayers) {
//           await statement.executeAsync([
//             prayer.id,
//             prayer.name,
//             prayer.arabic_title,
//             prayer.category_id, // Use category_id as specified in Supabase schema
//             prayer.created_at,
//             prayer.updated_at,
//             JSON.stringify(prayer.languages_available || []),
//           ]);
//         }
//       } finally {
//         await statement.finalizeAsync();
//       }
//     });

//     console.log("Prayers successfully synced to SQLite.");
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       !error.message.includes("database is locked")
//     ) {
//       console.error("Unexpected error in fetchAndSyncPrayers:", error);
//     }
//     throw error;
//   }
// };

// const fetchAndSyncPrayerTranslations = async () => {
//   try {
//     const { data: translations, error } = await supabase
//       .from("prayer_translations")
//       .select("*");

//     if (error) {
//       console.error("Error fetching prayer translations:", error);
//       return;
//     }

//     if (!translations || translations.length === 0) {
//       console.log("No prayer translations found in Supabase.");
//       return;
//     }

//     const db = await getDatabase();

//     await db.withExclusiveTransactionAsync(async (txn) => {
//       const statement = await txn.prepareAsync(`
//         INSERT OR REPLACE INTO prayer_translations
//         (id, prayer_id, language_code, introduction, main_body, notes, source, created_at, updated_at)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
//       `);

//       try {
//         for (const translation of translations) {
//           await statement.executeAsync([
//             translation.id,
//             translation.prayer_id,
//             translation.language_code,
//             translation.introduction || null,
//             translation.main_body || null,
//             translation.notes || null,
//             translation.source || null,
//             translation.created_at,
//             translation.updated_at,
//           ]);
//         }
//       } finally {
//         await statement.finalizeAsync();
//       }
//     });

//     console.log("Prayer translations successfully synced to SQLite.");
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       !error.message.includes("database is locked")
//     ) {
//       console.error("Error in fetchAndSyncPrayerTranslations:", error);
//     }
//     throw error;
//   }
// };

// const fetchAndSyncLanguages = async () => {
//   try {
//     const { data: languages, error } = await supabase
//       .from("languages")
//       .select("*");

//     if (error) {
//       console.error("Error fetching languages:", error);
//       return;
//     }

//     if (!languages || languages.length === 0) {
//       console.log("No languages found in Supabase.");
//       return;
//     }

//     const db = await getDatabase();

//     await db.withExclusiveTransactionAsync(async (txn) => {
//       const statement = await txn.prepareAsync(`
//         INSERT OR REPLACE INTO languages
//         (id, language_code, created_at)
//         VALUES (?, ?, ?);
//       `);

//       try {
//         for (const language of languages) {
//           await statement.executeAsync([
//             language.id,
//             language.language_code,
//             language.created_at,
//           ]);
//         }
//       } finally {
//         await statement.finalizeAsync();
//       }
//     });

//     console.log("Languages successfully synced to SQLite.");
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       !error.message.includes("database is locked")
//     ) {
//       console.error("Error in fetchAndSyncLanguages:", error);
//     }
//     throw error;
//   }
// };

// const fetchPayPalLink = async () => {
//   try {
//     const { data, error } = await supabase
//       .from("paypal")
//       .select("paypal_link")
//       .single();

//     if (error) {
//       console.error("Error fetching PayPal link:", error);
//       return;
//     }

//     if (data?.paypal_link) {
//       Storage.setItemSync("paypal", data.paypal_link);

//       // Also store in SQLite
//       const db = await getDatabase();
//       await db.runAsync(
//         "INSERT OR REPLACE INTO paypal (id, paypal_link) VALUES (1, ?);",
//         [data.paypal_link]
//       );
//     } else {
//       console.warn("No PayPal link found in Supabase.");
//     }
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       !error.message.includes("database is locked")
//     ) {
//       console.error("Error in fetchPayPalLink:", error);
//     }
//     throw error;
//   }
// };

// const setupSubscriptions = () => {
//   // Subscribe to changes in the `version` table
//   supabase
//     .channel("version")
//     .on(
//       "postgres_changes",
//       { event: "*", schema: "public", table: "version" },
//       async (payload) => {
//         try {
//           console.log("Version change received!", payload);
//           await initializeDatabase(); // Re-fetch data if version changes
//           router.replace("/(tabs)/home");
//           Alert.alert(
//             "Inhalte aktualisiert",
//             "Neue Inhalte sind jetzt verfügbar.",
//             [{ text: "OK" }]
//           );
//         } catch (error) {
//           console.error("Error handling version change:", error);
//           Alert.alert(
//             "Fehler bei der Aktualisierung",
//             "Die neuen Inhalte konnten nicht geladen werden.",
//             [{ text: "OK" }]
//           );
//         }
//       }
//     )
//     .subscribe();

//   // Subscribe to PayPal table changes
//   supabase
//     .channel("paypal")
//     .on(
//       "postgres_changes",
//       { event: "*", schema: "public", table: "payPal" },
//       async (payload) => {
//         try {
//           console.log("PayPal change received!", payload);
//           await fetchPayPalLink();
//           router.replace("/(tabs)/home");
//           Alert.alert(
//             "Inhalte aktualisiert",
//             "Neue Inhalte sind jetzt verfügbar.",
//             [{ text: "OK" }]
//           );
//         } catch (error) {
//           console.error("Error handling PayPal change:", error);
//           Alert.alert(
//             "Fehler bei der Aktualisierung",
//             "Die PayPal-Daten konnten nicht aktualisiert werden.",
//             [{ text: "OK" }]
//           );
//         }
//       }
//     )
//     .subscribe();
// };

// /**
//  * Get the number of prayers in the local database.
//  */
// export const getPrayerCount = async (): Promise<number> => {
//   try {
//     const db = await getDatabase();
//     const result = await db.getFirstAsync<{ count: number }>(
//       "SELECT COUNT(*) as count FROM prayers;"
//     );
//     return result?.count ?? 0;
//   } catch (error) {
//     console.error("Error getting prayer count:", error);
//     return 0;
//   }
// };

// /**
//  * Favorites management functions for prayers.
//  */
// export const addPrayerToFavorite = async (prayerId: number): Promise<void> => {
//   try {
//     const db = await getDatabase();
//     await db.runAsync(
//       "INSERT OR IGNORE INTO favorites (prayer_id) VALUES (?);",
//       [prayerId]
//     );
//     console.log(`Prayer ${prayerId} added to favorites.`);
//     Alert.alert("Favoriten", "Gebet zu Favoriten hinzugefügt.", [
//       { text: "OK" },
//     ]);
//   } catch (error) {
//     console.error("Error adding to favorites:", error);
//     Alert.alert(
//       "Fehler",
//       "Gebet konnte nicht zu Favoriten hinzugefügt werden.",
//       [{ text: "OK" }]
//     );
//     throw error;
//   }
// };

// export const removePrayerFromFavorite = async (
//   prayerId: number
// ): Promise<void> => {
//   try {
//     const db = await getDatabase();
//     await db.runAsync("DELETE FROM favorites WHERE prayer_id = ?;", [prayerId]);
//     console.log(`Prayer ${prayerId} removed from favorites.`);
//     Alert.alert("Favoriten", "Gebet aus Favoriten entfernt.", [{ text: "OK" }]);
//   } catch (error) {
//     console.error("Error removing from favorites:", error);
//     Alert.alert("Fehler", "Gebet konnte nicht aus Favoriten entfernt werden.", [
//       { text: "OK" },
//     ]);
//     throw error;
//   }
// };

// export const isPrayerInFavorite = async (
//   prayerId: number
// ): Promise<boolean> => {
//   try {
//     const db = await getDatabase();
//     const result = await db.getFirstAsync<{ count: number }>(
//       "SELECT COUNT(*) as count FROM favorites WHERE prayer_id = ?;",
//       [prayerId]
//     );
//     return (result?.count ?? 0) > 0;
//   } catch (error) {
//     console.error("Error checking favorite status:", error);
//     throw error;
//   }
// };

// /**
//  * Fetches all favorite prayers with proper translation handling
//  * @param language The preferred language code (e.g., "en", "de")
//  * @returns Array of favorite prayers with appropriate translations
//  */
// export const getFavoritePrayers = async (
//   language: string = "en"
// ): Promise<FavoritePrayer[]> => {
//   try {
//     const db = await getDatabase();
//     const normalizedLanguage = language.toLowerCase();
//     const fallbackLanguage = normalizedLanguage === "en" ? "de" : "en";

//     // Updated query to include missing fields (created_at, updated_at, languages_available)
//     const query = `
//       WITH favorite_prayers AS (
//         SELECT prayer_id, added_at
//         FROM favorites
//         ORDER BY added_at DESC
//       )
//       SELECT
//         p.id,
//         p.name,
//         p.arabic_title,
//         p.category_id,
//         c.title as category_title,
//         p.created_at,
//         p.updated_at,
//         p.languages_available,
//         pt.introduction,
//         SUBSTR(pt.main_body, 1, 150) as prayer_text,
//         fp.added_at,
//         pt.language_code
//       FROM favorite_prayers fp
//       JOIN prayers p ON fp.prayer_id = p.id
//       JOIN categories c ON p.category_id = c.id
//       LEFT JOIN prayer_translations pt ON p.id = pt.prayer_id
//         AND (pt.language_code = ? OR pt.language_code = ?)
//       ORDER BY fp.added_at DESC,
//         CASE WHEN pt.language_code = ? THEN 0 ELSE 1 END;
//     `;

//     // Define the expected row shape and cast the rows accordingly.
//     const rows = (await db.getAllAsync(query, [
//       normalizedLanguage,
//       fallbackLanguage,
//       normalizedLanguage,
//     ])) as Array<FavoritePrayer & { languages_available: string }>;

//     // Process results ensuring one entry per prayer with the preferred translation
//     const prayerMap = new Map<number, FavoritePrayer>();

//     for (const row of rows) {
//       const prayerId = row.id;
//       if (!prayerMap.has(prayerId)) {
//         let languagesAvailable: string[] = [];
//         try {
//           languagesAvailable = JSON.parse(row.languages_available);
//         } catch (e) {
//           console.error("Error parsing languages_available", e);
//         }

//         prayerMap.set(prayerId, {
//           id: prayerId,
//           name: row.name,
//           arabic_title: row.arabic_title,
//           category_id: row.category_id,
//           category_title: row.category_title,
//           introduction: row.introduction || null,
//           prayer_text: row.prayer_text || null,
//           created_at: row.created_at,
//           updated_at: row.updated_at,
//           languages_available: languagesAvailable,
//         });
//       }
//     }

//     return Array.from(prayerMap.values());
//   } catch (error) {
//     console.error("Error fetching favorite prayers:", error);
//     Alert.alert("Fehler", "Favoriten konnten nicht geladen werden.", [
//       { text: "OK" },
//     ]);
//     throw error;
//   }
// };

// /**
//  * Content retrieval functions for prayers.
//  */
// export const getCategories = async (): Promise<CategoryType[]> => {
//   try {
//     const db = await getDatabase();
//     const rows = await db.getAllAsync<CategoryType>(
//       "SELECT * FROM categories;"
//     );
//     return rows;
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     Alert.alert("Fehler", "Kategorien konnten nicht geladen werden.", [
//       { text: "OK" },
//     ]);
//     throw error;
//   }
// };

// export const getChildCategories = async (
//   parentId: number
// ): Promise<CategoryType[]> => {
//   try {
//     const db = await getDatabase();
//     // Get all categories because filtering directly in SQLite isn't straightforward
//     const allCategories = await db.getAllAsync<CategoryType>("SELECT * FROM categories;");
//     // Filter categories by checking if their JSON parent_id array includes the given parentId
//     return allCategories.filter((cat) => {
//       if (!cat.parent_id) return false;
//       try {
//         const parentIds: number[] = JSON.parse(cat.parent_id);
//         return Array.isArray(parentIds) && parentIds.includes(parentId);
//       } catch (error) {
//         console.error(`Error parsing parent_id for category ${cat.id}`, error);
//         return false;
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching child categories:", error);
//     throw error;
//   }
// };

// export const getCategoryById = async (
//   categoryId: number
// ): Promise<CategoryType | null> => {
//   try {
//     const db = await getDatabase();
//     const query = "SELECT * FROM categories WHERE id = ? LIMIT 1;";
//     const row = await db.getFirstAsync<CategoryType>(query, [categoryId]);
//     return row || null;
//   } catch (error) {
//     console.error("Error fetching category by ID:", error);
//     throw error;
//   }
// };

// export const getCategoryByTitle = async (
//   title: string
// ): Promise<CategoryType | null> => {
//   try {
//     const db = await getDatabase();
//     const query = "SELECT * FROM categories WHERE title = ? LIMIT 1;";
//     const row = await db.getFirstAsync<CategoryType>(query, [title]);
//     return row || null;
//   } catch (error) {
//     console.error("Error fetching category by title:", error);
//     throw error;
//   }
// };

// export const getAllPrayersForCategory = async (
//   categoryTitle: string,
//   language: string
// ): Promise<PrayerWithCategory[]> => {
//   try {
//     const db = await getDatabase();

//     // Get the category for the given title
//     const category = await getCategoryByTitle(categoryTitle);
//     if (!category) {
//       throw new Error(`Category with title "${categoryTitle}" not found`);
//     }

//     // Get all descendant category IDs including itself
//     const descendantIds = await getCategoryAndDescendantIds(category.id, db);
//     const placeholders = descendantIds.map(() => '?').join(',');

//     // Query to fetch prayers that have a category_id in the descendant IDs
//     const query = `
//       SELECT
//         p.id,
//         p.category_id,
//         p.name,
//         p.arabic_title,
//         p.created_at,
//         p.updated_at,
//         c.title as category_title,
//         p.name as translation_title,
//         pt.main_body as prayer_text,
//         pt.notes as notes
//       FROM prayers p
//       INNER JOIN categories c ON p.category_id = c.id
//       INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
//       WHERE p.category_id IN (${placeholders}) AND pt.language_code = ?
//       ORDER BY datetime(p.created_at) DESC;
//     `;

//     // Combine descendant IDs with the language parameter
//     const params = [...descendantIds, language];
//     const rows = await db.getAllAsync<PrayerWithCategory>(query, params);
//     return rows;
//   } catch (error) {
//     console.error("Error fetching prayers for category:", error);
//     Alert.alert("Fehler", "Gebete konnten nicht geladen werden.", [{ text: "OK" }]);
//     throw error;
//   }
// };

// // Helper function to get a category ID and all descendant category IDs recursively
// export const getCategoryAndDescendantIds = async (
//   categoryId: number,
//   db: SQLite.SQLiteDatabase
// ): Promise<number[]> => {
//   const ids = [categoryId];
//   // Get all categories (with id and parent_id)
//   const allCategories = await db.getAllAsync<{ id: number; parent_id: string }>(
//     "SELECT id, parent_id FROM categories;"
//   );

//   const findDescendants = (parentId: number) => {
//     for (const cat of allCategories) {
//       if (cat.parent_id) {
//         try {
//           const parentIds: number[] = JSON.parse(cat.parent_id);
//           if (Array.isArray(parentIds) && parentIds.includes(parentId)) {
//             if (!ids.includes(cat.id)) {
//               ids.push(cat.id);
//               findDescendants(cat.id);
//             }
//           }
//         } catch (e) {
//           console.error("Error parsing parent_id for category", cat.id, e);
//         }
//       }
//     }
//   };

//   findDescendants(categoryId);
//   return ids;
// };

// export const getPrayer = async (
//   prayerId: number,
//   language: string
// ): Promise<PrayerWithCategory | null> => {
//   try {
//     const db = await getDatabase();
//     // Query to fetch prayer details with translation and category information
//     const query = `
//       SELECT
//         p.id,
//         p.category_id,
//         p.name,
//         p.arabic_title,
//         p.created_at,
//         p.updated_at,
//         p.languages_available,
//         c.title as category_title,
//         pt.introduction,
//         pt.main_body as prayer_text,
//         pt.notes,
//         pt.source
//       FROM prayers p
//       INNER JOIN categories c ON p.category_id = c.id
//       INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
//       WHERE p.id = ? AND pt.language_code = ?;
//     `;

//     // Execute the query
//     const row = await db.getFirstAsync<PrayerWithCategory>(query, [
//       prayerId,
//       language,
//     ]);

//     // If a row is found, parse the languages_available array and return the result
//     if (row) {

//       try {
//         // Parse the languages_available JSON string if it's a string
//         const languages =
//           typeof row.languages_available === "string"
//             ? JSON.parse(row.languages_available)
//             : row.languages_available;
//         console.log(languages)
//         return {
//           ...row,
//           languages_available: languages,
//         };
//       } catch (e) {
//         console.error("Error parsing languages_available:", e);
//         return row; // Return the row without parsing if there's an error
//       }
//     }

//     // If no row is found, return null
//     return null;
//   } catch (error) {
//     console.error("Error fetching prayer:", error);
//     Alert.alert("Fehler", "Gebet konnte nicht geladen werden.", [
//       { text: "OK" },
//     ]);
//     throw error;
//   }
// };

// export const searchPrayers = async (
//   searchTerm: string,
//   language: string
// ): Promise<PrayerWithCategory[]> => {
//   try {
//     const db = await getDatabase();
//     const query = `
//       SELECT
//         p.id,
//         p.category_id,
//         p.name,
//         p.arabic_title,
//         p.created_at,
//         p.updated_at,
//         c.title as category_title,
//         p.name as translation_title,
//         pt.main_body as prayer_text,
//         pt.notes as notes
//       FROM prayers p
//       INNER JOIN categories c ON p.category_id = c.id
//       INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
//       WHERE (pt.main_body LIKE ? OR p.name LIKE ?) AND pt.language_code = ?;
//     `;
//     const rows = await db.getAllAsync<PrayerWithCategory>(query, [
//       `%${searchTerm}%`,
//       `%${searchTerm}%`,
//       language,
//     ]);

//     return rows;
//   } catch (error) {
//     console.error("Error searching prayers:", error);
//     Alert.alert("Fehler", "Suche konnte nicht durchgeführt werden.", [
//       { text: "OK" },
//     ]);
//     throw error;
//   }
// };

// export const getLatestPrayers = async (
//   limit: number = 10,
//   language: string
// ): Promise<PrayerWithCategory[]> => {
//   try {
//     const db = await getDatabase();
//     const query = `
//       SELECT
//         p.id,
//         p.category_id,
//         p.name,
//         p.arabic_title,
//         p.created_at,
//         p.updated_at,
//         c.title as category_title,
//         p.name as translation_title,
//         pt.main_body as prayer_text,
//         pt.notes as notes
//       FROM prayers p
//       INNER JOIN categories c ON p.category_id = c.id
//       INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
//       WHERE pt.language_code = ?
//       ORDER BY datetime(p.created_at) DESC
//       LIMIT ?;
//     `;
//     const rows = await db.getAllAsync<PrayerWithCategory>(query, [
//       language,
//       limit,
//     ]);
//     return rows;
//   } catch (error) {
//     console.error("Error retrieving latest prayers:", error);
//     Alert.alert("Fehler", "Aktuelle Gebete konnten nicht geladen werden.", [
//       { text: "OK" },
//     ]);
//     throw error;
//   }
// };

// export const getPayPalLink = async (): Promise<string> => {
//   try {
//     // First try to get from Storage for performance
//     const storedLink = await Storage.getItem("paypal");
//     if (storedLink) return storedLink;

//     // If not in Storage, try SQLite
//     const db = await getDatabase();
//     const result = await db.getFirstAsync<{ paypal_link: string }>(
//       "SELECT paypal_link FROM paypal LIMIT 1;"
//     );
//     return result?.paypal_link || "";
//   } catch (error) {
//     console.error("Error getting PayPal link:", error);
//     Alert.alert("Fehler", "PayPal-Link konnte nicht geladen werden.", [
//       { text: "OK" },
//     ]);
//     return "";
//   }
// };

// // Get available languages
// export const getLanguages = async (): Promise<string[]> => {
//   try {
//     const db = await getDatabase();
//     const rows = await db.getAllAsync<{ language_code: string }>(
//       "SELECT language_code FROM languages;"
//     );
//     return rows.map((row) => row.language_code);
//   } catch (error) {
//     console.error("Error fetching languages:", error);
//     Alert.alert("Fehler", "Sprachen konnten nicht geladen werden.", [
//       { text: "OK" },
//     ]);
//     return [];
//   }
// };

import * as SQLite from "expo-sqlite";
import { supabase } from "@/utils/supabase";
import Storage from "expo-sqlite/kv-store";
import { router } from "expo-router";
import { Alert } from "react-native";
import debounce from "lodash/debounce";
import {
  checkInternetConnection,
  setupConnectivityListener,
} from "./checkNetwork";
import {
  CategoryType,
  PrayerType,
  PrayerTranslationType,
  PrayerWithCategory,
  PayPalType,
  VersionType,
  FavoritePrayer,
} from "./types";

// Singleton database instance
let dbInstance: SQLite.SQLiteDatabase | null = null;

const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("content-database.db");
    await dbInstance.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
  }
  return dbInstance;
};

let isInitializing = false;
export const safeInitializeDatabase = async () => {
  if (isInitializing) {
    console.log("Database initialization is already running. Skipping.");
    return;
  }
  isInitializing = true;
  try {
    await initializeDatabase();
  } finally {
    isInitializing = false;
  }
};

export const debouncedSafeInitializeDatabase = debounce(() => {
  safeInitializeDatabase();
}, 3000);

export const initializeDatabase = async () => {
  const isOnline = await checkInternetConnection();
  if (!isOnline) {
    const prayerCount = await getPrayerCount();
    if (prayerCount > 0) {
      console.log(
        "Offline mode with existing data. Database considered initialized."
      );
      Alert.alert(
        "Offline-Modus",
        "Sie sind derzeit offline. Die bestehenden Inhalte werden angezeigt.",
        [{ text: "OK" }]
      );
      return;
    }
    console.warn(
      "No internet connection and no local data available. Running in offline mode."
    );
    Alert.alert(
      "Keine Verbindung",
      "Sie sind offline und es sind keine Daten verfügbar. Bitte stellen Sie eine Internetverbindung her.",
      [{ text: "OK" }]
    );
    setupConnectivityListener(() => {
      console.log("Internet connection restored. Re-initializing database...");
      debouncedSafeInitializeDatabase();
    });
    return;
  }

  const checkVersion = async () => {
    try {
      const versionFromStorage = await Storage.getItem("version");
      const versionFromSupabase = await fetchVersionFromSupabase();
      if (versionFromSupabase && versionFromStorage !== versionFromSupabase) {
        await createTables();
        await fetchAndSyncAllData();
        await Storage.setItemSync("version", versionFromSupabase);
        Alert.alert(
          "Daten geladen",
          "Alle Inhalte wurden erfolgreich synchronisiert.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error(
        "Error during version check and data synchronization:",
        error
      );
      Alert.alert(
        "Fehler",
        error.message ||
          "Beim Aktualisieren der Inhalte ist ein Fehler aufgetreten.",
        [{ text: "OK" }]
      );
    }
  };

  await checkVersion();
  setupSubscriptions();
};

export const createTables = async () => {
  try {
    const db = await getDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        parent_id TEXT
      );
      
      CREATE TABLE IF NOT EXISTS prayers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        arabic_title TEXT,
        category_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        languages_available TEXT NOT NULL,
        arabic_text TEXT,
        arabic_notes TEXT,
        transliteration_text TEXT,
        transliteration_notes TEXT,
        source TEXT,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS prayer_translations (
        id INTEGER PRIMARY KEY,
        prayer_id INTEGER NOT NULL,
        language_code TEXT NOT NULL,
        introduction TEXT,
        main_body TEXT,
        notes TEXT,
        source TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (prayer_id, language_code),
        FOREIGN KEY (prayer_id) REFERENCES prayers(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS languages (
        id INTEGER PRIMARY KEY,
        language_code TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prayer_id INTEGER NOT NULL UNIQUE,
        added_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prayer_id) REFERENCES prayers(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS version (
        id INTEGER PRIMARY KEY,
        version TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS paypal (
        id INTEGER PRIMARY KEY,
        paypal_link TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("All tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

const fetchVersionFromSupabase = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("version")
      .select("version")
      .single();
    if (error) {
      console.error("Error fetching version:", error);
      return null;
    }
    return data?.version || null;
  } catch (error) {
    console.error("Unexpected error in fetchVersionFromSupabase:", error);
    return null;
  }
};

const fetchAndSyncAllData = async () => {
  try {
    await fetchAndSyncCategories();
    await fetchAndSyncPrayers();
    await fetchAndSyncPrayerTranslations();
    await fetchAndSyncLanguages();
    await fetchPayPalLink();
    console.log("All data synced successfully");
  } catch (error) {
    console.error("Error syncing data:", error);
    Alert.alert(
      "Synchronisierungsfehler",
      "Die Daten konnten nicht synchronisiert werden. Bitte versuchen Sie es später erneut.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

const fetchAndSyncCategories = async () => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*");
    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }
    if (!categories || categories.length === 0) {
      console.log("No categories found in Supabase.");
      return;
    }
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO categories
        (id, title, parent_id)
        VALUES (?, ?, ?);
      `);
      try {
        for (const category of categories) {
          await statement.executeAsync([
            category.id,
            category.title,
            category.parent_id ? JSON.stringify(category.parent_id) : null,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
    console.log("Categories successfully synced to SQLite.");
  } catch (error) {
    if (
      error instanceof Error &&
      !error.message.includes("database is locked")
    ) {
      console.error("Error in fetchAndSyncCategories:", error);
    }
    throw error;
  }
};

const fetchAndSyncPrayers = async () => {
  try {
    const { data: prayers, error } = await supabase.from("prayers").select("*");
    if (error) throw error;
    if (!prayers?.length) return;
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO prayers
        (id, name, arabic_title, category_id, created_at, updated_at, languages_available, arabic_text, arabic_notes, transliteration_text, transliteration_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);
      try {
        for (const prayer of prayers) {
          await statement.executeAsync([
            prayer.id,
            prayer.name,
            prayer.arabic_title,
            prayer.category_id,
            prayer.created_at,
            prayer.updated_at,
            JSON.stringify(prayer.languages_available || []),
            prayer.arabic_text,
            prayer.arabic_notes,
            prayer.transliteration_text,
            prayer.transliteration_notes,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
    console.log("Prayers successfully synced to SQLite.");
  } catch (error) {
    if (
      error instanceof Error &&
      !error.message.includes("database is locked")
    ) {
      console.error("Unexpected error in fetchAndSyncPrayers:", error);
    }
    throw error;
  }
};

const fetchAndSyncPrayerTranslations = async () => {
  try {
    const { data: translations, error } = await supabase
      .from("prayer_translations")
      .select("*");
    if (error) {
      console.error("Error fetching prayer translations:", error);
      return;
    }
    if (!translations || translations.length === 0) {
      console.log("No prayer translations found in Supabase.");
      return;
    }
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO prayer_translations
        (id, prayer_id, language_code, introduction, main_body, notes, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);
      try {
        for (const translation of translations) {
          await statement.executeAsync([
            translation.id,
            translation.prayer_id,
            translation.language_code,
            translation.introduction || null,
            translation.main_body || null,
            translation.notes || null,
            translation.source || null,
            translation.created_at,
            translation.updated_at,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
    console.log("Prayer translations successfully synced to SQLite.");
  } catch (error) {
    if (
      error instanceof Error &&
      !error.message.includes("database is locked")
    ) {
      console.error("Error in fetchAndSyncPrayerTranslations:", error);
    }
    throw error;
  }
};

const fetchAndSyncLanguages = async () => {
  try {
    const { data: languages, error } = await supabase
      .from("languages")
      .select("*");
    if (error) {
      console.error("Error fetching languages:", error);
      return;
    }
    if (!languages || languages.length === 0) {
      console.log("No languages found in Supabase.");
      return;
    }
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO languages
        (id, language_code, created_at)
        VALUES (?, ?, ?);
      `);
      try {
        for (const language of languages) {
          await statement.executeAsync([
            language.id,
            language.language_code,
            language.created_at,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
    console.log("Languages successfully synced to SQLite.");
  } catch (error) {
    if (
      error instanceof Error &&
      !error.message.includes("database is locked")
    ) {
      console.error("Error in fetchAndSyncLanguages:", error);
    }
    throw error;
  }
};

const fetchPayPalLink = async () => {
  try {
    const { data, error } = await supabase
      .from("paypal")
      .select("paypal_link")
      .single();
    if (error) {
      console.error("Error fetching PayPal link:", error);
      return;
    }
    if (data?.paypal_link) {
      Storage.setItemSync("paypal", data.paypal_link);
      const db = await getDatabase();
      await db.runAsync(
        "INSERT OR REPLACE INTO paypal (id, paypal_link) VALUES (1, ?);",
        [data.paypal_link]
      );
    } else {
      console.warn("No PayPal link found in Supabase.");
    }
  } catch (error) {
    if (
      error instanceof Error &&
      !error.message.includes("database is locked")
    ) {
      console.error("Error in fetchPayPalLink:", error);
    }
    throw error;
  }
};

const setupSubscriptions = () => {
  supabase
    .channel("version")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "version" },
      async (payload) => {
        try {
          console.log("Version change received!", payload);
          await initializeDatabase();
          router.replace("/(tabs)/home");
          Alert.alert(
            "Inhalte aktualisiert",
            "Neue Inhalte sind jetzt verfügbar.",
            [{ text: "OK" }]
          );
        } catch (error) {
          console.error("Error handling version change:", error);
          Alert.alert(
            "Fehler bei der Aktualisierung",
            "Die neuen Inhalte konnten nicht geladen werden.",
            [{ text: "OK" }]
          );
        }
      }
    )
    .subscribe();

  supabase
    .channel("paypal")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "payPal" },
      async (payload) => {
        try {
          console.log("PayPal change received!", payload);
          await fetchPayPalLink();
          router.replace("/(tabs)/home");
          Alert.alert(
            "Inhalte aktualisiert",
            "Neue Inhalte sind jetzt verfügbar.",
            [{ text: "OK" }]
          );
        } catch (error) {
          console.error("Error handling PayPal change:", error);
          Alert.alert(
            "Fehler bei der Aktualisierung",
            "Die PayPal-Daten konnten nicht aktualisiert werden.",
            [{ text: "OK" }]
          );
        }
      }
    )
    .subscribe();
};

export const getPrayerCount = async (): Promise<number> => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM prayers;"
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error("Error getting prayer count:", error);
    return 0;
  }
};

export const addPrayerToFavorite = async (prayerId: number): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR IGNORE INTO favorites (prayer_id) VALUES (?);",
      [prayerId]
    );
    console.log(`Prayer ${prayerId} added to favorites.`);
    Alert.alert("Favoriten", "Gebet zu Favoriten hinzugefügt.", [
      { text: "OK" },
    ]);
  } catch (error) {
    console.error("Error adding to favorites:", error);
    Alert.alert(
      "Fehler",
      "Gebet konnte nicht zu Favoriten hinzugefügt werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const removePrayerFromFavorite = async (
  prayerId: number
): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM favorites WHERE prayer_id = ?;", [prayerId]);
    console.log(`Prayer ${prayerId} removed from favorites.`);
    Alert.alert("Favoriten", "Gebet aus Favoriten entfernt.", [{ text: "OK" }]);
  } catch (error) {
    console.error("Error removing from favorites:", error);
    Alert.alert("Fehler", "Gebet konnte nicht aus Favoriten entfernt werden.", [
      { text: "OK" },
    ]);
    throw error;
  }
};

export const isPrayerInFavorite = async (
  prayerId: number
): Promise<boolean> => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM favorites WHERE prayer_id = ?;",
      [prayerId]
    );
    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    throw error;
  }
};

export const getFavoritePrayers = async (
  language: string = "en"
): Promise<FavoritePrayer[]> => {
  try {
    const db = await getDatabase();
    const normalizedLanguage = language.toLowerCase();
    const fallbackLanguage = normalizedLanguage === "en" ? "de" : "en";
    const query = `
      WITH favorite_prayers AS (
        SELECT prayer_id, added_at
        FROM favorites
        ORDER BY added_at DESC
      )
      SELECT 
        p.id,
        p.name,
        p.arabic_title,
        p.category_id,
        c.title as category_title,
        p.created_at,
        p.updated_at,
        p.languages_available,
        pt.introduction,
        SUBSTR(pt.main_body, 1, 150) as prayer_text,
        fp.added_at,
        pt.language_code
      FROM favorite_prayers fp
      JOIN prayers p ON fp.prayer_id = p.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN prayer_translations pt ON p.id = pt.prayer_id 
        AND (pt.language_code = ? OR pt.language_code = ?)
      ORDER BY fp.added_at DESC, 
        CASE WHEN pt.language_code = ? THEN 0 ELSE 1 END;
    `;
    const rows = (await db.getAllAsync(query, [
      normalizedLanguage,
      fallbackLanguage,
      normalizedLanguage,
    ])) as Array<FavoritePrayer & { languages_available: string }>;
    const prayerMap = new Map<number, FavoritePrayer>();
    for (const row of rows) {
      const prayerId = row.id;
      if (!prayerMap.has(prayerId)) {
        let languagesAvailable: string[] = [];
        try {
          languagesAvailable = JSON.parse(row.languages_available);
        } catch (e) {
          console.error("Error parsing languages_available", e);
        }
        prayerMap.set(prayerId, {
          id: prayerId,
          name: row.name,
          arabic_title: row.arabic_title || null,
          category_id: row.category_id,
          category_title: row.category_title,
          introduction: row.introduction || null,
          prayer_text: row.prayer_text || null,
          created_at: row.created_at,
          updated_at: row.updated_at,
          languages_available: languagesAvailable,
        });
      }
    }
    return Array.from(prayerMap.values());
  } catch (error) {
    console.error("Error fetching favorite prayers:", error);
    Alert.alert("Fehler", "Favoriten konnten nicht geladen werden.", [
      { text: "OK" },
    ]);
    throw error;
  }
};

export const getCategories = async (): Promise<CategoryType[]> => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<CategoryType>(
      "SELECT * FROM categories;"
    );
    return rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    Alert.alert("Fehler", "Kategorien konnten nicht geladen werden.", [
      { text: "OK" },
    ]);
    throw error;
  }
};

export const getChildCategories = async (
  parentId: number
): Promise<CategoryType[]> => {
  try {
    const db = await getDatabase();
    const allCategories = await db.getAllAsync<CategoryType>(
      "SELECT * FROM categories;"
    );
    return allCategories.filter((cat) => {
      if (!cat.parent_id) return false;
      try {
        const parentIds: number[] = JSON.parse(cat.parent_id);
        return Array.isArray(parentIds) && parentIds.includes(parentId);
      } catch (error) {
        console.error(`Error parsing parent_id for category ${cat.id}`, error);
        return false;
      }
    });
  } catch (error) {
    console.error("Error fetching child categories:", error);
    throw error;
  }
};

export const getCategoryById = async (
  categoryId: number
): Promise<CategoryType | null> => {
  try {
    const db = await getDatabase();
    const query = "SELECT * FROM categories WHERE id = ? LIMIT 1;";
    const row = await db.getFirstAsync<CategoryType>(query, [categoryId]);
    return row || null;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};

export const getCategoryByTitle = async (
  title: string
): Promise<CategoryType | null> => {
  try {
    const db = await getDatabase();
    const query = "SELECT * FROM categories WHERE title = ? LIMIT 1;";
    const row = await db.getFirstAsync<CategoryType>(query, [title]);
    return row || null;
  } catch (error) {
    console.error("Error fetching category by title:", error);
    throw error;
  }
};

export const getAllPrayersForCategory = async (
  categoryTitle: string,
  language: string
): Promise<PrayerWithCategory[]> => {
  try {
    const db = await getDatabase();
    const category = await getCategoryByTitle(categoryTitle);
    if (!category) {
      throw new Error(`Category with title "${categoryTitle}" not found`);
    }
    const descendantIds = await getCategoryAndDescendantIds(category.id, db);
    const placeholders = descendantIds.map(() => "?").join(",");
    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.name,
        p.arabic_title,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        p.name as translation_title,
        pt.main_body as prayer_text,
        pt.notes as notes
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
      WHERE p.category_id IN (${placeholders}) AND pt.language_code = ?
      ORDER BY datetime(p.created_at) DESC;
    `;
    const params = [...descendantIds, language];
    const rows = await db.getAllAsync<PrayerWithCategory>(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching prayers for category:", error);
    Alert.alert("Fehler", "Gebete konnten nicht geladen werden.", [
      { text: "OK" },
    ]);
    throw error;
  }
};

export const getCategoryAndDescendantIds = async (
  categoryId: number,
  db: SQLite.SQLiteDatabase
): Promise<number[]> => {
  const ids = [categoryId];
  const allCategories = await db.getAllAsync<{ id: number; parent_id: string }>(
    "SELECT id, parent_id FROM categories;"
  );
  const findDescendants = (parentId: number) => {
    for (const cat of allCategories) {
      if (cat.parent_id) {
        try {
          const parentIds: number[] = JSON.parse(cat.parent_id);
          if (Array.isArray(parentIds) && parentIds.includes(parentId)) {
            if (!ids.includes(cat.id)) {
              ids.push(cat.id);
              findDescendants(cat.id);
            }
          }
        } catch (e) {
          console.error("Error parsing parent_id for category", cat.id, e);
        }
      }
    }
  };
  findDescendants(categoryId);
  return ids;
};

export const getPrayer = async (
  prayerId: number,
  language: string
): Promise<PrayerWithCategory | null> => {
  try {
    const db = await getDatabase();
    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.name,
        p.arabic_title,
        p.arabic_text,
        p.arabic_notes,
        p.transliteration_text,
        p.transliteration_notes,
        p.created_at,
        p.updated_at,
        p.languages_available,
        c.title as category_title,
        COALESCE(pt.introduction, '') as introduction,
        COALESCE(pt.main_body, p.transliteration_text, p.arabic_text, '') as prayer_text,
        pt.notes,
        pt.source
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      LEFT JOIN prayer_translations pt ON pt.prayer_id = p.id AND pt.language_code = ?
      WHERE p.id = ?;
    `;
    const row = await db.getFirstAsync<PrayerWithCategory>(query, [
      language,
      prayerId,
    ]);
    if (row) {
      try {
        const languages =
          typeof row.languages_available === "string"
            ? JSON.parse(row.languages_available)
            : row.languages_available;
        console.log("Parsed languages_available:", languages);
        return { ...row, languages_available: languages };
      } catch (e) {
        console.error("Error parsing languages_available:", e);
        return row;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching prayer:", error);
    throw error;
  }
};

export const searchPrayers = async (
  searchTerm: string,
  language: string
): Promise<PrayerWithCategory[]> => {
  try {
    const db = await getDatabase();
    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.name,
        p.arabic_title,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        p.name as translation_title,
        pt.main_body as prayer_text,
        pt.notes as notes
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
      WHERE (pt.main_body LIKE ? OR p.name LIKE ?) AND pt.language_code = ?;
    `;
    const rows = await db.getAllAsync<PrayerWithCategory>(query, [
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      language,
    ]);
    return rows;
  } catch (error) {
    console.error("Error searching prayers:", error);
    Alert.alert("Fehler", "Suche konnte nicht durchgeführt werden.", [
      { text: "OK" },
    ]);
    throw error;
  }
};

export const getLatestPrayers = async (
  limit: number = 10,
  language: string
): Promise<PrayerWithCategory[]> => {
  try {
    const db = await getDatabase();
    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.name,
        p.arabic_title,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        p.name as translation_title,
        pt.main_body as prayer_text,
        pt.notes as notes
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
      WHERE pt.language_code = ?
      ORDER BY datetime(p.created_at) DESC
      LIMIT ?;
    `;
    const rows = await db.getAllAsync<PrayerWithCategory>(query, [
      language,
      limit,
    ]);
    return rows;
  } catch (error) {
    console.error("Error retrieving latest prayers:", error);
    Alert.alert("Fehler", "Aktuelle Gebete konnten nicht geladen werden.", [
      { text: "OK" },
    ]);
    throw error;
  }
};

export const getPayPalLink = async (): Promise<string> => {
  try {
    const storedLink = await Storage.getItem("paypal");
    if (storedLink) return storedLink;
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ paypal_link: string }>(
      "SELECT paypal_link FROM paypal LIMIT 1;"
    );
    return result?.paypal_link || "";
  } catch (error) {
    console.error("Error getting PayPal link:", error);
    Alert.alert("Fehler", "PayPal-Link konnte nicht geladen werden.", [
      { text: "OK" },
    ]);
    return "";
  }
};

export const getLanguages = async (): Promise<string[]> => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ language_code: string }>(
      "SELECT language_code FROM languages;"
    );
    return rows.map((row) => row.language_code);
  } catch (error) {
    console.error("Error fetching languages:", error);
    Alert.alert("Fehler", "Sprachen konnten nicht geladen werden.", [
      { text: "OK" },
    ]);
    return [];
  }
};
