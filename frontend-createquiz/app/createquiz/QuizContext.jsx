import React, { createContext, useState } from "react";

// สร้าง Context
export const QuizContext = createContext();

// Provider Component
export const QuizProvider = ({ children, initialQuizTitle }) => {
  const [quizTitle, setQuizTitle] = useState(initialQuizTitle || "Untitled Form กกกก");

  return (
    <QuizContext.Provider value={{ quizTitle, setQuizTitle }}>
      {children}
    </QuizContext.Provider>
  );
};
