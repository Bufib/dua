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

// Type definitions based on your table structure
export interface Category {
  category_id: number;
  name: string;
  description: string | null;
}

export interface Language {
  language_id: number;
  language_code: string;
  language_name: string;
}

export interface PayPal {
  id: number;
  created_at: string;
  payPay_Link: string;
}

export interface Text {
  text_id: number;
  category_id: number;
  created_at: string;
  is_original: boolean;
}

export interface TextTranslation {
  translation_id: number;
  text_id: number;
  language_id: number;
  header: string;
  body: string;
  translated_at: string;
}

export interface Version {
  id: number;
  created_at: string;
  version: string;
}

export interface TextWithTranslation extends Text {
  header: string;
  body: string;
  language_name: string;
  language_code: string;
  category_name: string;
}

export interface SearchResult {
  text_id: number;
  category_id: number;
  header: string;
  language_id: number;
  language_code: string;
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
    const textCount = await getTextCount();
    if (textCount > 0) {
      console.log(
        "Offline mode with existing data. Database considered initialized."
      );
      Alert.alert(
        'Offline-Modus',
        'Sie sind derzeit offline. Die bestehenden Inhalte werden angezeigt.',
        [{ text: 'OK' }]
      );
      return; // Data exists, so we consider the DB initialized
    }

    console.warn(
      "No internet connection and no local data available. Running in offline mode."
    );
    Alert.alert(
      'Keine Verbindung',
      'Sie sind offline und es sind keine Daten verfügbar. Bitte stellen Sie eine Internetverbindung her.',
      [{ text: 'OK' }]
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
          'Daten geladen',
          'Alle Inhalte wurden erfolgreich synchronisiert.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error(
        "Error during version check and data synchronization:",
        error
      );
      Alert.alert(
        'Fehler',
        error.message || 'Beim Aktualisieren der Inhalte ist ein Fehler aufgetreten.',
        [{ text: 'OK' }]
      );
    }
  };

  await checkVersion();
  setupSubscriptions();
};

/**
 * Create all necessary tables in SQLite
 */
