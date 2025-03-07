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

/**
 * New TypeScript interfaces reflecting the updated schema.
 */

export interface Category {
  id: number;
  title: string;
  image: string | null;
  parent_id?: number | null;
}

export interface Prayer {
  id: number;
  category_id: number;
  arabic: string;
  german: string;
  english: string;
  created_at: string;
  updated_at: string;
}

/**
 * For convenience we combine prayer data with its category and the prayer text
 * for the current UI language.
 */
export interface PrayerWithCategory extends Prayer {
  category_title: string;
  prayer_text: string;
}

export interface PayPal {
  id: number;
  created_at: string;
  payPay_Link: string;
}

export interface Version {
  id: number;
  created_at: string;
  version: string;
}

// Flag to ensure only one initialization runs at a time
let isInitializing = false;

/**
 * Wraps initializeDatabase to avoid concurrent executions.
 */
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

// Create a debounced version of safeInitializeDatabase (3 seconds delay)
export const debouncedSafeInitializeDatabase = debounce(() => {
  safeInitializeDatabase();
}, 3000);

/**
 * Main function to initialize the local database with remote data.
 */
export const initializeDatabase = async () => {
  // Check for an active internet connection
  const isOnline = await checkInternetConnection();

  if (!isOnline) {
    // When offline, check if local data already exists
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
      return; // Data exists, so we consider the DB initialized
    }

    console.warn(
      "No internet connection and no local data available. Running in offline mode."
    );
    Alert.alert(
      "Keine Verbindung",
      "Sie sind offline und es sind keine Daten verfügbar. Bitte stellen Sie eine Internetverbindung her.",
      [{ text: "OK" }]
    );
    // Set up a connectivity listener to re-initialize once online
    setupConnectivityListener(() => {
      console.log("Internet connection restored. Re-initializing database...");
      debouncedSafeInitializeDatabase();
    });
    return;
  }

  // Check if version in Storage is up to date
  const checkVersion = async () => {
    try {
      const versionFromStorage = await Storage.getItem("version");
      const versionFromSupabase = await fetchVersionFromSupabase();

      // If there's a version mismatch, sync all data
      if (versionFromStorage !== versionFromSupabase) {
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

/**
 * Create all necessary tables in SQLite.
 * 
 * Changes:
 * - The categories table now has: id, title, image, and parent_id for subcategories.
 * - The prayers table stores the prayer text in Arabic, German, and English.
 * - The favorites table now references a prayer (prayer_id).
 * - Version and PayPal tables remain unchanged.
 */
export const createTables = async () => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        image TEXT,
        parent_id INTEGER,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS prayers (
        id INTEGER PRIMARY KEY,
        category_id INTEGER NOT NULL,
        arabic TEXT NOT NULL,
        german TEXT NOT NULL,
        english TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prayer_id INTEGER NOT NULL UNIQUE,
        added_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prayer_id) REFERENCES prayers(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS version (
        id INTEGER PRIMARY KEY,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        version TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS paypal (
        id INTEGER PRIMARY KEY,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        payPay_Link TEXT NOT NULL
      );
    `);

    console.log("All tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

const fetchVersionFromSupabase = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("version")
      .select("version")
      .single();

    if (error) {
      console.error("Error fetching version:", error);
      throw new Error("Failed to fetch version");
    }

    return data?.version || "";
  } catch (error) {
    console.error("Unexpected error in fetchVersionFromSupabase:", error);
    throw error;
  }
};

/**
 * Fetch and sync all data from Supabase to SQLite.
 * This now includes categories and prayers.
 */
const fetchAndSyncAllData = async () => {
  try {
    await fetchAndSyncCategories();
    await fetchAndSyncPrayers();
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

    const db = await SQLite.openDatabaseAsync("content-database.db");

    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO categories
        (id, title, image, parent_id)
        VALUES (?, ?, ?, ?);
      `);

      try {
        for (const category of categories) {
          await statement.executeAsync([
            category.id,
            category.title,
            category.image || null,
            category.parent_id || null,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });

    console.log("Categories successfully synced to SQLite.");
  } catch (error) {
    console.error("Error in fetchAndSyncCategories:", error);
    throw error;
  }
};

const fetchAndSyncPrayers = async () => {
  try {
    const { data: prayers, error } = await supabase
      .from("prayers")
      .select("*");

    if (error) {
      console.error("Error fetching prayers:", error);
      return;
    }

    if (!prayers || prayers.length === 0) {
      console.log("No prayers found in Supabase.");
      return;
    }

    const db = await SQLite.openDatabaseAsync("content-database.db");

    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO prayers
        (id, category_id, arabic, german, english, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `);

      try {
        for (const prayer of prayers) {
          await statement.executeAsync([
            prayer.id,
            prayer.category_id,
            prayer.arabic,
            prayer.german,
            prayer.english,
            prayer.created_at,
            prayer.updated_at,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });

    console.log("Prayers successfully synced to SQLite.");
  } catch (error) {
    console.error("Error in fetchAndSyncPrayers:", error);
    throw error;
  }
};

const fetchPayPalLink = async () => {
  try {
    const { data, error } = await supabase
      .from("paypal")
      .select("payPay_Link")
      .single();

    if (error) {
      console.error("Error fetching PayPal link:", error);
      return;
    }

    if (data?.payPay_Link) {
      Storage.setItemSync("paypal", data.payPay_Link);

      // Also store in SQLite
      const db = await SQLite.openDatabaseAsync("content-database.db");
      await db.runAsync(
        "INSERT OR REPLACE INTO paypal (id, payPay_Link) VALUES (1, ?);",
        [data.payPay_Link]
      );
    } else {
      console.warn("No PayPal link found in Supabase.");
    }
  } catch (error) {
    console.error("Error in fetchPayPalLink:", error);
    throw error;
  }
};

const setupSubscriptions = () => {
  // Subscribe to changes in the `version` table
  supabase
    .channel("version")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "version" },
      async (payload) => {
        try {
          console.log("Version change received!", payload);
          await initializeDatabase(); // Re-fetch data if version changes
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

  // Subscribe to PayPal table changes
  supabase
    .channel("paypal")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "paypal" },
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

/**
 * Get the number of prayers in the local database.
 */
export const getPrayerCount = async (): Promise<number> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM prayers;"
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error("Error getting prayer count:", error);
    return 0;
  }
};

/**
 * Favorites management functions for prayers.
 */
export const addPrayerToFavorites = async (prayerId: number): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
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
    Alert.alert("Fehler", "Gebet konnte nicht zu Favoriten hinzugefügt werden.", [
      { text: "OK" },
    ]);
    throw error;
  }
};

export const removePrayerFromFavorites = async (
  prayerId: number
): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    await db.runAsync("DELETE FROM favorites WHERE prayer_id = ?;", [prayerId]);
    console.log(`Prayer ${prayerId} removed from favorites.`);
    Alert.alert("Favoriten", "Gebet aus Favoriten entfernt.", [
      { text: "OK" },
    ]);
  } catch (error) {
    console.error("Error removing from favorites:", error);
    Alert.alert("Fehler", "Gebet konnte nicht aus Favoriten entfernt werden.", [
      { text: "OK" },
    ]);
    throw error;
  }
};

export const isPrayerInFavorites = async (
  prayerId: number
): Promise<boolean> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
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
  language: "arabic" | "german" | "transliteration"
): Promise<PrayerWithCategory[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const rows = await db.getAllAsync<PrayerWithCategory>(`
      SELECT 
        p.id,
        p.category_id,
        p.arabic,
        p.german,
        p.transliteration,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        CASE ? 
          WHEN 'arabic' THEN p.arabic 
          WHEN 'german' THEN p.german 
          WHEN 'transliteration' THEN p.transliteration 
        END as prayer_text
      FROM prayers p
      INNER JOIN favorites f ON p.id = f.prayer_id
      INNER JOIN categories c ON p.category_id = c.id
      ORDER BY f.added_at DESC;
    `, [language]);
    return rows;
  } catch (error) {
    console.error("Error retrieving favorite prayers:", error);
    Alert.alert(
      "Fehler",
      "Favoriten konnten nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

/**
 * Content retrieval functions for prayers.
 * The queries use a CASE expression to return the appropriate prayer text based on the selected language.
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const rows = await db.getAllAsync<Category>("SELECT * FROM categories;");
    return rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    Alert.alert(
      "Fehler",
      "Kategorien konnten nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const getPrayersForCategory = async (
  categoryId: number,
  language: "arabic" | "german" | "transliteration"
): Promise<PrayerWithCategory[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.arabic,
        p.german,
        p.transliteration,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        CASE ? 
          WHEN 'arabic' THEN p.arabic 
          WHEN 'german' THEN p.german 
          WHEN 'english' THEN p.english 
        END as prayer_text
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?;
    `;
    const rows = await db.getAllAsync<PrayerWithCategory>(query, [
      language,
      categoryId,
    ]);
    return rows;
  } catch (error) {
    console.error("Error fetching prayers for category:", error);
    Alert.alert(
      "Fehler",
      "Gebete für diese Kategorie konnten nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const getPrayer = async (
  prayerId: number,
  language: "arabic" | "german" | "english"
): Promise<PrayerWithCategory | null> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.arabic,
        p.german,
        p.english,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        CASE ? 
          WHEN 'arabic' THEN p.arabic 
          WHEN 'german' THEN p.german 
          WHEN 'english' THEN p.english 
        END as prayer_text
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?;
    `;
    const row = await db.getFirstAsync<PrayerWithCategory>(query, [
      language,
      prayerId,
    ]);
    return row;
  } catch (error) {
    console.error("Error fetching prayer:", error);
    Alert.alert(
      "Fehler",
      "Gebet konnte nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const searchPrayers = async (
  searchTerm: string,
  language: "arabic" | "german" | "english"
): Promise<PrayerWithCategory[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.arabic,
        p.german,
        p.english,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        CASE ? 
          WHEN 'arabic' THEN p.arabic 
          WHEN 'german' THEN p.german 
          WHEN 'english' THEN p.english 
        END as prayer_text
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE (CASE ? 
               WHEN 'arabic' THEN p.arabic 
               WHEN 'german' THEN p.german 
               WHEN 'english' THEN p.english 
             END) LIKE ?;
    `;
    const rows = await db.getAllAsync<PrayerWithCategory>(query, [
      language,
      language,
      `%${searchTerm}%`,
    ]);
    
    if (rows.length === 0) {
      Alert.alert("Suche", "Keine Ergebnisse gefunden.", [{ text: "OK" }]);
    }
    
    return rows;
  } catch (error) {
    console.error("Error searching prayers:", error);
    Alert.alert(
      "Fehler",
      "Suche konnte nicht durchgeführt werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const getLatestPrayers = async (
  limit: number = 10,
  language: "arabic" | "german" | "english"
): Promise<PrayerWithCategory[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.arabic,
        p.german,
        p.english,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        CASE ? 
          WHEN 'arabic' THEN p.arabic 
          WHEN 'german' THEN p.german 
          WHEN 'english' THEN p.english 
        END as prayer_text
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
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
    Alert.alert(
      "Fehler",
      "Aktuelle Gebete konnten nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const getPayPalLink = async (): Promise<string> => {
  try {
    // First try to get from Storage for performance
    const storedLink = await Storage.getItem("paypal");
    if (storedLink) return storedLink;

    // If not in Storage, try SQLite
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const result = await db.getFirstAsync<{ payPay_Link: string }>(
      "SELECT payPay_Link FROM paypal LIMIT 1;"
    );
    return result?.payPay_Link || "";
  } catch (error) {
    console.error("Error getting PayPal link:", error);
    Alert.alert(
      "Fehler",
      "PayPal-Link konnte nicht geladen werden.",
      [{ text: "OK" }]
    );
    return "";
  }
};
