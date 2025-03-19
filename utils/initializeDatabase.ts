import * as SQLite from "expo-sqlite";
import { supabase } from "@/utils/supabase";
import Storage from "expo-sqlite/kv-store";
import { router } from "expo-router";
import debounce from "lodash/debounce";
import {
  checkInternetConnection,
  setupConnectivityListener,
} from "./checkNetwork";
import {
  CategoryType,
  PrayerWithCategory,
  FavoritePrayer,
  PrayerTranslation,
  PrayerWithTranslations,
} from "./types";
import Toast from "react-native-toast-message";
import i18n from "./i18n";
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
      Toast.show({
        type: "error",
        text1: i18n.t("toast.offlineMode"),
        text2: i18n.t("toast.offlineModeMessage"),
      });

      return;
    }
    console.warn(
      "No internet connection and no local data available. Running in offline mode."
    );
    Toast.show({
      type: "error",
      text1: i18n.t("toast.noConnection"),
      text2: i18n.t("toast.noConnectionMessage"),
    });

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
        Toast.show({
          type: "success",
          text1: i18n.t("toast.contentUpdated"),
          text2: i18n.t("toast.dataLoaded"),
        });
      }
    } catch (error: any) {
      console.error(
        "Error during version check and data synchronization:",
        error
      );
      Toast.show({
        type: "error",
        text1: i18n.t("toast.error"),
        text2: i18n.t("toast.updateContentError"),
      });
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
      
      CREATE TABLE IF NOT EXISTS prayer_categories (
        prayer_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (prayer_id, category_id),
        FOREIGN KEY (prayer_id) REFERENCES prayers(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS prayers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        arabic_title TEXT,
        category_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        translated_languages TEXT NOT NULL,
        arabic_introduction TEXT,
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
    await fetchAndSyncPrayerCategories();
    await fetchAndSyncPrayers();
    await fetchAndSyncPrayerTranslations();
    await fetchAndSyncLanguages();
    await fetchPayPalLink();
    console.log("All data synced successfully");
  } catch (error) {
    console.error("Error syncing data:", error);
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.syncErrorMessage"),
    });

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

const fetchAndSyncPrayerCategories = async () => {
  const { data: prayerCategories, error } = await supabase
    .from("prayer_categories")
    .select("*");
  if (error) {
    console.error("Error fetching prayer categories:", error);
    return;
  }
  if (!prayerCategories || prayerCategories.length === 0) {
    console.log("No prayer categories found in Supabase.");
    return;
  }
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    const statement = await txn.prepareAsync(`
      INSERT OR REPLACE INTO prayer_categories
      (prayer_id, category_id)
      VALUES (?, ?);
    `);
    try {
      for (const pc of prayerCategories) {
        await statement.executeAsync([pc.prayer_id, pc.category_id]);
      }
    } finally {
      await statement.finalizeAsync();
    }
  });
  console.log("Prayer categories successfully synced to SQLite.");
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
        (id, name, arabic_title, category_id, created_at, updated_at, translated_languages, arabic_introduction, arabic_text, arabic_notes, transliteration_text, transliteration_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
            JSON.stringify(prayer.translated_languages || []),
            prayer.arabic_introduction,
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
          Toast.show({
            type: "success",
            text1: i18n.t("toast.contentUpdated"),
            text2: i18n.t("toast.newContentAvailable"),
          });
        } catch (error) {
          console.error("Error handling version change:", error);
          Toast.show({
            type: "error",
            text1: i18n.t("toast.updateError"),
            text2: i18n.t("toast.contentLoadError"),
          });
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
          Toast.show({
            type: "success",
            text1: i18n.t("toast.contentUpdated"),
            text2: i18n.t("toast.newContentAvailable"),
          });
        } catch (error) {
          console.error("Error handling PayPal change:", error);
          Toast.show({
            type: "error",
            text1: i18n.t("toast.updateError"),
            text2: i18n.t("toast.contentLoadError"),
          });
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
    Toast.show({
      type: "success",
      text1: i18n.t("favorites"),
      text2: i18n.t("toast.favoriteAdded"),
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.favoriteAddError"),
    });
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
    Toast.show({
      type: "error",
      text1: i18n.t("favorites"),
      text2: i18n.t("toast.favoriteRemoved"),
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.favoriteRemoveError"),
    });
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
  language: string
): Promise<FavoritePrayer[]> => {
  try {
    const db = await getDatabase();
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
        p.translated_languages,
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
    const rows = (await db.getAllAsync(query, [language])) as Array<
      FavoritePrayer & { translated_languages: string }
    >;
    const prayerMap = new Map<number, FavoritePrayer>();
    for (const row of rows) {
      const prayerId = row.id;
      if (!prayerMap.has(prayerId)) {
        let languagesAvailable: string[] = [];
        try {
          languagesAvailable = JSON.parse(row.translated_languages);
        } catch (e) {
          console.error("Error parsing translated_languages", e);
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
          translated_languages: languagesAvailable,
        });
      }
    }
    return Array.from(prayerMap.values());
  } catch (error) {
    console.error("Error fetching favorite prayers:", error);
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.favoritesLoadError"),
    });
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
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.categoriesLoadError"),
    });
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
      p.name,
      p.arabic_title,
      p.created_at,
      p.updated_at,
      c.title as category_title,
      pt.main_body as prayer_text,
      pt.notes as notes
    FROM prayers p
    INNER JOIN prayer_categories pc ON p.id = pc.prayer_id
    INNER JOIN categories c ON pc.category_id = c.id
    INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
    WHERE c.id IN (${placeholders}) AND pt.language_code = ?
    ORDER BY datetime(p.created_at) DESC;

    `;
    const params = [...descendantIds, language];
    const rows = await db.getAllAsync<PrayerWithCategory>(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching prayers for category:", error);
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.prayersLoadError"),
    });
    throw error;
  }
};

export const getPrayersForCategory = async (
  categoryId: number,
  language: string
): Promise<PrayerWithCategory[]> => {
  try {
    const db = await getDatabase();
    // Get descendant category ids (including the current one)
    const descendantIds = await getCategoryAndDescendantIds(categoryId, db);
    const placeholders = descendantIds.map(() => "?").join(",");
    const query = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.arabic_title,
        p.created_at,
        p.updated_at,
        c.title as category_title,
        pt.main_body as prayer_text,
        pt.notes as notes
      FROM prayers p
      INNER JOIN prayer_categories pc ON p.id = pc.prayer_id
      INNER JOIN categories c ON pc.category_id = c.id
      INNER JOIN prayer_translations pt ON pt.prayer_id = p.id
      WHERE c.id IN (${placeholders}) AND pt.language_code = ?
      ORDER BY datetime(p.created_at) DESC;
    `;
    const params = [...descendantIds, language];
    const rows = await db.getAllAsync<PrayerWithCategory>(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching prayers for category:", error);
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
        p.arabic_introduction,
        p.arabic_notes,
        p.transliteration_text,
        p.transliteration_notes,
        p.created_at,
        p.updated_at,
        p.translated_languages,
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
          typeof row.translated_languages === "string"
            ? JSON.parse(row.translated_languages)
            : row.translated_languages;
        console.log("Parsed translated_languages:", languages);
        return { ...row, translated_languages: languages };
      } catch (e) {
        console.error("Error parsing translated_languages:", e);
        return row;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching prayer:", error);
    throw error;
  }
};
export const getRandomPrayerWithCategory = async (
  language: string
): Promise<PrayerWithCategory | null> => {
  try {
    const db = await getDatabase();
    // Query a random prayer ID from the prayers table.
    const randomRow = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM prayers ORDER BY RANDOM() LIMIT 1;"
    );
    if (!randomRow || !randomRow.id) {
      console.log("No prayer found in the database.");
      return null;
    }
    // Use the existing getPrayer function to retrieve the full prayer details with category.
    return await getPrayer(randomRow.id, language);
  } catch (error) {
    console.error("Error fetching random prayer with category:", error);
    throw error;
  }
};

