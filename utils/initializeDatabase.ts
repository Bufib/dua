import * as SQLite from "expo-sqlite";
import { supabase } from "@/utils/supabase";
import Storage from "expo-sqlite/kv-store";
import { router } from "expo-router";
import { questionsDatabaseUpate } from "@/constants/messages";
import { QuestionType, SearchResults } from "./types";

export const initializeDatabase = async () => {
  // Check if version in Storage is up to date
  const checkVersion = async () => {
    const versionFromStorage = await Storage.getItem("version");
    const versionFromSupabase = await fetchVersionFromSupabase();

    // Check for version mismatch
    if (versionFromStorage !== versionFromSupabase) {
      await fetchQuestionsFromSupabase();
      await fetchPayPalLink();
      await Storage.setItemSync("version", versionFromSupabase);
    }
  };
  await checkVersion();
  setupSubscriptions();
};

const fetchVersionFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from("version")
      .select("version")
      .single();

    if (error) {
      console.error(error);
      return;
    }
    return data.version;
  } catch (error) {
    console.error(error);
  }
};

const fetchQuestionsFromSupabase = async () => {
  try {
    // Fetch questions from Supabase
    const { data: questions, error } = await supabase
      .from("question")
      .select("*");

    if (error) {
      console.error("Error fetching questions from Supabase:", error.message);
      return;
    }

    if (!questions || questions.length === 0) {
      console.log("No questions found in Supabase.");
      return;
    }

    // Open SQLite database
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");

    // Create the questions table if it doesn't exist
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS question (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        question TEXT UNIQUE NOT NULL,
        answer TEXT,
        answer_sistani TEXT,
        answer_khamenei TEXT,
        category_name TEXT REFERENCES category(category_name),
        subcategory_name TEXT REFERENCES subcategory(subcategory_name),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the favorites table
    await createFavoritesTable();

    // Use an exclusive transaction for batch insertion
    // !! Maybe change -> withTransactionAsync instead of withExclusiveTransactionAsync
    await db.withExclusiveTransactionAsync(async (txn) => {
      // Prepare the statement inside the transaction
      const statement = await txn.prepareAsync(`
        INSERT OR REPLACE INTO question 
        (id, title, question, answer, answer_sistani, answer_khamenei, category_name, subcategory_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      try {
        // Execute the prepared statement for each question
        for (const question of questions) {
          await statement.executeAsync([
            question.id,
            question.title,
            question.question,
            question.answer || null,
            question.answer_sistani || null,
            question.answer_khamenei || null,
            question.category_name,
            question.subcategory_name,
            question.created_at,
          ]);
        }
      } finally {
        // Finalize the prepared statement
        await statement.finalizeAsync();
      }
    });

    console.log("Questions successfully synced to SQLite.");
  } catch (error) {
    console.error("Unexpected error in fetchQuestionsFromSupabase:", error);
  }
};
const fetchPayPalLink = async () => {
  try {
    // Fetch PayPal data from Supabase
    const { data, error } = await supabase
      .from("paypal")
      .select("link")
      .single();

    if (error) {
      console.error("Error fetching PayPal link from Supabase:", error.message);
      return;
    }
    if (data?.link) {
      Storage.setItemSync("paypal", data.link);
    } else {
      console.warn("No PayPal link found in Supabase.");
    }
  } catch (error) {
    console.error("Unexpected error fetching PayPal link:", error);
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
          console.log("Change received!", payload);
          await initializeDatabase(); // Re-fetch data if version changes
          router.replace("/(tabs)/home/");
          questionsDatabaseUpate();
        } catch (error) {
          console.error("Error handling Supabase subscription change:", error);
        }
      }
    )
    .subscribe();

  // Subscribe to changes in the `questions` table
  supabase
    .channel("question")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "question" },
      async (payload) => {
        try {
          // Update SQLite database based on the operation
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const change = payload.new as QuestionType;
            await syncSingleQuestion(change);
          } else if (payload.eventType === "DELETE") {
            await deleteQuestionFromSQLite(payload.old.id);
          }
          router.replace("/(tabs)/home/");
          questionsDatabaseUpate();
        } catch (error) {
          console.error("Error handling Supabase subscription change:", error);
        }
      }
    )
    .subscribe();

  supabase
    .channel("paypal")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "paypal" },
      async (payload) => {
        try {
          console.log("Change received!", payload);
          await fetchPayPalLink(); // Re-fetch data if version changes
          router.replace("/(tabs)/home/");
          questionsDatabaseUpate();
        } catch (error) {
          console.error("Error handling Supabase subscription change:", error);
        }
      }
    )
    .subscribe();
};

export const getQuestionCount = async (): Promise<number> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM question;`
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error("Error getting question count:", error);
    return 0;
  }
};

const syncSingleQuestion = async (question: QuestionType) => {
  const db = await SQLite.openDatabaseAsync("islam-fragen.db");
  await db.runAsync(
    `
    INSERT OR REPLACE INTO question
    (id, title, question, answer, answer_sistani, answer_khamenei, category_name, subcategory_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      question.id,
      question.title,
      question.question,
      question.answer,
      question.answer_sistani,
      question.answer_khamenei,
      question.category_name,
      question.subcategory_name,
      question.created_at,
    ]
  );
  console.log("Question synced:", question.id);
};

const createFavoritesTable = async () => {
  const db = await SQLite.openDatabaseAsync("islam-fragen.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL UNIQUE,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
    );
  `);
};

export const addQuestionToFavorite = async (
  questionId: number
): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");
    await db.runAsync(
      `
      INSERT OR IGNORE INTO favorites (question_id) VALUES (?);
      `,
      [questionId]
    );
    console.log(`Question ${questionId} added to favorites.`);
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

export const removeQuestionFromFavorite = async (
  questionId: number
): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");
    await db.runAsync(
      `
      DELETE FROM favorites WHERE question_id = ?;
      `,
      [questionId]
    );
    console.log(`Question ${questionId} removed from favorites.`);
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

export const isQuestionInFavorite = async (
  questionId: number
): Promise<boolean> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");
    const result = await db.getFirstAsync<{ count: number }>(
      `
      SELECT COUNT(*) as count FROM favorites WHERE question_id = ?;
      `,
      [questionId]
    );
    if (result && result.count !== undefined) {
      return result.count > 0;
    }
    return false;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    throw error;
  }
};

export const getFavoriteQuestions = async (): Promise<QuestionType[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");
    const rows = await db.getAllAsync<QuestionType>(
      `
      SELECT q.*
      FROM question q
      INNER JOIN favorites f ON q.id = f.question_id
      ORDER BY f.added_at DESC;
      `
    );
    return rows;
  } catch (error) {
    console.error("Error retrieving favorite questions:", error);
    throw error;
  }
};

const deleteQuestionFromSQLite = async (questionId: number) => {
  const db = await SQLite.openDatabaseAsync("islam-fragen.db");
  await db.runAsync(`DELETE FROM question WHERE id = ?;`, [questionId]);
  console.log("Question deleted:", questionId);
};

// get the subcategories from the SQLite database
export const getSubcategoriesForCategory = async (
  categoryName: string
): Promise<string[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");
    const rows = await db.getAllAsync<{ subcategory_name: string }>(
      "SELECT DISTINCT subcategory_name FROM question WHERE category_name = ?;",
      [categoryName]
    );
    // Only unique subcategories are returned because of "DISTINCT"
    return rows.map((row) => row.subcategory_name);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};

export const getQuestionsForSubcategory = async (
  categoryName: string,
  subcategoryName: string
): Promise<QuestionType[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");

    // Query to fetch questions for the given subcategory
    const rows = await db.getAllAsync<QuestionType>(
      "SELECT * FROM question WHERE category_name = ? AND subcategory_name = ?;",
      [categoryName, subcategoryName]
    );

    return rows; // Return the fetched rows
  } catch (error) {
    console.error("Error fetching questions for subcategory:", error);
    throw error;
  }
};

