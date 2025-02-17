// import { useEffect, useState } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/utils/supabase";
// import { userQuestionsNewAnswerForQuestions } from "@/constants/messages";
// import { router } from "expo-router";
// import { askQuestionQuestionSendSuccess } from "@/constants/messages";

// export type QuestionFromUser = {
//   id: string;
//   user_id: string;
//   question: string;
//   answer?: string;
//   status: "Beantwortet" | "Beantwortung steht noch aus" | "Abgelehnt";
//   marja: string;
//   title: string;
//   user_gender: string;
//   user_age: string;
//   created_at: string;
// };

// export type AskQuestionFormData = {
//   title: string;
//   question: string;
//   marja: string;
// };

// export const useFetchUserQuestions = () => {
//   const queryClient = useQueryClient();
//   const [userId, setUserId] = useState<string | null>(null);
//   const [isInitializing, setIsInitializing] = useState(true);
//   const [hasUpdate, setHasUpdate] = useState(false); // Tracks if new data is available

//   //
//   // 1. Fetch the current user once, and set up an auth state listener
//   //
//   useEffect(() => {
//     const getCurrentUser = async () => {
//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();

//         console.log("Supabase user fetched:", user?.id);
//         setUserId(user?.id ?? null);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//         setUserId(null);
//       } finally {
//         setIsInitializing(false);
//       }
//     };

//     getCurrentUser();

//     // Listen for sign-in / sign-out events
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event) => {
//       console.log("Auth event triggered:", event);
//       if (event === "SIGNED_OUT") {
//         setUserId(null);
//         queryClient.removeQueries({ queryKey: ["questionsFromUser"] });
//       } else {
//         getCurrentUser();
//       }
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [queryClient]);

//   //
//   // 2. Set up real-time subscription to invalidate the query on any DB changes
//   //
//   useEffect(() => {
//     if (!userId) return;

//     const channel = supabase
//       .channel(`user_questions_${userId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "user_question",
//           filter: `user_id=eq.${userId}`,
//         },
//         () => {
//           setHasUpdate(true);
//           userQuestionsNewAnswerForQuestions();
//           handleRefresh();
//         }
//       )
//       .on(
//         "postgres_changes",
//         {
//           event: "UPDATE",
//           schema: "public",
//           table: "user_question",
//           filter: `user_id=eq.${userId}`,
//         },
//         () => {
//           setHasUpdate(true);
//           setHasUpdate(true);
//           userQuestionsNewAnswerForQuestions();
//           handleRefresh();
//         }
//       )
//       .on(
//         "postgres_changes",
//         {
//           event: "DELETE",
//           schema: "public",
//           table: "user_question",
//           filter: `user_id=eq.${userId}`,
//         },
//         () => {
//           setHasUpdate(true);
//           userQuestionsNewAnswerForQuestions();
//           handleRefresh();
//         }
//       )
//       .subscribe();

//     return () => {
//       channel.unsubscribe();
//     };
//   }, [queryClient, userId]);

//   //
//   // 3. Fetch all questions using a simple useQuery (no pagination)
//   //
//   const queryResult = useQuery({
//     queryKey: ["questionsFromUser", userId],
//     queryFn: async () => {
//       if (!userId) throw new Error("Not authenticated");

//       const { data, error } = await supabase
//         .from("user_question")
//         .select("*")
//         .eq("user_id", userId)
//         .order("update_answered_at", { ascending: false, nullsFirst: false })
//         .order("created_at", { ascending: true });

//       if (error) {
//         throw new Error(error.message);
//       }

//       return data ?? [];
//     },
//     enabled: !isInitializing && !!userId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     gcTime: 1000 * 60 * 30, // 30 minutes
//     retry: 2,
//     refetchOnWindowFocus: false,
//   });

//   const handleRefresh = async () => {
//     await queryClient.invalidateQueries({ queryKey: ["questionsFromUser"] });
//     setHasUpdate(false); // Reset the flag after refreshing
//   };

//   return {
//     ...queryResult,
//     isInitializing,
//     hasUpdate,
//     handleRefresh,
//   };
// };

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { useSupabaseRealtime } from "@/components/SupabaseRealtimeProvider";

export type AskQuestionFormData = {
  title: string;
  question: string;
  marja: string;
};

export const useFetchUserQuestions = () => {
  const queryClient = useQueryClient();
  const { userId } = useSupabaseRealtime(); // Get userId from context
  const [hasUpdate, setHasUpdate] = useState(false);

  /**
   * Fetch all questions using useQuery (no pagination)
   */
  const queryResult = useQuery({
    queryKey: ["questionsFromUser", userId],
    queryFn: async () => {
      console.log("Current userId:", userId);
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_question")
        .select("*")
        .eq("user_id", userId)
        .order("update_answered_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: true });
        console.log("Supabase response:", { data, error });
      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["questionsFromUser", userId],
    });
    setHasUpdate(false);
  };

  return {
    ...queryResult,
    isInitializing: false, // No longer needed as auth state is managed by context
    hasUpdate,
    handleRefresh,
  };
};
