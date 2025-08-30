import { Directory } from "../types";

export const defaultData: Directory = {
  name: "/",
  type: "directory",
  fullPath: "/",
  content: [
    {
      name: "README.md",
      type: "file",
      fullPath: "/README.md",
      content: "Welcome to zk-terminal v1.0",
    },
    {
      name: "projects",
      type: "directory",
      fullPath: "/projects",
      content: [],
    },
  ],
};

export const loadData = (): Directory => {
  if (typeof window === "undefined") {
    return defaultData;
  }

  const data = localStorage.getItem("data");
  if (!data) {
    localStorage.setItem("data", JSON.stringify(defaultData));
    return defaultData;
  }

  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem("data", JSON.stringify(defaultData));
    return defaultData;
  }
};

export const saveData = (data: Directory): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("data", JSON.stringify(data));
  }
};

export const resetData = (): Directory => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("data");
  }
  return defaultData;
};
