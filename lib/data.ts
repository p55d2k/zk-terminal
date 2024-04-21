export interface Directory {
  name: string;
  type: "directory";
  fullPath: string;
  content: (Directory | File)[];
}

export interface File {
  name: string;
  type: "file";
  fullPath: string;
  content: string;
}

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

export const handleData = (): Directory => {
  const data = localStorage.getItem("data");
  if (!data) {
    localStorage.setItem("data", JSON.stringify(defaultData));
  }

  return data ? JSON.parse(data) : defaultData;
};

export const getDirectoryFromName = (fullPath: string): Directory | Error => {
  const data = handleData();

  // go thru each dir in data, and return the one that matches fullPath
  const dirs = fullPath.split("/").filter((dir) => dir !== "");
  let currentDir = data;

  for (const dir of dirs) {
    const foundDir = currentDir.content.find((content) => content.name === dir);

    if (!foundDir) {
      return new Error(`directory not found: ${fullPath}`);
    }

    if (foundDir.type !== "directory") {
      return new Error(`not a directory: ${fullPath}`);
    }

    currentDir = foundDir as Directory;
  }

  return currentDir;
};

export const getContentFromDirectoryName = (
  fullPath: string
): (Directory | File)[] | Error => {
  const directory = getDirectoryFromName(fullPath);

  if (directory instanceof Error) {
    return directory;
  }

  return directory.content;
};

export const listDirectory = (currentDir: string): string => {
  const dirData = getContentFromDirectoryName(currentDir);

  if (dirData instanceof Error) {
    return "error: " + dirData.message;
  }

  return dirData.map((content) => content.name).join(" ");
};

export const changeDirectory = (
  newDir: string,
  currentDir: string,
  setCurrentDir: (dir: string) => void
): Error | "sucess" => {
  if (!newDir || newDir === "/" || newDir === "~" || newDir === "") {
    setCurrentDir("/");
    return "sucess";
  }

  if (newDir === ".." || newDir === "../") {
    const dirs = currentDir.split("/").filter((dir) => dir !== "");
    setCurrentDir("/" + dirs.slice(0, dirs.length - 1).join("/"));
    return "sucess";
  }

  const dirData = getContentFromDirectoryName(currentDir);

  if (dirData instanceof Error) {
    return dirData;
  }

  const foundDir = dirData.find((content) => content.name === newDir);

  if (!foundDir) {
    return new Error(`directory not found: ${newDir}`);
  }

  if (foundDir.type !== "directory") {
    return new Error(`not a directory: ${newDir}`);
  }

  setCurrentDir(foundDir.fullPath);
  return "sucess";
};

export const makeDirectory = (
  newDirName: string,
  currentDir: string
): Error | "sucess" => {
  if (!newDirName) {
    return new Error("missing directory name");
  }

  const dirData = getContentFromDirectoryName(currentDir);

  if (dirData instanceof Error) {
    return dirData;
  }

  const foundDir = dirData.find((content) => content.name === newDirName);

  if (foundDir) {
    return new Error(`directory already exists: ${newDirName}`);
  }

  dirData.push({
    name: newDirName,
    type: "directory",
    fullPath: `${currentDir.slice(1)}/${newDirName}`,
    content: [],
  });

  const data = handleData();

  const dirs = currentDir.split("/").filter((dir) => dir !== "");
  let currentDirData = data;

  for (const dir of dirs) {
    const foundDir = currentDirData.content.find(
      (content) => content.name === dir
    ) as Directory;

    currentDirData = foundDir;
  }

  currentDirData.content = dirData;

  localStorage.setItem("data", JSON.stringify(currentDirData));
  return "sucess";
};
