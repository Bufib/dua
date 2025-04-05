import { getQuestionInternalURL } from "./initializeDatabase";
import { router } from "expo-router";

// Internal urls are the title (unique!) of the questions
const handleOpenInternallUrl = async (title: string) => {
  try {
    const question = await getQuestionInternalURL(title);
    if (!question) {
      console.log("Question not found for title:", title);
      return;
    }

    router.push({
      pathname: "/(question)",
      params: {
        category: question.category_name,
        subcategory: question.subcategory_name,
        questionId: question.id.toString(),
        questionTitle: question.title,
      },
    }); 
  } catch (error) {
    console.error("Error fetching question:", error);
  }
};

export default handleOpenInternallUrl;
