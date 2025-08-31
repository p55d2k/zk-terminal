import { CommandResult, CommandContext } from "../../types";
import { writeFileUnsafe } from "../../filesystem/operations";
import { makeDirectory } from "../../filesystem";
import { pathJoin } from "../../utils";

interface WgetOptions {
  mirror: boolean;
  convertLinks: boolean;
  pageRequisites: boolean;
  noParent: boolean;
  outputDirectory?: string;
  maxFiles?: number;
}

function parseWgetArgs(args: string[]): { options: WgetOptions; url: string } {
  const options: WgetOptions = {
    mirror: false,
    convertLinks: false,
    pageRequisites: false,
    noParent: false,
    maxFiles: 100, // Default limit
  };

  let url = "";
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === "--mirror" || arg === "-m") {
      options.mirror = true;
      // Mirror implies convert-links, page-requisites, and no-parent
      options.convertLinks = true;
      options.pageRequisites = true;
      options.noParent = true;
    } else if (arg === "--convert-links" || arg === "-k") {
      options.convertLinks = true;
    } else if (arg === "--page-requisites" || arg === "-p") {
      options.pageRequisites = true;
    } else if (arg === "--no-parent" || arg === "-np") {
      options.noParent = true;
    } else if (arg === "--directory" || arg === "-P") {
      i++;
      if (i < args.length) {
        options.outputDirectory = args[i];
      }
    } else if (arg === "--max-files" || arg === "-n") {
      i++;
      if (i < args.length) {
        const maxFiles = parseInt(args[i]);
        if (!isNaN(maxFiles) && maxFiles > 0) {
          options.maxFiles = maxFiles;
        }
      }
    } else if (!arg.startsWith("-")) {
      url = arg;
      break;
    }
    i++;
  }

  return { options, url };
}