export const getPrayerWithTranslations = async (
  prayerId: number
): Promise<PrayerWithTranslations | null> => {
  try {
    const db = await getDatabase();

    // First, fetch the prayer with its basic details and category title.
    const prayerQuery = `
      SELECT 
        p.id,
        p.category_id,
        p.name,
        p.arabic_title,
        p.arabic_text,
        p.arabic_introduction,
        p.arabic_notes,
        p.transliteration_text,
        p.transliteration_notes,
        p.created_at,
        p.updated_at,
        p.translated_languages,
        c.title as category_title
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?;
    `;
    const prayerRow = await db.getFirstAsync<PrayerWithCategory>(prayerQuery, [
      prayerId,
    ]);

    if (!prayerRow) return null;

    // Parse translated_languages if it's stored as a JSON string.
    try {
      prayerRow.translated_languages =
        typeof prayerRow.translated_languages === "string"
          ? JSON.parse(prayerRow.translated_languages)
          : prayerRow.translated_languages;
    } catch (e) {
      console.error("Error parsing translated_languages:", e);
    }

    // Next, get all translations for the prayer.
    const translationsQuery = `
      SELECT 
        id,
        prayer_id,
        language_code,
        introduction,
        main_body,
        notes,
        source,
        created_at,
        updated_at
      FROM prayer_translations
      WHERE prayer_id = ?;
    `;
    const translations = await db.getAllAsync<PrayerTranslation>(
      translationsQuery,
      [prayerId]
    );

    // Combine and return the prayer data with its translations.
    return { ...prayerRow, translations };
  } catch (error) {
    console.error("Error fetching prayer with translations:", error);
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
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.searchError"),
    });
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
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.latestPrayersError"),
    });
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
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.paypalLinkError"),
    });
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
    Toast.show({
      type: "error",
      text1: i18n.t("toast.error"),
      text2: i18n.t("toast.languagesLoadError"),
    });
    return [];
  }
};
