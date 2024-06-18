// src/components/ui/card.tsx
import React from "react";
import { cn } from "@/lib/utils"; // Функция для объединения классов

interface CardProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties; // Добавляем свойство style
  onClick?: () => void; // Добавляем свойство onClick
}

interface CardSectionProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, style, onClick }) => (
  <div className={cn("border rounded-lg shadow-sm p-4 bg-white cursor-pointer", className)} style={style} onClick={onClick}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardSectionProps> = ({ className, children }) => (
  <div className={cn("font-bold text-xl mb-2", className)}>{children}</div>
);

export const CardBody: React.FC<CardSectionProps> = ({ className, children }) => (
  <div className={cn("text-gray-700", className)}>{children}</div>
);

export const CardFooter: React.FC<CardSectionProps> = ({ className, children }) => (
  <div className={cn("mt-4", className)}>{children}</div>
);