async function downloadResource(
  url: string,
  localPath: string,
  context: CommandContext
): Promise<boolean> {
  try {
    const apiUrl = `/api/networking/wget?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (data.success) {
      // Create directory if it doesn't exist
      const dirPath = localPath.substring(0, localPath.lastIndexOf("/"));
      if (dirPath && dirPath !== "/") {
        const dirResult = makeDirectory(dirPath, "/");
        if (dirResult instanceof Error) {
          console.error(
            `Failed to create directory ${dirPath}: ${dirResult.message}`
          );
        }
      }

      const writeResult = writeFileUnsafe(localPath, data.content);
      if (writeResult instanceof Error) {
        return false;
      }
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

function extractLinks(
  html: string,
  baseUrl: string
): { hrefs: string[]; srcs: string[] } {
  const hrefs: string[] = [];
  const srcs: string[] = [];

  // More comprehensive regex patterns for modern HTML
  const patterns = [
    /href=["']([^"']+)["']/gi,
    /href=([^>\s]+)/gi,
    /src=["']([^"']+)["']/gi,
    /src=([^>\s]+)/gi,
    /data-src=["']([^"']+)["']/gi,
    /data-lazy-src=["']([^"']+)["']/gi,
    /data-original=["']([^"']+)["']/gi,
  ];

  // Extract all href attributes (links, stylesheets, etc.)
  for (const pattern of patterns.slice(0, 2)) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1].trim();
      // Remove quotes if present
      url = url.replace(/^["']|["']$/g, "");
      if (
        url &&
        !url.startsWith("#") &&
        !url.startsWith("javascript:") &&
        !url.startsWith("mailto:")
      ) {
        hrefs.push(url);
      }
    }
  }

  // Extract all src attributes (images, scripts, etc.)
  for (const pattern of patterns.slice(2)) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1].trim();
      // Remove quotes if present
      url = url.replace(/^["']|["']$/g, "");
      if (url && !url.startsWith("data:") && !url.startsWith("javascript:")) {
        srcs.push(url);
      }
    }
  }

  // Remove duplicates
  const uniqueHrefs = Array.from(new Set(hrefs));
  const uniqueSrcs = Array.from(new Set(srcs));

  return { hrefs: uniqueHrefs, srcs: uniqueSrcs };
}

function resolveUrl(url: string, baseUrl: string): string {
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function getLocalPath(
  url: string,
  baseUrl: string,
  outputDir: string,
  context: CommandContext
): string {
  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);

    // Check if the URL is from the same domain as the base URL
    // Handle cases where baseUrl might be www.google.com and url might be google.com or vice versa
    const urlDomain = urlObj.hostname.replace(/^www\./, "");
    const baseDomain = baseUrlObj.hostname.replace(/^www\./, "");

    if (urlDomain !== baseDomain) {
      return "";
    }

    let relativePath = urlObj.pathname;
    if (relativePath.startsWith("/")) {
      relativePath = relativePath.substring(1);
    }

    if (!relativePath) {
      relativePath = "index.html";
    }

    const fullPath = outputDir
      ? pathJoin(outputDir, relativePath)
      : pathJoin(context.currentDir, relativePath);
    return fullPath;
  } catch (error) {
    return "";
  }
}

async function mirrorWebsite(
  baseUrl: string,
  options: WgetOptions,
  context: CommandContext,
  output: (text: string) => void
): Promise<string[]> {
  const visited = new Set<string>();
  const queue: string[] = [baseUrl];
  const baseDomain = new URL(baseUrl).hostname;
  const maxFiles = options.maxFiles || 100;
  let downloadedCount = 0;
  const downloadedFiles: string[] = [];

  output(`Starting mirror of ${baseUrl} (max ${maxFiles} files)`);

  while (queue.length > 0 && downloadedCount < maxFiles) {
    const currentUrl = queue.shift()!;
    if (visited.has(currentUrl)) continue;

    visited.add(currentUrl);
    output(`Processing: ${currentUrl}`);

    try {
      const response = await fetch(currentUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ZK-Terminal/1.0)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        output(`Failed to fetch ${currentUrl}: ${response.status}`);
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      const isHtml = contentType.includes("text/html");

      // Download the current resource
      const localPath = getLocalPath(
        currentUrl,
        baseUrl,
        options.outputDirectory || "",
        context
      );
      if (localPath) {
        const success = await downloadResource(currentUrl, localPath, context);
        if (success) {
          downloadedCount++;
          downloadedFiles.push(localPath);
          output(
            `Downloaded: ${localPath} (${downloadedCount}/${maxFiles} files)`
          );
        }
      }

      if (isHtml) {
        const html = await response.text();
        const links = extractLinks(html, currentUrl);

        // Combine hrefs and srcs for processing
        const allLinks = [
          ...links.hrefs,
          ...(options.pageRequisites ? links.srcs : []),
        ];

        // Filter and prioritize links
        const filteredLinks = allLinks
          .filter((link) => {
            try {
              const linkUrl = new URL(link, currentUrl);
              // Same domain check
              if (linkUrl.hostname !== baseDomain) return false;
              // No parent check
              if (
                options.noParent &&
                !linkUrl.pathname.startsWith(
                  new URL(currentUrl).pathname
                    .split("/")
                    .slice(0, -1)
                    .join("/") + "/"
                )
              ) {
                return false;
              }
              // Skip already visited
              return !visited.has(linkUrl.href);
            } catch {
              return false;
            }
          })
          .slice(0, 20); // Limit links per page

        // Prioritize HTML pages, then important assets
        const prioritizedLinks = filteredLinks.sort((a, b) => {
          const aIsHtml =
            a.endsWith(".html") || a.endsWith("/") || !a.includes(".");
          const bIsHtml =
            b.endsWith(".html") || b.endsWith("/") || !b.includes(".");
          if (aIsHtml && !bIsHtml) return -1;
          if (!aIsHtml && bIsHtml) return 1;
          return 0;
        });

        queue.push(...prioritizedLinks);
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      output(`Error processing ${currentUrl}: ${error}`);
    }
  }

  output(`Mirror complete. Downloaded ${downloadedCount} files.`);
  return downloadedFiles;
}

export async function handleCurl(args: string[]): Promise<CommandResult> {
  if (args.length < 1) {
    return {
      success: false,
      output: "curl: missing URL\nUsage: curl [options] <URL>",
    };
  }

  const url = args[args.length - 1];

  try {
    const apiUrl = `/api/networking/curl?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        output: `curl: ${errorData.error}`,
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        output: data.content,
      };
    } else {
      return {
        success: false,
        output: `curl: ${data.error}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `curl: Failed to fetch ${url}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function handleWget(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  const { options, url: rawUrl } = parseWgetArgs(args);

  if (!rawUrl) {
    return {
      success: false,
      output:
        "wget: missing URL\nUsage: wget [options] <URL>\n\nOptions:\n  -m, --mirror                    mirror website\n  -k, --convert-links             convert links in HTML files\n  -p, --page-requisites           download page requisites\n  -np, --no-parent                don't ascend to parent directory\n  -P, --directory <dir>           save files to <dir>\n  -n, --max-files <num>           maximum number of files to download (default: 100)",
    };
  }

  const url = rawUrl;

  // Handle mirror mode
  if (options.mirror) {
    try {
      console.log(`Starting mirror of ${url}...`);
      const downloadedFiles = await mirrorWebsite(
        url,
        options,
        context,
        (text: string) => console.log(text)
      );

      return {
        success: true,
        output: `Mirror completed successfully!\nDownloaded ${
          downloadedFiles.length
        } files:\n${downloadedFiles.map((f: string) => `  ${f}`).join("\n")}`,
      };
    } catch (error) {
      return {
        success: false,
        output: `wget: Mirror failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  // Original single-file download logic
  try {
    const apiUrl = `/api/networking/wget?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        output: `wget: ${errorData.error}`,
      };
    }

    const data = await response.json();

    if (data.success) {
      // Extract filename from URL
      const urlObj = new URL(data.url);
      let filename = urlObj.pathname.split("/").pop() || "index.html";

      // If no extension and it's likely HTML, add .html
      if (!filename.includes(".") && data.contentType?.includes("text/html")) {
        filename = "index.html";
      }

      // Create full path in current directory or specified directory
      const baseDir = options.outputDirectory || context.currentDir;
      const filePath =
        baseDir === "/" ? `/${filename}` : `${baseDir}/${filename}`;

      // Save file to filesystem
      const writeResult = writeFileUnsafe(filePath, data.content);

      if (writeResult instanceof Error) {
        return {
          success: false,
          output: `wget: Failed to save file ${filename}: ${writeResult.message}`,
        };
      }

      return {
        success: true,
        output: `--${new Date().toISOString().split("T")[0]} ${
          new Date().toTimeString().split(" ")[0]
        }--  ${data.url}\nResolving ${
          urlObj.hostname
        }... connected.\nHTTP request sent, awaiting response... ${
          data.status
        } ${data.statusText}\nLength: ${data.contentLength} [${
          data.contentType
        }]\nSaving to: '${filename}'\n\n${
          data.contentLength
        }  100%  [===================>] ${
          data.contentLength
        }  --.-KB/s    in 0.001s\n\n${new Date().toISOString().split("T")[0]} ${
          new Date().toTimeString().split(" ")[0]
        } (${data.contentLength} B/s) - '${filename}' saved [${
          data.contentLength
        }]`,
      };
    } else {
      return {
        success: false,
        output: `wget: ${data.error}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `wget: Failed to download ${url}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function handleApi(args: string[]): Promise<CommandResult> {
  if (args.length < 2) {
    return {
      success: false,
      output: "api: missing method or URL\nUsage: api <method> <URL> [data]",
    };
  }

  const method = args[0].toUpperCase();
  const url = args[1];
  const dataArg = args.slice(2).join(" ");

  let data = null;
  if (dataArg) {
    try {
      data = JSON.parse(dataArg);
    } catch (parseError) {
      return {
        success: false,
        output: `api: Invalid JSON data: ${dataArg}`,
      };
    }
  }

  try {
    const response = await fetch("/api/networking/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method,
        url,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        output: `api: ${errorData.error}`,
      };
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        output: `HTTP ${result.status} ${result.statusText}\n${JSON.stringify(
          result.data,
          null,
          2
        )}`,
      };
    } else {
      return {
        success: false,
        output: `api: ${result.error}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `api: Failed to make ${method} request to ${url}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function handleWs(args: string[]): Promise<CommandResult> {
  if (args.length < 1) {
    return {
      success: false,
      output: "ws: missing URL\nUsage: ws <WebSocket URL>",
    };
  }

  const url = args[0];

  try {
    const ws = new WebSocket(url);

    return new Promise((resolve) => {
      ws.onopen = () => {
        resolve({
          success: true,
          output: `WebSocket connection to ${url} established.`,
        });
        ws.close();
      };

      ws.onerror = (error) => {
        resolve({
          success: false,
          output: `ws: Failed to connect to ${url}: ${error}`,
        });
      };
    });
  } catch (error) {
    return {
      success: false,
      output: `ws: Failed to create WebSocket connection: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
