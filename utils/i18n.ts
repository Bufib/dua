// // src/i18n/index.ts
// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";
// import { Resource } from "i18next";

// // Types for our translations
// interface DayNamesType {
//   short: string[];
//   full: string[];
// }

// // Translations resources
// const resources: Resource = {
//   // German translation
//   DE: {
//     translation: {
//       // Core app translations
//       welcome: "As-salamu alaykum",
//       selectLanguage: "Wähle deine bevorzugte Sprache",
//       german: "Deutsch",
//       arabic: "Arabisch",
//       english: "Englisch",
//       continue: "Fortfahren",
//       settings: "Einstellungen",
//       language: "Sprache",
//       theme: "Thema",
//       about: "Über",
//       home: "Start",
//       prayers: "Gebete",
//       homeSubtitle: "Finde Frieden und Verbindung durch Gebet",

//       // Prayer categories
//       dua: "Dua",
//       ziyarat: "Ziyarat",
//       salat: "Salat",
//       munajat: "Munajat",
//       tasbih: "tasbih",
//       special: "Speziell",
//       names: "Asma-ul-Husna",
//       // Home screen - Today's prayer
//       randomPrayer: "Empfehlung",
//       readMore: "Vollständig lesen",
//       categories: "Kategorien",

//       // Weekly calendar
//       weeklyToDo: "Plan für die Woche",
//       addWeekly: "Hinzufügen",
//       addForDay: "Hinzufügen für",
//       enterPrayer: "Gib das Gebet ein...",
//       add: "Hinzufügen",
//       cancel: "Abbrechen",
//       noPrayersForDay: "Keine Gebete für diesen Tag",
//       unDo: "Neustart",

//       // Delete confirmation
//       confirmDelete: "Löschen bestätigen",
//       deleteQuestion: "Möchtest du dieses Gebet wirklich löschen?",
//       delete: "Löschen",

//       // Prayer viewer
//       loadingPrayer: "Gebet wird geladen...",
//       unableToLoadPrayer:
//         "Gebetsinhalt konnte nicht geladen werden. Bitte versuche es später erneut.",
//       notes: "Notizen",
//       source: "Quelle",
//       close: "Schließen",
//       transliteration: "Transliteration",
//       adjustFontSize: "Schriftgröße anpassen",
//       confirmBookmarkChange: "Lesezeichen ersetzen",
//       bookmarkReplaceQuestion:
//         "Du hast bereits ein Segment mit einem Lesezeichen versehen. Möchtest du es ersetzen?",
//       replace: "Ersetzen",

//       // Favorites
//       loadingFavorites: "Favoriten werden geladen...",
//       errorLoadingFavorites: "Fehler beim Laden der Favoriten",
//       noFavoritesYet: "Du hast noch keine Lieblingsgebete!",
//       addFavoritesHint:
//         "Tippe auf das Herz-Symbol bei einem Gebet, um es zu deinen Favoriten hinzuzufügen",

//       // Search (new strings)
//       searchPlaceholder: "Gebete suchen...",
//       errorSearching: "Fehler bei der Gebetssuche",
//       searching: "Suche läuft...",
//       recentSearches: "Letzte Suchen",
//       clear: "Löschen",
//       noResults: "Keine Ergebnisse",
//       tryDifferentSearch: "Versuche eine andere Suche",

//       // Days of week
//       days: {
//         short: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
//         full: [
//           "Montag",
//           "Dienstag",
//           "Mittwoch",
//           "Donnerstag",
//           "Freitag",
//           "Samstag",
//           "Sonntag",
//         ],
//       },

//       // Toast and alert messages
//       toast: {
//         // Success messages
//         contentUpdated: "Inhalte aktualisiert",
//         newContentAvailable: "Neue Inhalte sind jetzt verfügbar.",
//         favoriteAdded: "Gebet zu Favoriten hinzugefügt.",
//         dataLoaded: "Alle Inhalte wurden erfolgreich synchronisiert.",

