
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

  const isAdmin = useAuthStore((state) => state.isAdmin);
  const setSession = useAuthStore.getState().setSession;
  const clearNewNewsFlag = () => setHasNewNewsData(false);

  /**
   * Auth state management
   */
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await setSession(session, true);
          setUserId(session.user.id);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserId(null);
      }
    };

    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUserId(null);
        queryClient.removeQueries({ queryKey: ["questionsFromUser"] });
      } else if (event === "SIGNED_IN" && session) {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // useEffect(() => {
  //   if (!userId) return; // ✅ Don't subscribe if the user isn't logged in

  //   const notificationChannel = supabase
  //     .channel("pending_notification_changes")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "INSERT",
  //         schema: "public",
  //         table: "pending_notification",
  //       },
  //       async (payload) => {
  //         console.log("New notification added:", payload);

  //         // 🚀 Call the Edge Function when a new notification is inserted
  //         const {
  //           data: { session },
  //         } = await supabase.auth.getSession();

  //         if (!session) {
  //           console.error("No active session found");
  //           return;
  //         }

  //         const response = await fetch(
  //           "https://tdjuwrsspauybgfywlfr.supabase.co/functions/v1/sendPushNotifications",
  //           {
  //             method: "POST",
  //             headers: {
  //               Authorization: `Bearer ${session.access_token}`,
  //             },
  //           }
  //         );

  //         if (response.ok) {
  //           console.log("Edge function executed successfully!");
  //         } else {
  //           console.error(
  //             "Error calling Edge Function:",
  //             await response.text()
  //           );
  //         }
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     notificationChannel.unsubscribe();
  //   };
  // }, [userId]);

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

          // Always delete immediately!
          if (payload.eventType === "DELETE") {
            await queryClient.invalidateQueries({
              queryKey: ["news"],
              refetchType: "all",
            });
          }

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
