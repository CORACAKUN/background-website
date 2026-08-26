const owner = process.env.GITHUB_OWNER || "CORACAKUN";
const repo = process.env.GITHUB_REPO || "background-website";
const siteBranch = process.env.GITHUB_BRANCH || "main";
const branch = process.env.GITHUB_DATA_BRANCH || "stats-data";
const token = process.env.GITHUB_TOKEN;

function jsonResponse(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function requireGitHubToken() {
  if (!token) {
    const error = new Error("Missing GITHUB_TOKEN environment variable.");
    error.statusCode = 500;
    throw error;
  }
}

function fileUrl(filePath) {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
}

function refUrl(branchName) {
  return `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branchName}`;
}

function encodeBase64(value) {
  return Buffer.from(JSON.stringify(value, null, 2) + "\n", "utf8").toString("base64");
}

function decodeBase64(value) {
  return JSON.parse(Buffer.from(value, "base64").toString("utf8"));
}

async function readJsonFile(filePath, fallback) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "fields-background-api",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${fileUrl(filePath)}?ref=${branch}`, {
    headers,
  });
  if (response.status === 404) {
    return {
      data: fallback,
      sha: undefined,
    };
  }
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }
  const body = await response.json();
  return {
    data: decodeBase64(body.content),
    sha: body.sha,
  };
}

async function ensureDataBranch() {
  requireGitHubToken();
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "fields-background-api",
  };
  const existing = await fetch(refUrl(branch), {
    headers,
  });
  if (existing.ok) return;
  if (existing.status !== 404) {
    const message = await existing.text();
    const error = new Error(message);
    error.statusCode = existing.status;
    throw error;
  }
  const source = await fetch(refUrl(siteBranch), {
    headers,
  });
  if (!source.ok) {
    const message = await source.text();
    const error = new Error(message);
    error.statusCode = source.status;
    throw error;
  }
  const sourceRef = await source.json();
  const created = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: sourceRef.object.sha,
    }),
  });
  if (!created.ok && created.status !== 422) {
    const message = await created.text();
    const error = new Error(message);
    error.statusCode = created.status;
    throw error;
  }
}

async function writeJsonFile(filePath, data, message, sha) {
  requireGitHubToken();
  await ensureDataBranch();
  const body = {
    message,
    content: encodeBase64(data),
    branch,
  };
  if (sha) body.sha = sha;
  const response = await fetch(fileUrl(filePath), {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "fields-background-api",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }
  return response.json();
}

function getAdminToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  const url = new URL(req.url, "http://localhost");
  return url.searchParams.get("token") || "";
}

function requireAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || getAdminToken(req) !== expected) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
}

function cleanText(value, maxLength = 180) {
  return String(value || "").slice(0, maxLength);
}

function cleanSlug(value) {
  return cleanText(value, 80).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 20000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      }
      catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

module.exports = {
  branch,
  cleanSlug,
  cleanText,
  jsonResponse,
  readJsonBody,
  readJsonFile,
  requireAdmin,
  writeJsonFile,
};