//         // Error messages
//         error: "Fehler",
//         updateError: "Fehler bei der Aktualisierung",
//         contentLoadError: "Die neuen Inhalte konnten nicht geladen werden.",
//         favoriteAddError: "Gebet konnte nicht zu Favoriten hinzugefügt werden.",
//         favoriteRemoved: "Gebet aus Favoriten entfernt.",
//         favoriteRemoveError: "Gebet konnte nicht aus Favoriten entfernt werden",
//         favoritesLoadError: "Favoriten konnten nicht geladen werden.",
//         categoriesLoadError: "Kategorien konnten nicht geladen werden.",
//         prayersLoadError: "Gebete konnten nicht geladen werden.",
//         searchError: "Suche konnte nicht durchgeführt werden.",
//         latestPrayersError: "Aktuelle Gebete konnten nicht geladen werden.",
//         paypalLinkError: "PayPal-Link konnte nicht geladen werden.",
//         languagesLoadError: "Sprachen konnten nicht geladen werden.",
//         offlineMode: "Offline-Modus",
//         noConnection: "Keine Verbindung",
//         syncError: "Synchronisierungsfehler",
//         offlineModeMessage:
//           "Sie sind derzeit offline. Die bestehenden Inhalte werden angezeigt.",
//         noConnectionMessage:
//           "Sie sind offline und es sind keine Daten verfügbar. Bitte stellen Sie eine Internetverbindung her.",
//         syncErrorMessage:
//           "Die Daten konnten nicht synchronisiert werden. Bitte versuchen Sie es später erneut.",
//         updateContentError:
//           "Beim Aktualisieren der Inhalte ist ein Fehler aufgetreten.",
//       },
//       // RenderPrayer
//       bottomInformationRenderPrayer: "wird wie der buchstabe ausgesprochen",
//       lines: "Zeilen",

//       // Tasbih
//       TasbihFatima: "Tasbih Fatima Zahra (a.)",
//     },
//   },

//   // Arabic translation
//   AR: {
//     translation: {
//       // Core app translations
//       welcome: "السلام عليكم",
//       selectLanguage: "اختر لغتك المفضلة",
//       german: "ألمانية",
//       arabic: "عربية",
//       english: "إنجليزية",
//       continue: "استمر",
//       settings: "إعدادات",
//       language: "لغة",
//       theme: "سمة",
//       about: "حول",
//       home: "الرئيسية",
//       prayers: "الصلوات",
//       homeSubtitle: "ابحث عن السلام والتواصل من خلال الصلاة",

//       // Prayer categories
//       dua: "دعاء",
//       ziyarat: "زيارة",
//       salat: "صلاة",
//       munajat: "مناجاة",
//       tasbih: "تسبيح",
//       special: "خاصة",
//       names: "أسْماءُ الحُسْنَى",
//       // Home screen - Today's prayer
//       randomPrayer: "توصية",
//       readMore: "قراءة المزيد",
//       categories: "الفئات",

//       // Weekly calendar
//       weeklyToDo: "خطة الأسبوع",
//       addWeekly: "إضافة",
//       addForDay: "إضافة ل",
//       enterPrayer: "أدخل الصلاة...",
//       add: "إضافة",
//       cancel: "إلغاء",
//       noPrayersForDay: "لا توجد صلوات لهذا اليوم",
//       unDo: "الغاء الكل",
//       // Delete confirmation
//       confirmDelete: "تأكيد الحذف",
//       deleteQuestion: "هل أنت متأكد أنك تريد حذف هذه الصلاة؟",
//       delete: "حذف",

//       // Prayer viewer
//       loadingPrayer: "جاري تحميل الصلاة...",
//       unableToLoadPrayer:
//         "تعذر تحميل محتوى الصلاة. يرجى المحاولة مرة أخرى لاحقًا.",
//       notes: "ملاحظات",
//       source: "المصدر",
//       close: "إغلاق",
//       transliteration: "النقل الحرفي",
//       adjustFontSize: "تعديل حجم الخط",
//       confirmBookmarkChange: "استبدال الإشارة المرجعية",
//       bookmarkReplaceQuestion:
//         "لديك بالفعل جزء محدد بإشارة مرجعية. هل تريد استبداله؟",
//       replace: "استبدال",

//       // Favorites
//       loadingFavorites: "جاري تحميل المفضلة...",
//       errorLoadingFavorites: "خطأ في تحميل المفضلة",
//       noFavoritesYet: "ليس لديك أي صلوات مفضلة بعد!",
//       addFavoritesHint:
//         "انقر على رمز القلب على أي صلاة لإضافتها إلى المفضلة لديك",

