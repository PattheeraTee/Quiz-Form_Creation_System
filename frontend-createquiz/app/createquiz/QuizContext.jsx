// QuizContext.js
import React, { createContext, useState, useEffect } from "react";

export const QuizContext = createContext();

export const QuizProvider = ({ children, initialQuizTitle }) => {
  const [quizTitle, setQuizTitle] = useState(initialQuizTitle || "Untitled Form");

  useEffect(() => {
    if (initialQuizTitle) {
      setQuizTitle(initialQuizTitle); // อัปเดตค่า quizTitle เมื่อ initialQuizTitle เปลี่ยน
    }
  }, [initialQuizTitle]);

  return (
    <QuizContext.Provider value={{ quizTitle, setQuizTitle }}>
      {children}
    </QuizContext.Provider>
  );
};
