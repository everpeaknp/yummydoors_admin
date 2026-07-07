type ValidationIssue = {
  loc?: Array<string | number>;
  msg?: string;
};

function formatValidationIssue(issue: ValidationIssue): string {
  const path = Array.isArray(issue.loc) ? issue.loc.slice(1).join(".") : "";
  if (path && issue.msg) {
    return `${path}: ${issue.msg}`;
  }
  return issue.msg ?? "Validation error.";
}

export function extractErrorMessage(payload: unknown, fallback = "Request failed."): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidate = payload as {
    detail?: unknown;
    message?: unknown;
  };

  if (typeof candidate.detail === "string" && candidate.detail.trim()) {
    return candidate.detail;
  }

  if (Array.isArray(candidate.detail) && candidate.detail.length > 0) {
    return candidate.detail
      .map((issue) => formatValidationIssue(issue as ValidationIssue))
      .join(" ");
  }

  if (typeof candidate.message === "string" && candidate.message.trim()) {
    return candidate.message;
  }

  return fallback;
}