//       // Search (new strings)
//       searchPlaceholder: "ابحث في الصلوات...",
//       errorSearching: "خطأ في البحث عن الصلوات",
//       searching: "جارٍ البحث...",
//       recentSearches: "عمليات البحث الأخيرة",
//       clear: "مسح",
//       noResults: "لا نتائج",
//       tryDifferentSearch: "حاول بحثًا مختلفًا",

//       // Days of week
//       days: {
//         short: ["إث", "ثل", "أر", "خم", "جم", "سب", "أح"],
//         full: [
//           "الإثنين",
//           "الثلاثاء",
//           "الأربعاء",
//           "الخميس",
//           "الجمعة",
//           "السبت",
//           "الأحد",
//         ],
//       },

//       // Toast and alert messages
//       toast: {
//         // Success messages
//         contentUpdated: "تم تحديث المحتوى",
//         newContentAvailable: "المحتوى الجديد متاح الآن.",
//         favoriteAdded: "تمت إضافة الصلاة إلى المفضلة.",
//         dataLoaded: "تمت مزامنة جميع المحتويات بنجاح.",

//         // Error messages
//         error: "خطأ",
//         updateError: "خطأ في التحديث",
//         contentLoadError: "تعذر تحميل المحتوى الجديد.",
//         favoriteAddError: "تعذر إضافة الصلاة إلى المفضلة.",
//         favoriteRemoved: "تمت إزالة الصلاة من المفضلة.",
//         favoriteRemoveError: "تعذر إزالة الصلاة من المفضلة.",
//         favoritesLoadError: "تعذر تحميل المفضلة.",
//         categoriesLoadError: "تعذر تحميل الفئات.",
//         prayersLoadError: "تعذر تحميل الصلوات.",
//         searchError: "تعذر إجراء البحث.",
//         latestPrayersError: "تعذر تحميل أحدث الصلوات.",
//         paypalLinkError: "تعذر تحميل رابط باي بال.",
//         languagesLoadError: "تعذر تحميل اللغات.",
//         offlineMode: "وضع عدم الاتصال",
//         noConnection: "لا يوجد اتصال",
//         syncError: "خطأ في المزامنة",
//         offlineModeMessage: "أنت حاليًا غير متصل. سيتم عرض المحتوى الموجود.",
//         noConnectionMessage:
//           "أنت غير متصل ولا توجد بيانات متاحة. يرجى الاتصال بالإنترنت.",
//         syncErrorMessage:
//           "تعذر مزامنة البيانات. يرجى المحاولة مرة أخرى لاحقًا.",
//         updateContentError: "حدث خطأ أثناء تحديث المحتوى.",
//       },
//       // RenderPrayer
//       bottomInformationRenderPrayer: "يُلفظ مثل الحرف ع",
//       lines: "الخطوط",

//       // Tasbih
//       TasbihFatima: "تسبيح فاطمة الزهراء (ع)",
//     },
//   },

//   // English translation
//   EN: {
//     translation: {
//       // Core app translations
//       welcome: "As-salamu alaykum",
//       selectLanguage: "Select your preferred language",
//       german: "German",
//       arabic: "Arabic",
//       english: "English",
//       continue: "Continue",
//       settings: "Settings",
//       language: "Language",
//       theme: "Theme",
//       about: "About",
//       home: "Home",
//       prayers: "Prayers",
//       homeSubtitle: "Find peace and connection through prayer",

//       // Prayer categories
//       dua: "Dua",
//       ziyarat: "Ziyarat",
//       salat: "Salat",
//       munajat: "Munajat",
//       tasbih: "tasbih",
//       special: "Special",
//       names: "Asma-ul-Husna",
//       // Home screen - Today's prayer
//       randomPrayer: "Recommendation",
//       readMore: "Read more",
//       categories: "Categories",

//       // Weekly calendar
//       weeklyToDo: "Weekly Schedule",
//       addWeekly: "Add",
//       addForDay: "Add for",
//       enterPrayer: "Enter prayer...",
//       add: "Add",
//       cancel: "Cancel",
//       noPrayersForDay: "No prayers for this day",
//       unDo: "Un-do all",