export const createTables = async () => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS categories (
        category_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      );
      
      CREATE TABLE IF NOT EXISTS languages (
        language_id INTEGER PRIMARY KEY,
        language_code TEXT NOT NULL,
        language_name TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS paypal (
        id INTEGER PRIMARY KEY,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        payPay_Link TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS texts (
        text_id INTEGER PRIMARY KEY,
        category_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_original BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS texttranslations (
        translation_id INTEGER PRIMARY KEY,
        text_id INTEGER NOT NULL,
        language_id INTEGER NOT NULL,
        header TEXT NOT NULL,
        body TEXT NOT NULL,
        translated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (text_id) REFERENCES texts(text_id) ON DELETE CASCADE,
        FOREIGN KEY (language_id) REFERENCES languages(language_id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_id INTEGER NOT NULL UNIQUE,
        added_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (text_id) REFERENCES texts(text_id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS version (
        id INTEGER PRIMARY KEY,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        version TEXT NOT NULL
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
 * Fetch and sync all data from Supabase to SQLite
 */
const fetchAndSyncAllData = async () => {
  try {
    await fetchAndSyncCategories();
    await fetchAndSyncLanguages();
    await fetchAndSyncTexts();
    await fetchAndSyncTextTranslations();
    await fetchPayPalLink();
    console.log("All data synced successfully");
  } catch (error) {
    console.error("Error syncing data:", error);
    Alert.alert(
      'Synchronisierungsfehler',
      'Die Daten konnten nicht synchronisiert werden. Bitte versuchen Sie es später erneut.',
      [{ text: 'OK' }]
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
        (category_id, name, description)
        VALUES (?, ?, ?);
      `);

      try {
        for (const category of categories) {
          await statement.executeAsync([
            category.category_id,
            category.name,
            category.description || null,
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

    const db = await SQLite.openDatabaseAsync("content-database.db");

    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO languages
        (language_id, language_code, language_name)
        VALUES (?, ?, ?);
      `);

      try {
        for (const language of languages) {
          await statement.executeAsync([
            language.language_id,
            language.language_code,
            language.language_name,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });

    console.log("Languages successfully synced to SQLite.");
  } catch (error) {
    console.error("Error in fetchAndSyncLanguages:", error);
    throw error;
  }
};

const fetchAndSyncTexts = async () => {
  try {
    const { data: texts, error } = await supabase.from("texts").select("*");

    if (error) {
      console.error("Error fetching texts:", error);
      return;
    }

    if (!texts || texts.length === 0) {
      console.log("No texts found in Supabase.");
      return;
    }

    const db = await SQLite.openDatabaseAsync("content-database.db");

    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO texts
        (text_id, category_id, created_at, is_original)
        VALUES (?, ?, ?, ?);
      `);

      try {
        for (const text of texts) {
          await statement.executeAsync([
            text.text_id,
            text.category_id,
            text.created_at,
            text.is_original ? 1 : 0,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });

    console.log("Texts successfully synced to SQLite.");
  } catch (error) {
    console.error("Error in fetchAndSyncTexts:", error);
    throw error;
  }
};

const fetchAndSyncTextTranslations = async () => {
  try {
    const { data: translations, error } = await supabase
      .from("texttranslations")
      .select("*");

    if (error) {
      console.error("Error fetching text translations:", error);
      return;
    }

    if (!translations || translations.length === 0) {
      console.log("No text translations found in Supabase.");
      return;
    }

    const db = await SQLite.openDatabaseAsync("content-database.db");

    await db.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO texttranslations
        (translation_id, text_id, language_id, header, body, translated_at)
        VALUES (?, ?, ?, ?, ?, ?);
      `);

      try {
        for (const translation of translations) {
          await statement.executeAsync([
            translation.translation_id,
            translation.text_id,
            translation.language_id,
            translation.header,
            translation.body,
            translation.translated_at,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });

    console.log("Text translations successfully synced to SQLite.");
  } catch (error) {
    console.error("Error in fetchAndSyncTextTranslations:", error);
    throw error;
  }
};

const fetchPayPalLink = async () => {
  try {
    const { data, error } = await supabase
      .from("payPal")
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
          router.replace("/(tabs)/home/");
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
    .channel("payPal")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "payPal" },
      async (payload) => {
        try {
          console.log("PayPal change received!", payload);
          await fetchPayPalLink();
          router.replace("/(tabs)/home/");
          Alert.alert(
            'Inhalte aktualisiert',
            'Neue Inhalte sind jetzt verfügbar.',
            [{ text: 'OK' }]
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
 * Get the number of texts in the local database
 */
export const getTextCount = async (): Promise<number> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM texts;"
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error("Error getting text count:", error);
    return 0;
  }
};

/**
 * Favorites management functions
 */
export const addTextToFavorites = async (textId: number): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    await db.runAsync("INSERT OR IGNORE INTO favorites (text_id) VALUES (?);", [
      textId,
    ]);
    console.log(`Text ${textId} added to favorites.`);
    Alert.alert(
      "Favoriten",
      "Text zu Favoriten hinzugefügt.",
      [{ text: "OK" }]
    );
  } catch (error) {
    console.error("Error adding to favorites:", error);
    Alert.alert(
      "Fehler",
      "Text konnte nicht zu Favoriten hinzugefügt werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const removeTextFromFavorites = async (
  textId: number
): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    await db.runAsync("DELETE FROM favorites WHERE text_id = ?;", [textId]);
    console.log(`Text ${textId} removed from favorites.`);
    Alert.alert(
      "Favoriten",
      "Text aus Favoriten entfernt.",
      [{ text: "OK" }]
    );
  } catch (error) {
    console.error("Error removing from favorites:", error);
    Alert.alert(
      "Fehler",
      "Text konnte nicht aus Favoriten entfernt werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const isTextInFavorites = async (textId: number): Promise<boolean> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM favorites WHERE text_id = ?;",
      [textId]
    );
    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    throw error;
  }
};

export const getFavoriteTexts = async (
  languageId: number
): Promise<TextWithTranslation[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const rows = await db.getAllAsync<TextWithTranslation>(
      `SELECT 
        t.text_id, t.category_id, t.created_at, t.is_original,
        tt.header, tt.body, tt.translated_at,
        l.language_name, l.language_code,
        c.name as category_name
      FROM texts t
      INNER JOIN favorites f ON t.text_id = f.text_id
      INNER JOIN texttranslations tt ON t.text_id = tt.text_id
      INNER JOIN languages l ON tt.language_id = l.language_id
      INNER JOIN categories c ON t.category_id = c.category_id
      WHERE tt.language_id = ?
      ORDER BY f.added_at DESC;`,
      [languageId]
    );
    return rows;
  } catch (error) {
    console.error("Error retrieving favorite texts:", error);
    Alert.alert(
      "Fehler",
      "Favoriten konnten nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

/**
 * Content retrieval functions
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

export const getLanguages = async (): Promise<Language[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const rows = await db.getAllAsync<Language>("SELECT * FROM languages;");
    return rows;
  } catch (error) {
    console.error("Error fetching languages:", error);
    Alert.alert(
      "Fehler",
      "Sprachen konnten nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const getTextsForCategory = async (
  categoryId: number,
  languageId: number
): Promise<TextWithTranslation[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const rows = await db.getAllAsync<TextWithTranslation>(
      `SELECT 
        t.text_id, t.category_id, t.created_at, t.is_original,
        tt.header, tt.body, tt.translated_at,
        l.language_name, l.language_code,
        c.name as category_name
      FROM texts t
      INNER JOIN texttranslations tt ON t.text_id = tt.text_id
      INNER JOIN languages l ON tt.language_id = l.language_id
      INNER JOIN categories c ON t.category_id = c.category_id
      WHERE t.category_id = ? AND tt.language_id = ?;`,
      [categoryId, languageId]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching texts for category:", error);
    Alert.alert(
      "Fehler",
      "Texte für diese Kategorie konnten nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const getText = async (
  textId: number,
  languageId: number
): Promise<TextWithTranslation | null> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const row = await db.getFirstAsync<TextWithTranslation>(
      `SELECT 
        t.text_id, t.category_id, t.created_at, t.is_original,
        tt.header, tt.body, tt.translated_at,
        l.language_name, l.language_code,
        c.name as category_name
      FROM texts t
      INNER JOIN texttranslations tt ON t.text_id = tt.text_id
      INNER JOIN languages l ON tt.language_id = l.language_id
      INNER JOIN categories c ON t.category_id = c.category_id
      WHERE t.text_id = ? AND tt.language_id = ?;`,
      [textId, languageId]
    );
    return row;
  } catch (error) {
    console.error("Error fetching text:", error);
    Alert.alert(
      "Fehler",
      "Text konnte nicht geladen werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const searchTexts = async (
  searchTerm: string,
  languageId: number
): Promise<SearchResult[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const rows = await db.getAllAsync<SearchResult>(
      `SELECT 
        t.text_id, t.category_id,
        tt.header,
        l.language_id, l.language_code
      FROM texts t
      INNER JOIN texttranslations tt ON t.text_id = tt.text_id
      INNER JOIN languages l ON tt.language_id = l.language_id
      WHERE tt.language_id = ? AND (tt.header LIKE ? OR tt.body LIKE ?);`,
      [languageId, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    
    if (rows.length === 0) {
      Alert.alert(
        "Suche",
        "Keine Ergebnisse gefunden.",
        [{ text: "OK" }]
      );
    }
    
    return rows;
  } catch (error) {
    console.error("Error searching texts:", error);
    Alert.alert(
      "Fehler",
      "Suche konnte nicht durchgeführt werden.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

export const getLatestTexts = async (
  limit: number = 10,
  languageId: number
): Promise<TextWithTranslation[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("content-database.db");
    const rows = await db.getAllAsync<TextWithTranslation>(
      `SELECT 
        t.text_id, t.category_id, t.created_at, t.is_original,
        tt.header, tt.body, tt.translated_at,
        l.language_name, l.language_code,
        c.name as category_name
      FROM texts t
      INNER JOIN texttranslations tt ON t.text_id = tt.text_id
      INNER JOIN languages l ON tt.language_id = l.language_id
      INNER JOIN categories c ON t.category_id = c.category_id
      WHERE tt.language_id = ?
      ORDER BY datetime(t.created_at) DESC
      LIMIT ?;`,
      [languageId, limit]
    );
    return rows;
  } catch (error) {
    console.error("Error retrieving latest texts:", error);
    Alert.alert(
      "Fehler",
      "Aktuelle Texte konnten nicht geladen werden.",
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