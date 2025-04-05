import { WeeklyTodos } from "./types";
// Default prayers for each day in multiple languages  
  export const defaultWeeklyTodos: { [key: string]: WeeklyTodos } = {
    de: {
      0: [{ id: 1, text: "Morgengebet", completed: false }],
      1: [{ id: 2, text: "Mittagsgebet", completed: false }],
      2: [{ id: 3, text: "Abendgebet", completed: false }],
      3: [{ id: 4, text: "Dankbarkeit üben", completed: false }],
      4: [{ id: 5, text: "Freitagsgebet", completed: false }],
      5: [{ id: 6, text: "Quran lesen", completed: false }],
      6: [{ id: 7, text: "Zeit mit Familie verbringen", completed: false }],
    },
    ar: {
      0: [{ id: 1, text: "صلاة الصبح", completed: false }],
      1: [{ id: 2, text: "صلاة الظهر", completed: false }],
      2: [{ id: 3, text: "صلاة المساء", completed: false }],
      3: [{ id: 4, text: "ممارسة الامتنان", completed: false }],
      4: [{ id: 5, text: "صلاة الجمعة", completed: false }],
      5: [{ id: 6, text: "قراءة القرآن", completed: false }],
      6: [{ id: 7, text: "قضاء وقت مع العائلة", completed: false }],
    },
    en: {
      0: [{ id: 1, text: "Morning prayer", completed: false }],
      1: [{ id: 2, text: "Midday prayer", completed: false }],
      2: [{ id: 3, text: "Evening prayer", completed: false }],
      3: [{ id: 4, text: "Practice gratitude", completed: false }],
      4: [{ id: 5, text: "Friday prayer", completed: false }],
      5: [{ id: 6, text: "Read Quran", completed: false }],
      6: [{ id: 7, text: "Spend time with family", completed: false }],
    },
  };