//       // Delete confirmation
//       confirmDelete: "Confirm Deletion",
//       deleteQuestion: "Are you sure you want to delete this prayer?",
//       delete: "Delete",

//       // Prayer viewer
//       loadingPrayer: "Loading prayer...",
//       unableToLoadPrayer:
//         "Unable to load prayer content. Please try again later.",
//       notes: "Notes",
//       source: "Source",
//       close: "Close",
//       transliteration: "Transliteration",
//       adjustFontSize: "Adjust Font Size",
//       confirmBookmarkChange: "Replace Bookmark",
//       bookmarkReplaceQuestion:
//         "You already have a bookmarked segment. Do you want to replace it?",
//       replace: "Replace",

//       // Favorites
//       loadingFavorites: "Loading favorites...",
//       errorLoadingFavorites: "Error loading favorites",
//       noFavoritesYet: "You don't have any favorite prayers yet!",
//       addFavoritesHint:
//         "Tap the heart icon on any prayer to add it to your favorites",

//       // Search (new strings)
//       searchPlaceholder: "Search prayers...",
//       errorSearching: "Error searching prayers",
//       searching: "Searching...",
//       recentSearches: "Recent Searches",
//       clear: "Clear",
//       noResults: "No results",
//       tryDifferentSearch: "Try a different search",

//       // Days of week
//       days: {
//         short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//         full: [
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//           "Sunday",
//         ],
//       },

//       // Toast and alert messages
//       toast: {
//         // Success messages
//         contentUpdated: "Content Updated",
//         newContentAvailable: "New content is now available.",
//         favoriteAdded: "Prayer added to favorites.",
//         dataLoaded: "All content successfully synchronized.",

//         // Error messages
//         error: "Error",
//         updateError: "Update Error",
//         contentLoadError: "Could not load new content.",
//         favoriteAddError: "Could not add prayer to favorites.",
//         favoriteRemoved: "Prayer removed from favorites.",
//         favoriteRemoveError: "Could not remove prayer from favorites.",
//         favoritesLoadError: "Could not load favorites.",
//         categoriesLoadError: "Could not load categories.",
//         prayersLoadError: "Could not load prayers.",
//         searchError: "Could not perform search.",
//         latestPrayersError: "Could not load latest prayers.",
//         paypalLinkError: "Could not load PayPal link.",
//         languagesLoadError: "Could not load languages.",
//         offlineMode: "Offline Mode",
//         noConnection: "No Connection",
//         syncError: "Synchronization Error",
//         offlineModeMessage:
//           "You are currently offline. Existing content will be displayed.",
//         noConnectionMessage:
//           "You are offline and no data is available. Please connect to the internet.",
//         syncErrorMessage:
//           "Data could not be synchronized. Please try again later.",
//         updateContentError: "An error occurred while updating content.",
//       },

//       // RenderPrayer
//       bottomInformationRenderPrayer: "is pronounced like the letter",
//       lines: "lines",

//       // Tasbih
//       TasbihFatima: "Tasbih Fatima Zahra (a.)",
//     },
//   },
// };

// // Initialize i18n
// i18n.use(initReactI18next).init({
//   resources,
//   lng: "DE", // Default language
//   fallbackLng: "DE",
//   interpolation: {
//     escapeValue: false,
//   },
//   react: {
//     useSuspense: false,
//   },
// });

// export default i18n;

// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Resource } from "i18next";

// Types for our translations
interface DayNamesType {
  short: string[];
  full: string[];
}

