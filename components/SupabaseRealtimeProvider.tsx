// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { supabase } from "@/utils/supabase";
// import { useQueryClient } from "@tanstack/react-query";
// import { userQuestionsNewAnswerForQuestions } from "@/constants/messages";
// import { useAuthStore } from "@/stores/authStore";

// type SupabaseRealtimeContextType = {
//   userId: string | null;
//   hasNewNewsData: boolean;
//   clearNewNewsFlag: () => void;
// };

// const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextType>({
//   userId: null,
//   hasNewNewsData: false,
//   clearNewNewsFlag: () => {},
// });

// export const SupabaseRealtimeProvider = ({
//   children,
// }: {
//   children: ReactNode;
// }) => {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [hasNewNewsData, setHasNewNewsData] = useState(false);
//   const queryClient = useQueryClient();
//   const {isAdmin} = useAuthStore();
//   const clearNewNewsFlag = () => setHasNewNewsData(false);

//   /**
//    * Auth state management
//    */
//   useEffect(() => {
//     const getCurrentUser = async () => {
//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();
//         setUserId(user?.id ?? null);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//         setUserId(null);
//       }
//     };

//     getCurrentUser();

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event) => {
//       console.log("Auth event triggered:", event);
//       if (event === "SIGNED_OUT") {
//         setUserId(null);
//         queryClient.removeQueries({ queryKey: ["questionsFromUser"] });
//       } else {
//         await getCurrentUser();
//       }
//     });

//     return () => {
//       subscription?.unsubscribe();
//     };
//   }, [queryClient]);

//   /**
//    * User questions subscription
//    */
//   useEffect(() => {
//     if (!userId) return;

//     const userQuestionsChannel = supabase
//       .channel(`user_questions_${userId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
//           schema: "public",
//           table: "user_question",
//           filter: `user_id=eq.${userId}`,
//         },
//         async (payload) => {
//           console.log("user_question event:", payload.eventType, payload);
//           userQuestionsNewAnswerForQuestions();
//           await queryClient.invalidateQueries({
//             queryKey: ["questionsFromUser", userId],
//             refetchType: "all",
//           });
//         }
//       )
//       .subscribe();

//     return () => {
//       userQuestionsChannel.unsubscribe();
//     };
//   }, [userId, queryClient]);

//   /**
//    * News subscription
//    */

//   useEffect(() => {
//     const newsChannel = supabase
//       .channel("news_changes")
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "news",
//         },
//         async (payload) => {
//           console.log("news event:", payload.eventType, payload);
//           if (!isAdmin) {
//             setHasNewNewsData(true); // Only show update button for non-admin users
//           } else {
//             await queryClient.invalidateQueries({
//               queryKey: ["news"],
//               refetchType: "all",

//             });
//             console.log("here")
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       newsChannel.unsubscribe();
//     };
//   }, [queryClient, isAdmin]);

//   return (
//     <SupabaseRealtimeContext.Provider
//       value={{
//         userId,
//         hasNewNewsData,
//         clearNewNewsFlag,
//       }}
//     >
//       {children}
//     </SupabaseRealtimeContext.Provider>
//   );
// };

// export const useSupabaseRealtime = () => useContext(SupabaseRealtimeContext);

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { userQuestionsNewAnswerForQuestions } from "@/constants/messages";
import { useAuthStore } from "@/stores/authStore";
import Toast from "react-native-toast-message";

type SupabaseRealtimeContextType = {
  userId: string | null;
  hasNewNewsData: boolean;
  clearNewNewsFlag: () => void;
};

const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextType>({
  userId: null,
  hasNewNewsData: false,
  clearNewNewsFlag: () => {},
});

export const SupabaseRealtimeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [hasNewNewsData, setHasNewNewsData] = useState(false);
  const queryClient = useQueryClient();
  const { isAdmin } = useAuthStore();
  const clearNewNewsFlag = () => setHasNewNewsData(false);

  /**
   * Auth state management
   */
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserId(null);
      }
    };

    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      console.log("Auth event triggered:", event);
      if (event === "SIGNED_OUT") {
        setUserId(null);
        queryClient.removeQueries({ queryKey: ["questionsFromUser"] });
      } else {
        await getCurrentUser();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  /**
   * User questions subscription
   */
  useEffect(() => {
    if (!userId) return;

    const userQuestionsChannel = supabase
      .channel(`user_questions_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_question",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("user_question event:", payload.eventType, payload);
          if (payload.eventType === "INSERT") {
            Toast.show({
              type: "success",
              text1: "Deine Frage wurde erfolgreich abgeschickt!",
            });
          } else {
            userQuestionsNewAnswerForQuestions();
          }
          await queryClient.invalidateQueries({
            queryKey: ["questionsFromUser", userId],
            refetchType: "all",
          });
        }
      )
      .subscribe();

    return () => {
      userQuestionsChannel.unsubscribe();
    };
  }, [userId, queryClient]);

  useEffect(() => {
    if (!userId) return; // ✅ Don't subscribe if the user isn't logged in

    const notificationChannel = supabase
      .channel("pending_notification_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pending_notification",
        },
        async (payload) => {
          console.log("New notification added:", payload);

          // 🚀 Call the Edge Function when a new notification is inserted
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            console.error("No active session found");
            return;
          }

          const response = await fetch(
            "https://tdjuwrsspauybgfywlfr.supabase.co/functions/v1/sendPushNotifications",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (response.ok) {
            console.log("Edge function executed successfully!");
          } else {
            console.error(
              "Error calling Edge Function:",
              await response.text()
            );
          }
        }
      )
      .subscribe();

    return () => {
      notificationChannel.unsubscribe();
    };
  }, [userId]);

  /**
   * News subscription
   */

  useEffect(() => {
    const newsChannel = supabase
      .channel("news_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
        },
        async (payload) => {
          console.log("news event:", payload.eventType, payload);
          if (!isAdmin) {
            setHasNewNewsData(true); // Only show update button for non-admin users
          } else {
            await queryClient.invalidateQueries({
              queryKey: ["news"],
              refetchType: "all",
            });
            console.log("here");
          }
        }
      )
      .subscribe();

    return () => {
      newsChannel.unsubscribe();
    };
  }, [queryClient, isAdmin]);

  return (
    <SupabaseRealtimeContext.Provider
      value={{
        userId,
        hasNewNewsData,
        clearNewNewsFlag,
      }}
    >
      {children}
    </SupabaseRealtimeContext.Provider>
  );
};

export const useSupabaseRealtime = () => useContext(SupabaseRealtimeContext);
