// Accents must be folded before stripping non-ASCII, otherwise Portuguese
// titles turn into slugs like "intelig-ncia-artificial".
export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function listExistingPostFiles({ octokit, owner, repo, ref }) {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: 'posts', ref });
    if (Array.isArray(data)) {
      return data.map((file) => file.name);
    }
  } catch (e) {
    console.warn('[cron] could not fetch existing posts list:', e.message);
  }
  return [];
}

// Shared branch → commit → PR sequence used by every generator route.
// Each route supplies its own branch prefix and PR copy so the pipelines
// stay easy to tell apart in the PR list, while the GitHub mechanics
// (dated-filename dedupe, blob-sha safety net) live in exactly one place.
export async function publishPostAsPR({
  octokit,
  owner,
  repo,
  defaultBranch,
  title,
  cleanSlug,
  existingFiles,
  bodyContent,
  branchPrefix,
  commitMessage,
  prTitle,
  prBodyExtra,
}) {
  const todayDate = new Date().toISOString().split('T')[0];
  // Reusing a slug would make createOrUpdateFileContents fail with a 422
  // ("sha wasn't supplied"), so a repeated topic becomes a dated variant.
  const fileName = existingFiles.includes(`${cleanSlug}.md`)
    ? `${cleanSlug}-${todayDate}.md`
    : `${cleanSlug}.md`;
  const filePath = `posts/${fileName}`;

  const fullMarkdownContent = `---
title: '${title.replace(/'/g, "''")}'
date: '${todayDate}'
---

${bodyContent}
`;

  const { data: mainRef } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });
  const mainSha = mainRef.object.sha;

  const newBranchName = `${branchPrefix}-${cleanSlug}-${Date.now()}`;
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${newBranchName}`,
    sha: mainSha,
  });

  // Safety net for when the existing-posts listing above failed: GitHub
  // rejects a write to an existing path unless the current blob sha is sent.
  let existingSha;
  try {
    const { data: existingFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: newBranchName,
    });
    if (!Array.isArray(existingFile)) {
      existingSha = existingFile.sha;
    }
  } catch (e) {
    // 404 means the path is free, which is the expected case
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: commitMessage,
    content: Buffer.from(fullMarkdownContent, 'utf-8').toString('base64'),
    branch: newBranchName,
    ...(existingSha ? { sha: existingSha } : {}),
  });

  const { data: pr } = await octokit.pulls.create({
    owner,
    repo,
    title: prTitle,
    head: newBranchName,
    base: defaultBranch,
    body: `${prBodyExtra}

---

#### Resumo / Prévia:
${bodyContent.substring(0, 300)}...

---
*Revise o conteúdo e clique em **Merge pull request** para publicar no Vercel.*`,
  });

  return { pr, fileName, branch: newBranchName };
}
