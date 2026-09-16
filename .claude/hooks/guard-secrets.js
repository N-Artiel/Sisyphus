#!/usr/bin/env node
// PreToolUse hook: blocks reading .env files outright, and forces a
// confirmation before any command that touches real Supabase credentials
// or the linked cloud database.

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const toolName = input.tool_name;
  const toolInput = input.tool_input || {};

  const respond = (permissionDecision, reason) => {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision,
        permissionDecisionReason: reason,
      },
    }));
    process.exit(0);
  };

  // Block any direct read/edit of an .env-style file, whichever tool is used.
  if (["Read", "Edit", "Grep", "NotebookEdit"].includes(toolName)) {
    const filePath = toolInput.file_path || toolInput.path || toolInput.notebook_path || "";
    if (/\.env(\.[A-Za-z0-9_-]+)?$/.test(filePath)) {
      respond("deny", `Reading/editing "${filePath}" is blocked — .env files may hold live credentials.`);
      return;
    }
  }

  if (toolName === "Bash") {
    const command = toolInput.command || "";

    // Block shell commands whose whole purpose is printing/opening .env content.
    if (/\.env(\.[A-Za-z0-9_-]+)?\b/.test(command) && /\b(cat|less|more|head|tail|grep|vi|vim|nano|open|code|pbcopy)\b/.test(command)) {
      respond("deny", "This command reads from a .env file — blocked to keep credentials out of tool output.");
      return;
    }

    // Force an explicit confirmation before anything that touches the real
    // Supabase project or its credentials directly.
    const sensitive = [
      /supabase\s+db\s+push/,
      /supabase\s+db\s+reset/,
      /supabase\s+link/,
      /supabase\s+login/,
      /\bpsql\b/,
      /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET|service_role/i,
    ];
    if (sensitive.some((re) => re.test(command))) {
      respond("ask", "This command touches Supabase credentials or the linked cloud database directly — confirm before running.");
      return;
    }
  }

  // No decision: fall through to the normal permission rules in settings.json.
  process.exit(0);
});