// Translations resources
const resources: Resource = {
  // German translation
  DE: {
    translation: {
      // Core app translations
      welcome: "As-salamu alaykum",
      selectLanguage: "Wähle deine bevorzugte Sprache",
      german: "Deutsch",
      arabic: "Arabisch",
      english: "Englisch",
      continue: "Fortfahren",
      settings: "Einstellungen",
      language: "Sprache",
      theme: "Thema",
      about: "Über",
      home: "Start",
      prayers: "Gebete",
      homeSubtitle: "Finde Frieden und Verbindung durch Gebet",

      // Prayer categories
      dua: "Dua",
      ziyarat: "Ziyarat",
      salat: "Salat",
      munajat: "Munajat",
      tasbih: "tasbih",
      special: "Speziell",
      names: "Asma-ul-Husna",
      // Home screen - Today's prayer
      randomPrayer: "Empfehlung",
      readMore: "Vollständig lesen",
      categories: "Kategorien",
      showAll: "Alle anzeigen",
      noPrayer: "Keine Gebete vorhanen",

      // Weekly calendar
      weeklyToDo: "Plan für die Woche",
      addWeekly: "Hinzufügen",
      addForDay: "Hinzufügen für",
      enterPrayer: "Gib das Gebet ein...",
      add: "Hinzufügen",
      cancel: "Abbrechen",
      noPrayersForDay: "Keine Gebete für diesen Tag",
      unDo: "Neustart",

      // Delete confirmation
      confirmDelete: "Löschen bestätigen",
      deleteQuestion: "Möchtest du dieses Gebet wirklich löschen?",
      delete: "Löschen",

      // Prayer viewer
      loadingPrayer: "Gebet wird geladen...",
      unableToLoadPrayer:
        "Gebetsinhalt konnte nicht geladen werden. Bitte versuche es später erneut.",
      notes: "Notizen",
      source: "Quelle",
      close: "Schließen",
      transliteration: "Transliteration",
      adjustFontSize: "Schriftgröße anpassen",
      confirmBookmarkChange: "Lesezeichen ersetzen",
      bookmarkReplaceQuestion:
        "Du hast bereits ein Segment mit einem Lesezeichen versehen. Möchtest du es ersetzen?",
      replace: "Ersetzen",

      // Favorites
      loadingFavorites: "Favoriten werden geladen...",
      errorLoadingFavorites: "Fehler beim Laden der Favoriten",
      noFavoritesYet: "Du hast noch keine Lieblingsgebete!",
      addFavoritesHint:
        "Tippe auf das Herz-Symbol bei einem Gebet, um es zu deinen Favoriten hinzuzufügen",

      // Search (new strings)
      searchPlaceholder: "Gebete suchen...",
      errorSearching: "Fehler bei der Gebetssuche",
      searching: "Suche läuft...",
      recentSearches: "Letzte Suchen",
      clear: "Löschen",
      noResults: "Keine Ergebnisse",
      tryDifferentSearch: "Versuche eine andere Suche",

      // Days of week
      days: {
        short: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
        full: [
          "Montag",
          "Dienstag",
          "Mittwoch",
          "Donnerstag",
          "Freitag",
          "Samstag",
          "Sonntag",
        ],
      },

      // Toast and alert messages
      toast: {
        // Success messages
        contentUpdated: "Inhalte aktualisiert",
        newContentAvailable: "Neue Inhalte sind jetzt verfügbar.",
        favoriteAdded: "Gebet zu Favoriten hinzugefügt.",
        dataLoaded: "Alle Inhalte wurden erfolgreich synchronisiert.",

        // Error messages
        error: "Fehler",
        updateError: "Fehler bei der Aktualisierung",
        contentLoadError: "Die neuen Inhalte konnten nicht geladen werden.",
        favoriteAddError: "Gebet konnte nicht zu Favoriten hinzugefügt werden.",
        favoriteRemoved: "Gebet aus Favoriten entfernt.",
        favoriteRemoveError: "Gebet konnte nicht aus Favoriten entfernt werden",
        favoritesLoadError: "Favoriten konnten nicht geladen werden.",
        categoriesLoadError: "Kategorien konnten nicht geladen werden.",
        prayersLoadError: "Gebete konnten nicht geladen werden.",
        searchError: "Suche konnte nicht durchgeführt werden.",
        latestPrayersError: "Aktuelle Gebete konnten nicht geladen werden.",
        paypalLinkError: "PayPal-Link konnte nicht geladen werden.",
        languagesLoadError: "Sprachen konnten nicht geladen werden.",
        offlineMode: "Offline-Modus",
        noConnection: "Keine Verbindung",
        syncError: "Synchronisierungsfehler",
        offlineModeMessage:
          "Sie sind derzeit offline. Die bestehenden Inhalte werden angezeigt.",
        noConnectionMessage:
          "Sie sind offline und es sind keine Daten verfügbar. Bitte stellen Sie eine Internetverbindung her.",
        syncErrorMessage:
          "Die Daten konnten nicht synchronisiert werden. Bitte versuchen Sie es später erneut.",
        updateContentError:
          "Beim Aktualisieren der Inhalte ist ein Fehler aufgetreten.",
      },
      // RenderPrayer
      bottomInformationRenderPrayer: "wird wie der buchstabe ausgesprochen",
      lines: "Zeilen",

      // Tasbih
      TasbihFatima: "Tasbih Fatima Zahra (a.)",

      // Additional UI translations
      freeMode: "Freier Modus",
      freeModeDescription: "Wähle irgendeinen Dhikr",
      setMaximumReps: "Maximale Wiederholungen einstellen:",
      resetCurrent: "Aktuelles zurücksetzen",
      resetAll: "Alle zurücksetzen",
      stepCompleteNext: "Schritt abgeschlossen! Nächster...",
      tap: "Tippen",
      totalDhikr: "Gesamter Dhikr:",
      completedText: "abgeschlossen ✓",

      // Dhikr names
      dhikrFree: "Frei",
      dhikrSubhanallah: "Subhanallah",
      dhikrAlhamdulillah: "Alhamdulillah",
      dhikrAllahuAkbar: "Allahu Akbar",
      dhikrLaIlahaIllallah: "La ilaha illallah",
      dhikrAstaghfirullah: "Astaghfirullah",

      // Navigation
      back: "Zurück",

       // FontSize
       fontsize:{
        small: "small",
        medium: "medium",
        large: "large"
      },
    },
  },

  // Arabic translation
  AR: {
    translation: {
      // Core app translations
      welcome: "السلام عليكم",
      selectLanguage: "اختر لغتك المفضلة",
      german: "ألمانية",
      arabic: "عربية",
      english: "إنجليزية",
      continue: "استمر",
      settings: "إعدادات",
      language: "لغة",
      theme: "سمة",
      about: "حول",
      home: "الرئيسية",
      prayers: "الصلوات",
      homeSubtitle: "ابحث عن السلام والتواصل من خلال الصلاة",

      // Prayer categories
      dua: "دعاء",
      ziyarat: "زيارة",
      salat: "صلاة",
      munajat: "مناجاة",
      tasbih: "تسبيح",
      special: "خاصة",
      names: "أسْماءُ الحُسْنَى",
      // Home screen - Today's prayer
      randomPrayer: "توصية",
      readMore: "قراءة المزيد",
      categories: "الفئات",
      showAll: "عرض الكل",
      noPrayer: "لا توجد صلوات",

      // Weekly calendar
      weeklyToDo: "خطة الأسبوع",
      addWeekly: "إضافة",
      addForDay: "إضافة ل",
      enterPrayer: "أدخل الصلاة...",
      add: "إضافة",
      cancel: "إلغاء",
      noPrayersForDay: "لا توجد صلوات لهذا اليوم",
      unDo: "الغاء الكل",
      // Delete confirmation
      confirmDelete: "تأكيد الحذف",
      deleteQuestion: "هل أنت متأكد أنك تريد حذف هذه الصلاة؟",
      delete: "حذف",

      // Prayer viewer
      loadingPrayer: "جاري تحميل الصلاة...",
      unableToLoadPrayer:
        "تعذر تحميل محتوى الصلاة. يرجى المحاولة مرة أخرى لاحقًا.",
      notes: "ملاحظات",
      source: "المصدر",
      close: "إغلاق",
      transliteration: "النقل الحرفي",
      adjustFontSize: "تعديل حجم الخط",
      confirmBookmarkChange: "استبدال الإشارة المرجعية",
      bookmarkReplaceQuestion:
        "لديك بالفعل جزء محدد بإشارة مرجعية. هل تريد استبداله؟",
      replace: "استبدال",
     

      // Favorites
      loadingFavorites: "جاري تحميل المفضلة...",
      errorLoadingFavorites: "خطأ في تحميل المفضلة",
      noFavoritesYet: "ليس لديك أي صلوات مفضلة بعد!",
      addFavoritesHint:
        "انقر على رمز القلب على أي صلاة لإضافتها إلى المفضلة لديك",

      // Search (new strings)
      searchPlaceholder: "ابحث في الصلوات...",
      errorSearching: "خطأ في البحث عن الصلوات",
      searching: "جارٍ البحث...",
      recentSearches: "عمليات البحث الأخيرة",
      clear: "مسح",
      noResults: "لا نتائج",
      tryDifferentSearch: "حاول بحثًا مختلفًا",

      // Days of week
      days: {
        short: ["إث", "ثل", "أر", "خم", "جم", "سب", "أح"],
        full: [
          "الإثنين",
          "الثلاثاء",
          "الأربعاء",
          "الخميس",
          "الجمعة",
          "السبت",
          "الأحد",
        ],
      },

      // Toast and alert messages
      toast: {
        // Success messages
        contentUpdated: "تم تحديث المحتوى",
        newContentAvailable: "المحتوى الجديد متاح الآن.",
        favoriteAdded: "تمت إضافة الصلاة إلى المفضلة.",
        dataLoaded: "تمت مزامنة جميع المحتويات بنجاح.",

        // Error messages
        error: "خطأ",
        updateError: "خطأ في التحديث",
        contentLoadError: "تعذر تحميل المحتوى الجديد.",
        favoriteAddError: "تعذر إضافة الصلاة إلى المفضلة.",
        favoriteRemoved: "تمت إزالة الصلاة من المفضلة.",
        favoriteRemoveError: "تعذر إزالة الصلاة من المفضلة.",
        favoritesLoadError: "تعذر تحميل المفضلة.",
        categoriesLoadError: "تعذر تحميل الفئات.",
        prayersLoadError: "تعذر تحميل الصلوات.",
        searchError: "تعذر إجراء البحث.",
        latestPrayersError: "تعذر تحميل أحدث الصلوات.",
        paypalLinkError: "تعذر تحميل رابط باي بال.",
        languagesLoadError: "تعذر تحميل اللغات.",
        offlineMode: "وضع عدم الاتصال",
        noConnection: "لا يوجد اتصال",
        syncError: "خطأ في المزامنة",
        offlineModeMessage: "أنت حاليًا غير متصل. سيتم عرض المحتوى الموجود.",
        noConnectionMessage:
          "أنت غير متصل ولا توجد بيانات متاحة. يرجى الاتصال بالإنترنت.",
        syncErrorMessage:
          "تعذر مزامنة البيانات. يرجى المحاولة مرة أخرى لاحقًا.",
        updateContentError: "حدث خطأ أثناء تحديث المحتوى.",
      },
      // RenderPrayer
      bottomInformationRenderPrayer: "يُلفظ مثل الحرف ع",
      lines: "الخطوط",

      // Tasbih
      TasbihFatima: "تسبيح فاطمة الزهراء (ع)",

      // Additional UI translations
      freeMode: "الوضع الحر",
      freeModeDescription: "اختر أي ذكر",
      setMaximumReps: "حدد الحد الأقصى للتكرار:",
      resetCurrent: "إعادة ضبط الحالية",
      resetAll: "إعادة ضبط الكل",
      stepCompleteNext: "الخطوة مكتملة! التالي...",
      tap: "اضغط",
      totalDhikr: "إجمالي الذكر:",
      completedText: "مكتمل ✓",

      // Dhikr names
      dhikrFree: "مجاني",
      dhikrSubhanallah: "Subhanallah",
      dhikrAlhamdulillah: "Alhamdulillah",
      dhikrAllahuAkbar: "Allahu Akbar",
      dhikrLaIlahaIllallah: "La ilaha illallah",
      dhikrAstaghfirullah: "Astaghfirullah",

      // Navigation
      back: "رجوع",

       // FontSize
       fontsizes:{
        small: "",
        medium: "medium",
        large: "large"
      },
    },
  },

  // English translation
  EN: {
    translation: {
      // Core app translations
      welcome: "As-salamu alaykum",
      selectLanguage: "Select your preferred language",
      german: "German",
      arabic: "Arabic",
      english: "English",
      continue: "Continue",
      settings: "Settings",
      language: "Language",
      theme: "Theme",
      about: "About",
      home: "Home",
      prayers: "Prayers",
      homeSubtitle: "Find peace and connection through prayer",

      // Prayer categories
      dua: "Dua",
      ziyarat: "Ziyarat",
      salat: "Salat",
      munajat: "Munajat",
      tasbih: "tasbih",
      special: "Special",
      names: "Asma-ul-Husna",

      // Home screen - Today's prayer
      randomPrayer: "Recommendation",
      readMore: "Read more",
      categories: "Categories",
      showAll: "Show All",
      noPrayer: "No prayers available",

      // Weekly calendar
      weeklyToDo: "Weekly Schedule",
      addWeekly: "Add",
      addForDay: "Add for",
      enterPrayer: "Enter prayer...",
      add: "Add",
      cancel: "Cancel",
      noPrayersForDay: "No prayers for this day",
      unDo: "Un-do all",

      // Delete confirmation
      confirmDelete: "Confirm Deletion",
      deleteQuestion: "Are you sure you want to delete this prayer?",
      delete: "Delete",

      // Prayer viewer
      loadingPrayer: "Loading prayer...",
      unableToLoadPrayer:
        "Unable to load prayer content. Please try again later.",
      notes: "Notes",
      source: "Source",
      close: "Close",
      transliteration: "Transliteration",
      adjustFontSize: "Adjust Font Size",
      confirmBookmarkChange: "Replace Bookmark",
      bookmarkReplaceQuestion:
        "You already have a bookmarked segment. Do you want to replace it?",
      replace: "Replace",

      // Favorites
      loadingFavorites: "Loading favorites...",
      errorLoadingFavorites: "Error loading favorites",
      noFavoritesYet: "You don't have any favorite prayers yet!",
      addFavoritesHint:
        "Tap the heart icon on any prayer to add it to your favorites",

      // Search (new strings)
      searchPlaceholder: "Search prayers...",
      errorSearching: "Error searching prayers",
      searching: "Searching...",
      recentSearches: "Recent Searches",
      clear: "Clear",
      noResults: "No results",
      tryDifferentSearch: "Try a different search",

      // Days of week
      days: {
        short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        full: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },

      // Toast and alert messages
      toast: {
        // Success messages
        contentUpdated: "Content Updated",
        newContentAvailable: "New content is now available.",
        favoriteAdded: "Prayer added to favorites.",
        dataLoaded: "All content successfully synchronized.",

        // Error messages
        error: "Error",
        updateError: "Update Error",
        contentLoadError: "Could not load new content.",
        favoriteAddError: "Could not add prayer to favorites.",
        favoriteRemoved: "Prayer removed from favorites.",
        favoriteRemoveError: "Could not remove prayer from favorites.",
        favoritesLoadError: "Could not load favorites.",
        categoriesLoadError: "Could not load categories.",
        prayersLoadError: "Could not load prayers.",
        searchError: "Could not perform search.",
        latestPrayersError: "Could not load latest prayers.",
        paypalLinkError: "Could not load PayPal link.",
        languagesLoadError: "Could not load languages.",
        offlineMode: "Offline Mode",
        noConnection: "No Connection",
        syncError: "Synchronization Error",
        offlineModeMessage:
          "You are currently offline. Existing content will be displayed.",
        noConnectionMessage:
          "You are offline and no data is available. Please connect to the internet.",
        syncErrorMessage:
          "Data could not be synchronized. Please try again later.",
        updateContentError: "An error occurred while updating content.",
      },
      // RenderPrayer
      bottomInformationRenderPrayer: "is pronounced like the letter",
      lines: "lines",

      // Tasbih
      TasbihFatima: "Tasbih Fatima Zahra (a.)",

      // Additional UI translations
      freeMode: "Free Mode",
      freeModeDescription: "Choose any dhikr",
      setMaximumReps: "Set Maximum Reps:",
      resetCurrent: "Reset Current",
      resetAll: "Reset All",
      stepCompleteNext: "Step complete! Next...",
      tap: "Tap",
      totalDhikr: "Total Dhikr:",
      completedText: "complete ✓",

      // Dhikr names
      dhikrFree: "Free",
      dhikrSubhanallah: "Subhanallah",
      dhikrAlhamdulillah: "Alhamdulillah",
      dhikrAllahuAkbar: "Allahu Akbar",
      dhikrLaIlahaIllallah: "La ilaha illallah",
      dhikrAstaghfirullah: "Astaghfirullah",

      // Navigation
      back: "Back",

      // FontSize
      fontsizes:{
      small: "صغير",
      medium: "واسطة",
      large: "كبير"
    },
  }
  },
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: "DE", // Default language
  fallbackLng: "DE",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
