import React from 'react';

export interface User {
  name: string;
  email: string;
  age: number;
  parentEmail: string;
  photoURL: string;
  isProfileComplete: boolean;
  isAdmin?: boolean;
}

export interface IqraLevel {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export enum AppState {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  PROFILE_SETUP = 'PROFILE_SETUP',
  PROFILE_VIEW = 'PROFILE_VIEW',
  MENU = 'MENU',
  SUBMENU = 'SUBMENU',
  LEVEL = 'LEVEL',
  PRACTICE = 'PRACTICE',
  QUIZ = 'QUIZ'
}
