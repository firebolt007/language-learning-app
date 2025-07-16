/**
 * @file Defines the core data structures for the application.
 */

export interface VocabularyEntry {
  id: string; // A unique identifier, e.g., the word itself in lowercase
  word: string; // The selected word or phrase
  context: string; // The original sentence where the word was found
  explanation: string; // Explanation of the word from the LLM
  translation: string; // Translation of the word from the LLM
  addedAt: number; // Timestamp when the word was added
  tags?: string[]; // List of tags for categorization, can be user-defined or LLM-generated.
                   // Supports a hierarchical structure, e.g., 'topic#subtopic'.
}

export interface Article {
  id: string; // unique (e.g. uuid or normalized title)
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}