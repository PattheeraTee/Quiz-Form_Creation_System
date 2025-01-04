// QuizContext.js
import React, { createContext, useState, useEffect } from "react";

export const QuizContext = createContext();

export const QuizProvider = ({ children, initialQuizTitle, initialPrimaryColor }) => {
  const [quizTitle, setQuizTitle] = useState(
    initialQuizTitle || "Untitled Form"
  );
  const [primaryColor, setPrimaryColor] = useState(
    initialPrimaryColor || "#FFFFFF"
  );

  useEffect(() => {
    if (initialQuizTitle) {
      setQuizTitle(initialQuizTitle); // อัปเดตค่า quizTitle เมื่อ initialQuizTitle เปลี่ยน
    }
  }, [initialQuizTitle]);

  useEffect(() => {
    if (initialPrimaryColor) {
      setPrimaryColor(initialPrimaryColor); // อัปเดตค่า primaryColor เมื่อ initialPrimaryColor เปลี่ยน
    }
  }, [initialPrimaryColor]);

  return (
    <QuizContext.Provider
      value={{ quizTitle, setQuizTitle, primaryColor, setPrimaryColor }}
    >
      {children}
    </QuizContext.Provider>
  );
};