export const getQuestion = async (
  categoryName: string,
  subcategoryName: string,
  questionId: number
): Promise<QuestionType> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");

    // Query to fetch questions for the given subcategory
    const rows = await db.getAllAsync<QuestionType>(
      "SELECT * FROM question WHERE category_name = ? AND subcategory_name = ? AND id = ? LIMIT 1;",
      [categoryName, subcategoryName, questionId]
    );
    return rows[0];
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

export const getQuestionInternalURL = async (
  questionTitle: string
): Promise<QuestionType> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");

    // Query to fetch questions for the given subcategory
    const rows = await db.getAllAsync<QuestionType>(
      "SELECT * FROM question WHERE title = ?;",
      [questionTitle]
    );
    return rows[0];
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

export const searchQuestions = async (
  searchTerm: string
): Promise<SearchResults[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");

    // Perform a search query using the LIKE operator
    const rows = await db.getAllAsync<{
      id: number;
      category_name: string;
      subcategory_name: string;
      question: string;
      title: string;
    }>(
      `
      SELECT id, category_name, subcategory_name, question, title
      FROM question
      WHERE question LIKE ? OR title LIKE ?;
      `,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );

    return rows;
  } catch (error) {
    console.error("Error searching questions:", error);
    throw error;
  }
};

export const getLatestQuestions = async (
  limit: number = 10
): Promise<QuestionType[]> => {
  try {
    const db = await SQLite.openDatabaseAsync("islam-fragen.db");

    const rows = await db.getAllAsync<QuestionType>(
      `
      SELECT * FROM question 
      ORDER BY datetime(created_at) ASC 
      LIMIT ?;
      `,
      [limit]
    );

    return rows;
  } catch (error) {
    console.error("Error retrieving latest questions:", error);
    throw error;
  }
};
